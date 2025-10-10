import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import fetch from "node-fetch";
import { client as db } from "./db.js";
import fs from "fs";

const allSessionsObject = {};

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

client.on("message", async (msg) => {
  console.log(msg.body);
  if (msg.body === "ping") {
    msg.reply("pong");
  }
  if (
    msg.body.toLowerCase().includes("bhk") ||
    msg.body.toLowerCase().includes("rent")
  ) {
    try {
      const res = await fetch("http://localhost:3001/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: msg.body }),
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
        INSERT into listings (bhk, location, price, number)
        VALUES ($1, $2, $3, $4);
      `;

      await db.query(insertQuery, [
        result.bhk,
        result.location,
        result.price,
        result.contact,
      ]);

      console.log("Saved listing to the database:", result);
    } catch (err) {
      console.error(err);
    }
  }

  if (msg.hasMedia) {
    try {
      const media = await msg.downloadMedia();

      const mimeType = media.mimetype;
      const base64Data = media.data;
      const fileExtension = mimeType.split("/")[1];
      const fileName = `image_${Date.now()}.${fileExtension}`;

      fs.writeFileSync(
        `./images/${fileName}`,
        Buffer.from(base64Data, "base64")
      );

      const imageUrl = `./images/${fileName}`;

      if (lastInsertedListingId) {
        const insertImageQuery = `
        INSERT INTO IMAGES (listing_id, image_url)
        VALUES($1, $2);
      `;
        await db.query(insertImageQuery, [lastInsertedListingId, imageUrl]);
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
