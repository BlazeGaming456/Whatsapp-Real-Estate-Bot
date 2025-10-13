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
});

//Notifies us when the client is ready
client.on("ready", () => {
  console.log("Client is ready!");
});

//Keeping track of last inserted listing ID to associate images as needed
let lastInsertedListingId = null;
const pendingListings = new Map();

//Whatsapp message handler
client.on("message", async (msg) => {
  const chatId = msg.from;
  const chat = await msg.getChat();

  //Chat groups to extract the listings from
  const TARGET_GROUPS = ["Real Estate Listings"];

  if (!chat.isGroup || !TARGET_GROUPS.includes(chat.name)) {
    return;
  }

  console.log(msg.body);

  //Test message
  if (msg.body === "ping") {
    msg.reply("pong");
  }

  //Identifies the listings
  if (
    (msg.body && msg.body.toLowerCase().includes("bhk")) ||
    msg.body.toLowerCase().includes("rent")
  ) {
    //Include within a promise, so that the images are processed only after the listing has been added to the database
    const listingPromise = (async () => {
      try {
        const res = await fetch("http://localhost:3001/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: msg.body, chatName: chat.name }),
        });
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          const raw = await res.text();
          console.error(
            "/extract non-200 response:",
            res.status,
            contentType,
            raw.slice(0, 500)
          );
          throw new Error(`extract failed with ${res.status}`);
        }
        if (!contentType.includes("application/json")) {
          const raw = await res.text();
          console.error(
            "/extract returned non-JSON. Body snippet:",
            raw.slice(0, 500)
          );
          throw new Error("extract returned non-JSON response");
        }
        const data = await res.json();
        const result = JSON.parse(data.result);
        console.log(data);

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
    contact,
    broker_name,
    chat_group,
    links
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING id;
`;

        const dbRes = await db.query(insertQuery, [
          result.bhk,
          result.location,
          result.price,
          result.rentpermonth,
          result.listing_type,
          result.furnished_status,
          result.area,
          result.contact,
          result.broker_name,
          result.chat_group,
          JSON.stringify(result.links || []),
        ]);

        lastInsertedListingId = dbRes.rows[0].id;
        console.log("Saved listing to the database:", result);
        return lastInsertedListingId;
      } catch (err) {
        console.error(err);
        return null;
      }
    })();

    //Save the id to the map, so that we can associate the images easily
    pendingListings.set(chatId, listingPromise);
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
  console.log("Disconnected:", reason);
});

await new Promise((r) => setTimeout(r, 5000));
client.initialize();