import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import fetch from "node-fetch";
import { client as db } from "./db.js";
import { v2 as cloudinary } from "cloudinary";

// Setting up Cloudianry to upload images
cloudinary.config({
  cloud_name: "dcylbajel",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Whatsapp-Web.js initialization
const client = new Client({
  puppeteer: {
    headless: true,
  },
});

//Generates QR Code in the terminal
client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });

  if (global.io) {
    global.io.emit("qr_code", {
      qr: qr,
      timestamp: new Date().toISOString(),
    });
    console.log("Emitted QR code to frontend clients");
  }
});

//Notifies us when the client is ready
client.on("ready", () => {
  console.log("✅ WhatsApp client is ready!");

  if (global.io) {
    global.io.emit("whatsapp_ready", {
      status: "connected",
      timestamp: new Date().toISOString(),
    });
    console.log("📡 Emitted WhatsApp ready status to frontend");
  }
});

// Keeping track of last inserted listing ID to associate images as needed
let lastInsertedListingId = null;
const pendingListings = new Map();

// Whatsapp message handler
client.on("message", async (msg) => {
  const chatId = msg.from;
  const chat = await msg.getChat();

  // // Log all messages for debugging
  // console.log(
  //   `📱 Message received from: ${chat.name || "Unknown"} (${
  //     chat.isGroup ? "Group" : "Individual"
  //   })`
  // );
  // console.log(`📝 Message body: ${msg.body}`);

  // Chat groups to extract the listings from
  const TARGET_GROUPS = ["Real Estate Listings"];

  // Function to check if a group name satisfies the condition
  const isRealEstateGroup = (groupName) => {
    const lowerName = groupName.toLowerCase();
    return (
      lowerName.includes("real estate") ||
      lowerName.includes("property") ||
      lowerName.includes("listing") ||
      TARGET_GROUPS.includes(groupName)
    );
  };

  // Skip if not a group
  if (!chat.isGroup) {
    return;
  }

  // Check if it's a real estate related group
  if (!isRealEstateGroup(chat.name)) {
    return;
  }

  console.log(`Processing message from target group: ${chat.name}`);

  // //Test message
  // if (msg.body === "ping") {
  //   msg.reply("pong");
  //   return;
  // }

  // Identifies the listings
  if (
    msg.body &&
    (msg.body.toLowerCase().includes("bhk") ||
      msg.body.toLowerCase().includes("rent"))
  ) {
    console.log("🏠 Real estate listing detected! Processing...");

    //Include within a promise, so that the images are processed only after the listing has been added to the database
    const listingPromise = (async () => {
      try {
        console.log("🔄 Sending message to AI extraction service...");
        const res = await fetch("http://localhost:3001/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: msg.body, chatName: chat.name }),
        });

        if (!res.ok) {
          const raw = await res.text();
          console.error("Error:", res.status, contentType, raw.slice(0, 500));
          throw new Error(`extract failed with ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ AI extraction successful:", data);

        const result = JSON.parse(data.result);
        console.log("📊 Parsed result:", result);

        const insertQuery = `
  INSERT INTO listings (
    bhk,
    location,
    price,
    rentpermonth,
    listing_type,
    furnished_status,
    area,
    number,
    broker_name,
    chat_group,
    links
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING id;
`;

        console.log("💾 Saving listing to database...");
        const dbRes = await db.query(insertQuery, [
          result.bhk,
          result.location,
          result.price,
          result.rentpermonth,
          result.listing_type,
          result.furnished_status,
          result.area,
          result.contact || result.number,
          result.broker_name,
          result.chat_group,
          JSON.stringify(result.links || []),
        ]);

        lastInsertedListingId = dbRes.rows[0].id;
        console.log(
          "✅ Saved listing to database with ID:",
          lastInsertedListingId
        );
        console.log("📋 Listing data:", result);

        // This sends the new listing data to all connected frontend clients
        if (global.io) {
          global.io.emit("new_listing", {
            id: lastInsertedListingId,
            ...result,
            timestamp: new Date().toISOString(),
            chat_group: chat.name,
          });
          console.log("Emitted new listing to frontend clients");
        }

        return lastInsertedListingId;
      } catch (err) {
        console.error("Error details:", err.message);
        return null;
      }
    })();

    //Save the id to the map, so that we can associate the images easily
    pendingListings.set(chatId, listingPromise);
  } else {
    console.log(
      "⏭️ Message doesn't contain 'bhk' or 'rent' keywords, skipping..."
    );
  }

  //Identifies if any images have been sent in the chat
  if (msg.hasMedia) {
    try {
      const media = await msg.downloadMedia();

      const mimeType = media.mimetype;
      const base64Data = media.data;
      const fileExtension = mimeType.split("/")[1];

      const listingPromise = pendingListings.get(chatId);
      if (!listingPromise) {
        console.log("No pending listings found to attach image to yet");
        return;
      }

      const listingId = await listingPromise;
      if (!listingId) {
        console.log("Listing insertion failed, skipping image!");
        return;
      }

      //Upload the image into Cloudinary and get the URL
      const uploadRes = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${base64Data}`,
        {
          folder: "real_estate_listings",
        }
      );

      const imageUrl = uploadRes.secure_url;

      //If we can get a listing id, then we associate the image with it. Otherwise, we inform the user
      if (lastInsertedListingId) {
        const insertImageQuery = `
        INSERT INTO IMAGES (listing_id, image_url)
        VALUES($1, $2);
      `;
        await db.query(insertImageQuery, [listingId, imageUrl]);
        console.log("Saved image to the database:", imageUrl);

        // Emit rea-time event for new image
        if (global.io) {
          global.io.emit("new_image", {
            listingId: listingId,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
          });
          console.log("Emitted new image to frontend clients");
        }
      } else {
        console.log("No listing to associate image with.");
      }
    } catch (err) {
      console.error(err);
    }
  }
});

//Notifies us about the status of the client initialization
client.on("loading_screen", (percent, message) => {
  console.log("Loading", percent, message);

  if (global.io) {
    global.io.emit("whatsapp_loading", {
      percent: percent,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
});

//Notifies the reason why the client was disconnected
client.on("disconnected", (reason) => {
  console.log("WhatsApp disconnected:", reason);

  if (global.io) {
    global.io.emit("whatsapp_disconnected", {
      reason: reason,
      timestamp: new Date().toISOString(),
    });
  }
});

await new Promise((r) => setTimeout(r, 5000));
client.initialize();