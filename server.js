import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import extractRouter from "./extractListing.js";
import { client as db } from "./db.js";

//The scraper and the database setup are run throughout
import "./scraper.js";
import "./db.js";

const app = express();
const server = createServer(app);

// Configure CORS for frontend communication
app.use(
  cors({
    origin: "http://localhost:3000", // Next.js frontend URL
    credentials: true,
  })
);

app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Create Socket.IO server for real-time communication
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Make io available globally for use in other files
global.io = io;

//Assign extractRouter to the /extract URL
app.use("/extract", extractRouter);

// NEW API ROUTES FOR FRONTEND
// Get paginated listings for the frontend
app.get("/api/listings", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      type = "",
      location = "",
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', i.id, 'url', i.image_url)
               ) FILTER (WHERE i.id IS NOT NULL), 
               '[]'::json
             ) as images
      FROM listings l
      LEFT JOIN images i ON l.id = i.listing_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      conditions.push(
        `(l.location ILIKE $${paramCount} OR COALESCE(l.broker_name, '') ILIKE $${paramCount})`
      );
      params.push(`%${search}%`);
    }

    if (type) {
      paramCount++;
      conditions.push(`l.listing_type = $${paramCount}`);
      params.push(type);
    }

    if (location) {
      paramCount++;
      conditions.push(`l.location ILIKE $${paramCount}`);
      params.push(`%${location}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY l.id ORDER BY l.created_at DESC LIMIT $${
      paramCount + 1
    } OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM listings l";
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch listings" });
  }
});

// Get dashboard statistics
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_listings,
        COUNT(CASE WHEN listing_type = 'sale' THEN 1 END) as sale_listings,
        COUNT(CASE WHEN listing_type = 'rent' THEN 1 END) as rent_listings,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as today_listings
      FROM listings
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Frontend client connected:", socket.id);

  // Send current connection status
  socket.emit("connection_status", {
    status: "connected",
    timestamp: new Date().toISOString(),
  });

  // Handle QR code requests
  socket.on("request_qr", () => {
    console.log("QR code requested by client:", socket.id);
    // The QR code will be emitted automatically when WhatsApp generates it
    // This is handled in scraper.js when the 'qr' event is triggered
  });

  socket.on("disconnect", () => {
    console.log("Frontend client disconnected:", socket.id);
  });
});

//Ensure unmatched routes return JSON (avoid HTML responses)
app.use((req, res) => {
  return res.status(404).json({ success: false, error: "Not found" });
});

const PORT = 3001;
server.listen(PORT, () =>
  console.log(`Server started on port ${PORT} with WebSocket support`)
);
