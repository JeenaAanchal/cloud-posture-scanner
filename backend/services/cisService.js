import { getS3Buckets } from "./s3Service.js";
import { getEC2Instances } from "./ec2Service.js";
import { IAMClient, ListMFADevicesCommand } from "@aws-sdk/client-iam";
import { CloudTrailClient, DescribeTrailsCommand } from "@aws-sdk/client-cloudtrail";

// Check IAM MFA
async function checkIAMMFA() {
  try {
    const client = new IAMClient({});
    const command = new ListMFADevicesCommand({ UserName: "root" });
    const data = await client.send(command);
    return data.MFADevices && data.MFADevices.length > 0;
  } catch (err) {
    console.error("Error checking IAM MFA:", err.message);
    return false;
  }
}

// Check CloudTrail
async function checkCloudTrail() {
  try {
    const client = new CloudTrailClient({});
    const command = new DescribeTrailsCommand({ includeShadowTrails: false });
    const data = await client.send(command);
    return data.trailList && data.trailList.length > 0;
  } catch (err) {
    console.error("Error checking CloudTrail:", err.message);
    return false;
  }
}

// Check Security Groups
async function checkSGOpen(instances) {
  const issues = [];
  for (const instance of instances) {
    if (instance.SecurityGroups) {
      instance.SecurityGroups.forEach((sg) => {
        if (sg.OpenSSH) issues.push(`${instance.InstanceId}: SG ${sg.GroupName} open on SSH`);
        if (sg.OpenRDP) issues.push(`${instance.InstanceId}: SG ${sg.GroupName} open on RDP`);
      });
    }
  }
  return issues;
}

// Run all CIS checks
export async function runCISChecks() {
  try {
    const buckets = await getS3Buckets();
    const instances = await getEC2Instances();

    const results = [];

    const publicBuckets = buckets.filter((b) => b.access === "Public");
    results.push({
      check: "No S3 buckets publicly accessible",
      status: publicBuckets.length === 0 ? "pass" : "fail",
      evidence:
        publicBuckets.length === 0
          ? `Checked ${buckets.length} buckets - none are public`
          : `Public buckets found: ${publicBuckets.map((b) => b.name).join(", ")}`,
    });

    const unencryptedBuckets = buckets.filter((b) => !b.encrypted);
    results.push({
      check: "All S3 buckets encrypted",
      status: unencryptedBuckets.length === 0 ? "pass" : "fail",
      evidence:
        unencryptedBuckets.length === 0
          ? `All ${buckets.length} buckets have encryption enabled`
          : `Unencrypted buckets ${unencryptedBuckets.map((b) => b.name).join(", ")}`,
    });

    const rootMFA = await checkIAMMFA();
    results.push({
      check: "IAM root account has MFA enabled",
      status: rootMFA ? "pass" : "fail",
      evidence: rootMFA ? "Root account MFA is enabled" : "Root account MFA is NOT enabled",
    });

    const cloudTrail = await checkCloudTrail();
    results.push({
      check: "CloudTrail is enabled",
      status: cloudTrail ? "pass" : "fail",
      evidence: cloudTrail
        ? "CloudTrail trail is active in this account"
        : "No active CloudTrail trail found",
    });

    const sgIssues = await checkSGOpen(instances);
    results.push({
      check: "Security groups not open to 0.0.0.0/0 for SSH/RDP",
      status: sgIssues.length === 0 ? "pass" : "fail",
      evidence: sgIssues.length === 0
        ? "No security group allows SSH/RDP from 0.0.0.0/0"
        : sgIssues,
    });

    return results;
  } catch (err) {
    console.error("Error in runCISChecks:", err.message);
    return [];
  }
}
