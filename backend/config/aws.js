import { config as dotenvConfig } from "dotenv";
dotenvConfig();

// 🔎 Debug logs (safe)
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log(
  "AWS_ACCESS_KEY_ID:",
  process.env.AWS_ACCESS_KEY_ID ? "LOADED" : "MISSING"
);

// 🧠 Common AWS configuration
const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// 📦 Import AWS SDK Clients
import { EC2Client } from "@aws-sdk/client-ec2";
import { S3Client } from "@aws-sdk/client-s3";
import { IAMClient } from "@aws-sdk/client-iam";
import { CloudTrailClient } from "@aws-sdk/client-cloudtrail";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// 🚀 Export Clients
export const ec2Client = new EC2Client(awsConfig);

export const s3Client = new S3Client({
  region: process.env.AWS_REGION, // keep same region
  credentials: awsConfig.credentials,
});

export const iamClient = new IAMClient(awsConfig);

export const cloudTrailClient = new CloudTrailClient(awsConfig);

export const dynamoClient = new DynamoDBClient(awsConfig);
