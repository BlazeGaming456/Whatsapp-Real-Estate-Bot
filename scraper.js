import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import fetch from "node-fetch";
import { client as db } from "./db.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const allSessionsObject = {};

cloudinary.config({
  cloud_name: "dcylbajel",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const client = new Client({
  puppeteer: {
    headless: false,
  },
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// Keep track of last inserted listing ID to associate images if needed
let lastInsertedListingId = null;
const pendingListings = new Map();

client.on("message", async (msg) => {
  const chatId = msg.from;
  const chat = await msg.getChat();
  const TARGET_GROUPS = ["Real Estate Listings"];

  if (!chat.isGroup || !TARGET_GROUPS.includes(chat.name)) {
    return;
  }

  console.log(msg.body);
  if (msg.body === "ping") {
    msg.reply("pong");
  }
  if (
    (msg.body && msg.body.toLowerCase().includes("bhk")) ||
    msg.body.toLowerCase().includes("rent")
  ) {
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

        //Save to the database
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

        console.log("dbRes:", dbRes);
        console.log("rows:", dbRes.rows[0]);
        console.log("id:", dbRes.rows[0].id);

        lastInsertedListingId = dbRes.rows[0].id;
        console.log("Saved listing to the database:", result);
        return lastInsertedListingId;
      } catch (err) {
        console.error(err);
        return null;
      }
    })();

    pendingListings.set(chatId, listingPromise);
  }

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

      // fs.writeFileSync(
      //   `./images/${fileName}`,
      //   Buffer.from(base64Data, "base64")
      // );

      const uploadRes = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${base64Data}`,
        {
          folder: "real_estate_listings",
        }
      );

      const imageUrl = uploadRes.secure_url;

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

client.on("loading_screen", (percent, message) => {
  console.log("Loading", percent, message);
});

client.on("disconnected", (reason) => {
  console.log("Disconnected:", reason);
});

await new Promise((r) => setTimeout(r, 5000));
client.initialize();
