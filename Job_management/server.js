const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Path to jobs.json file
const jobsFile = path.join(__dirname, "jobs.json");

// GET: Fetch all jobs
app.get("/api/jobs", (req, res) => {
  fs.readFile(jobsFile, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading jobs.json:", err);
      return res.status(500).json({ error: "Failed to read jobs data." });
    }
    res.json(JSON.parse(data));
  });
});

// POST: Add a new job
app.post("/api/jobs", (req, res) => {
  const newJob = req.body;

  fs.readFile(jobsFile, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading jobs.json:", err);
      return res.status(500).json({ error: "Failed to read jobs data." });
    }

    const jobs = JSON.parse(data);
    jobs.push(newJob);

    fs.writeFile(jobsFile, JSON.stringify(jobs, null, 2), (err) => {
      if (err) {
        console.error("Error writing to jobs.json:", err);
        return res.status(500).json({ error: "Failed to save job." });
      }

      res.status(201).json({ message: "Job added successfully." });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
