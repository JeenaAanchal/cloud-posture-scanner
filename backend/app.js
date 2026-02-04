import express from "express";
import cors from "cors";

import { getEC2Instances } from "./services/ec2Service.js";
import { getS3Buckets } from "./services/s3Service.js";
import { runCISChecks } from "./services/cisService.js";
import {
  saveScanResults,
  getAllScans,
} from "./services/dynamoService.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {
  res.send("Cloud Posture Scanner API is running 🚀");
});



app.get("/instances", async (req, res) => {
  try {
    const instances = await getEC2Instances();
    res.json(instances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch EC2 instances" });
  }
});



app.get("/buckets", async (req, res) => {
  try {
    const buckets = await getS3Buckets();
    res.json(buckets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch S3 buckets" });
  }
});



app.get("/run-scan", async (req, res) => {
  try {
    const results = await runCISChecks();

    // save to DynamoDB
    await saveScanResults(results);

    res.json({
      message: "Scan completed and saved",
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "CIS scan failed" });
  }
});



app.get("/scan-history", async (req, res) => {
  try {
    const scans = await getAllScans();
    res.json(scans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
