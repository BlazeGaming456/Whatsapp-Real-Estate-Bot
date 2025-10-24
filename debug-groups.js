import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

// Simple script to list all WhatsApp groups
const client = new Client({
  puppeteer: {
    headless: false,
  },
});

client.on("qr", (qr) => {
  console.log("QR Code:", qr);
});

client.on("ready", async () => {
  console.log("Client is ready!");

  // Get all chats
  const chats = await client.getChats();

  console.log("\n=== ALL CHATS ===");
  chats.forEach((chat, index) => {
    console.log(
      `${index + 1}. ${chat.isGroup ? "GROUP" : "INDIVIDUAL"}: "${chat.name}"`
    );
  });

  console.log("\n=== GROUPS ONLY ===");
  const groups = chats.filter((chat) => chat.isGroup);
  groups.forEach((group, index) => {
    console.log(`${index + 1}. "${group.name}"`);
  });

  console.log("\n=== TARGET GROUPS CHECK ===");
  const TARGET_GROUPS = ["Real Estate Listings"];
  groups.forEach((group) => {
    const isTarget = TARGET_GROUPS.includes(group.name);
    console.log(`"${group.name}" - ${isTarget ? "✅ MATCH" : "❌ NO MATCH"}`);
  });

  process.exit(0);
});

client.initialize();
