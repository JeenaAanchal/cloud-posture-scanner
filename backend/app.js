import express from "express";
import cors from "cors";

import { getEC2Instances } from "./services/ec2Service.js";
import { getS3Buckets } from "./services/s3Service.js";
import { runCISChecks } from "./services/cisService.js";
import { saveScanResults, getAllScans } from "./services/dynamoService.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());



app.get("/instances", async (req, res) => {
  try {
    const instances = await getEC2Instances();
    res.json(instances);
  } catch (error) {
    console.error("Error fetching EC2 instances:", error);
    res.status(500).json({ error: "Failed to fetch EC2 instances" });
  }
});



app.get("/buckets", async (req, res) => {
  try {
    const buckets = await getS3Buckets();
    res.json(buckets);
  } catch (error) {
    console.error("Error fetching S3 buckets:", error);
    res.status(500).json({ error: "Failed to fetch S3 buckets" });
  }
});



app.get("/scan", async (req, res) => {
  try {
    const results = await runCISChecks();

    // Save full results (including evidence)
    await saveScanResults(results);

    res.json(results);
  } catch (error) {
    console.error("Error running scan:", error);
    res.status(500).json({ error: "Failed to run scan" });
  }
});



app.get("/cis-results", async (req, res) => {
  try {
    const results = await runCISChecks();
    res.json(results);
  } catch (error) {
    console.error("Error fetching CIS results:", error);
    res.status(500).json({ error: "Failed to fetch CIS results" });
  }
});


app.get("/scan-history", async (req, res) => {
  try {
    const scans = await getAllScans();
    res.json(scans);
  } catch (error) {
    console.error("Error fetching scan history:", error);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
