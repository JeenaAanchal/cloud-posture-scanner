import { getS3Buckets } from "./s3Service.js";
import { getEC2Instances } from "./ec2Service.js";
import { iamClient, cloudTrailClient, ec2Client } from "../config/aws.js";

import { GetAccountSummaryCommand } from "@aws-sdk/client-iam";
import { DescribeTrailsCommand } from "@aws-sdk/client-cloudtrail";
import { DescribeSecurityGroupsCommand } from "@aws-sdk/client-ec2";

// IAM root MFA check
export async function checkIAMMFA() {
  const data = await iamClient.send(new GetAccountSummaryCommand({}));
  return data.SummaryMap["AccountMFAEnabled"] === 1;
}

// CloudTrail enabled check
export async function checkCloudTrail() {
  const trails = await cloudTrailClient.send(
    new DescribeTrailsCommand({})
  );
  return trails.trailList && trails.trailList.length > 0;
}

// Security groups open to 0.0.0.0/0 check
export async function checkSGOpen(instances) {
  const sgIssues = [];

  for (const inst of instances) {
    for (const sgName of inst.securityGroups) {
      const sgData = await ec2Client.send(
        new DescribeSecurityGroupsCommand({ GroupNames: [sgName] })
      );

      const sg = sgData.SecurityGroups[0];

      sg.IpPermissions.forEach((perm) => {
        const fromPort = perm.FromPort ?? -1;
        const toPort = perm.ToPort ?? -1;

        const riskyPorts = [22, 3389];
        const matchesPort = riskyPorts.some(
          (p) => fromPort <= p && toPort >= p
        );

        perm.IpRanges.forEach((range) => {
          if (range.CidrIp === "0.0.0.0/0" && matchesPort) {
            sgIssues.push(
              `Instance ${inst.instanceId} SG ${sg.GroupName} port ${fromPort}-${toPort} open to 0.0.0.0/0`
            );
          }
        });
      });
    }
  }

  return sgIssues;
}

//  Run all CIS checks
export async function runCISChecks() {
  const buckets = await getS3Buckets();
  const instances = await getEC2Instances();

  const results = [];

  // No S3 buckets publicly accessible
  const publicBuckets = buckets.filter((b) => b.access === "Public");
  results.push({
    check: "No S3 buckets publicly accessible",
    status: publicBuckets.length === 0 ? "pass" : "fail",
    evidence: publicBuckets.map((b) => b.name),
  });

  // All S3 buckets encrypted
  const unencryptedBuckets = buckets.filter((b) => !b.encrypted);
  results.push({
    check: "All S3 buckets encrypted",
    status: unencryptedBuckets.length === 0 ? "pass" : "fail",
    evidence: unencryptedBuckets.map((b) => b.name),
  });

  //  IAM root MFA enabled
  const rootMFA = await checkIAMMFA();
  results.push({
    check: "IAM root account has MFA enabled",
    status: rootMFA ? "pass" : "fail",
    evidence: rootMFA ? [] : ["Root account MFA missing"],
  });

  // CloudTrail enabled
  const cloudTrail = await checkCloudTrail();
  results.push({
    check: "CloudTrail is enabled",
    status: cloudTrail ? "pass" : "fail",
    evidence: cloudTrail ? [] : ["No active CloudTrail found"],
  });

  //  Security groups not open to 0.0.0.0/0 for SSH/RDP
  const sgIssues = await checkSGOpen(instances);
  results.push({
    check: "Security groups not open to 0.0.0.0/0 for SSH/RDP",
    status: sgIssues.length === 0 ? "pass" : "fail",
    evidence: sgIssues,
  });

  return results;
}
