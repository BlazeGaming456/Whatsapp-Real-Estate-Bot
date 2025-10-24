import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import fetch from "node-fetch";
import { client as db } from "./db.js";
import { v2 as cloudinary } from "cloudinary";

//Setting up Cloudianry to upload images
cloudinary.config({
  cloud_name: "dcylbajel",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//Whatsapp-Web.js initialization
const client = new Client({
  puppeteer: {
    headless: false,
  },
});

//Generates QR Code in the terminal
client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  //Scan this code with you phone to login
  qrcode.generate(qr, { small: true });

  // EMIT QR CODE TO FRONTEND
  // This sends the QR code data to frontend clients for display
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

  // Emit WhatsApp ready status to frontend
  if (global.io) {
    global.io.emit("whatsapp_ready", {
      status: "connected",
      timestamp: new Date().toISOString(),
    });
    console.log("📡 Emitted WhatsApp ready status to frontend");
  }
});

//Keeping track of last inserted listing ID to associate images as needed
let lastInsertedListingId = null;
const pendingListings = new Map();

//Whatsapp message handler
client.on("message", async (msg) => {
  const chatId = msg.from;
  const chat = await msg.getChat();

  // Log all messages for debugging
  console.log(
    `📱 Message received from: ${chat.name || "Unknown"} (${
      chat.isGroup ? "Group" : "Individual"
    })`
  );
  console.log(`📝 Message body: ${msg.body}`);

  //Chat groups to extract the listings from
  const TARGET_GROUPS = ["Real Estate Listings"];

  // Also allow any group with "real estate" or "property" in the name
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
    console.log("⏭️ Skipping: Not a group message");
    return;
  }

  // Check if it's a real estate related group
  if (!isRealEstateGroup(chat.name)) {
    console.log(`⏭️ Skipping: Group "${chat.name}" is not a real estate group`);
    return;
  }

  console.log(`✅ Processing message from target group: ${chat.name}`);

  //Test message
  if (msg.body === "ping") {
    msg.reply("pong");
    return;
  }

  // Test listing message
  if (msg.body === "test listing") {
    console.log("🧪 Test listing message received - simulating processing...");
    // Simulate a test listing
    const testListing = {
      bhk: 2,
      location: "Test Location",
      price: "5000000",
      rentpermonth: "25000",
      listing_type: "sale",
      furnished_status: "semi-furnished",
      area: "1000 sq ft",
      contact: "1234567890",
      broker_name: "Test Broker",
      chat_group: chat.name,
      links: [],
    };

    // Emit test listing to frontend
    if (global.io) {
      global.io.emit("new_listing", {
        id: 999,
        ...testListing,
        timestamp: new Date().toISOString(),
      });
      console.log("📡 Emitted test listing to frontend");
    }

    msg.reply("Test listing processed! Check your dashboard.");
    return;
  }

  //Identifies the listings - Fixed the condition
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

        const contentType = res.headers.get("content-type") || "";
        console.log(
          `📡 Extraction response status: ${res.status}, content-type: ${contentType}`
        );

        if (!res.ok) {
          const raw = await res.text();
          console.error(
            "❌ /extract non-200 response:",
            res.status,
            contentType,
            raw.slice(0, 500)
          );
          throw new Error(`extract failed with ${res.status}`);
        }

        if (!contentType.includes("application/json")) {
          const raw = await res.text();
          console.error(
            "❌ /extract returned non-JSON. Body snippet:",
            raw.slice(0, 500)
          );
          throw new Error("extract returned non-JSON response");
        }

        const data = await res.json();
        console.log("✅ AI extraction successful:", data);

        const result = JSON.parse(data.result);
        console.log("📊 Parsed result:", result);

        //Saving to the database
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

        // EMIT REAL-TIME EVENT TO FRONTEND
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
        console.error("❌ Error processing listing:", err);
        console.error("❌ Error details:", err.message);
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
      const fileName = `image_${Date.now()}.${fileExtension}`;

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

        // EMIT REAL-TIME EVENT FOR NEW IMAGE
        // This notifies frontend clients that a new image was added to a listing
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
});

//Notifies the reason why the client was disconnected
client.on("disconnected", (reason) => {
  console.log("❌ WhatsApp disconnected:", reason);

  // Emit WhatsApp disconnected status to frontend
  if (global.io) {
    global.io.emit("whatsapp_disconnected", {
      reason: reason,
      timestamp: new Date().toISOString(),
    });
    console.log("📡 Emitted WhatsApp disconnected status to frontend");
  }
});

await new Promise((r) => setTimeout(r, 5000));
client.initialize();
