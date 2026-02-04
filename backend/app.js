import express from "express";
import { getEC2Instances } from "./services/ec2Service.js";
import { getS3Buckets } from "./services/s3Service.js";
import { runCISChecks } from "./services/cisService.js";
import { saveScanResults, getAllScans } from "./services/dynamoService.js"; // ✅ import DynamoDB functions
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;


// Enable CORS for all origins
app.use(cors());


app.get("/instances", async (req, res) => {
  const instances = await getEC2Instances();
  res.json(instances);
});

app.get("/buckets", async (req, res) => {
  const buckets = await getS3Buckets();
  res.json(buckets);
});

// ✅ CIS endpoint with DynamoDB save
app.get("/cis-results", async (req, res) => {
  try {
    const results = await runCISChecks();

    // Save results to DynamoDB
    const scanId = await saveScanResults(results);
    console.log(`CIS results saved with scanId: ${scanId}`);

    res.json({
      scanId,
      results,
    });
  } catch (error) {
    console.error("Error running CIS checks:", error);
    res.status(500).json({ error: "Failed to run CIS checks" });
  }
});

// ✅ Optional: endpoint to view stored scans
app.get("/scan-history", async (req, res) => {
  try {
    const scans = await getAllScans();
    res.json(scans);
  } catch (error) {
    console.error("Error fetching scan history:", error);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
