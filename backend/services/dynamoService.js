// services/dynamoService.js

import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../config/aws.js";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = "cloud-posture-results";

// Save CIS scan results to DynamoDB
export async function saveScanResults(results) {
  try {
    const scanId = uuidv4();

    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          scanId, // unique ID for each scan
          timestamp: new Date().toISOString(),
          results, // CIS results object
        },
      })
    );

    return scanId;
  } catch (error) {
    console.error("Error saving scan results:", error);
    throw error;
  }
}

// Retrieve all stored scans from DynamoDB
export async function getAllScans() {
  try {
    const data = await dynamoClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    return data.Items || [];
  } catch (error) {
    console.error("Error fetching scan history:", error);
    throw error;
  }
}
