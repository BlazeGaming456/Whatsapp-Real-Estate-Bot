import express from "express";
import extractRouter from "./extractListing.js";

//The scraper and the database setup are run throughout
import "./scraper.js";
import "./db.js";

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

//Assign extractRouter to the /extract URL
app.use("/extract", extractRouter);

//Ensure unmatched routes return JSON (avoid HTML responses)
app.use((req, res) => {
  return res.status(404).json({ success: false, error: "Not found" });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));