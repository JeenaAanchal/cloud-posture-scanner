import {
  ListBucketsCommand,
  GetBucketEncryptionCommand,
  GetBucketPolicyStatusCommand,
  GetBucketLocationCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "../config/aws.js";

export async function getS3Buckets() {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));

    if (!data.Buckets || data.Buckets.length === 0) {
      return [];
    }

    const buckets = await Promise.all(
      data.Buckets.map(async (bucket) => {
        let encryptionEnabled = true; // 🔥 default true
        let publicAccess = false;      // 🔥 default private

        // 🔐 Encryption check
        try {
          await s3Client.send(
            new GetBucketEncryptionCommand({ Bucket: bucket.Name })
          );
          encryptionEnabled = true;
        } catch (err) {
          encryptionEnabled = false; // assume false if error
        }

        // 🌍 Public access check
        try {
          const policyStatus = await s3Client.send(
            new GetBucketPolicyStatusCommand({ Bucket: bucket.Name })
          );
          publicAccess = policyStatus?.PolicyStatus?.IsPublic || false;
        } catch (err) {
          publicAccess = false;
        }

        // 🗺 Get bucket region
        let region = "unknown";
        try {
          const location = await s3Client.send(
            new GetBucketLocationCommand({ Bucket: bucket.Name })
          );
          // AWS returns '' for us-east-1
          region = location.LocationConstraint || "us-east-1";
        } catch (err) {
          region = "unknown";
        }

        return {
          bucketName: bucket.Name,
          region,
          creationDate: bucket.CreationDate || new Date(),
          encryptionEnabled,
          publicAccess,
        };
      })
    );

    return buckets;
  } catch (err) {
    console.error("Error fetching S3 buckets:", err);
    return [];
  }
}
