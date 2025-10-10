import express from "express";
import extractRouter from "./extractListing.js";
import "./scraper.js";
import "./db.js";

const app = express();
app.use(express.json());
// Log all incoming requests for debugging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use("/extract", extractRouter);

// Ensure unmatched routes return JSON (avoid HTML responses)
app.use((req, res) => {
  return res.status(404).json({ success: false, error: "Not found" });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
