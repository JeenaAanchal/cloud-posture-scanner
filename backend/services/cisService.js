export async function runCISChecks() {
  const buckets = await getS3Buckets();
  const instances = await getEC2Instances();

  const results = [];

  // 1️⃣ No S3 buckets publicly accessible
  const publicBuckets = buckets.filter((b) => b.access === "Public");
  results.push({
    check: "No S3 buckets publicly accessible",
    status: publicBuckets.length === 0 ? "pass" : "fail",
    evidence:
      publicBuckets.length === 0
        ? `Checked ${buckets.length} buckets - none are public`
        : `Public buckets found: ${publicBuckets.map((b) => b.name).join(", ")}`,
  });

  // 2️⃣ All S3 buckets encrypted
  const unencryptedBuckets = buckets.filter((b) => !b.encrypted);
  results.push({
    check: "All S3 buckets encrypted",
    status: unencryptedBuckets.length === 0 ? "pass" : "fail",
    evidence:
      unencryptedBuckets.length === 0
        ? `All ${buckets.length} buckets have encryption enabled`
        : `Unencrypted buckets: ${unencryptedBuckets
            .map((b) => b.name)
            .join(", ")}`,
  });

  // 3️⃣ IAM root MFA enabled
  const rootMFA = await checkIAMMFA();
  results.push({
    check: "IAM root account has MFA enabled",
    status: rootMFA ? "pass" : "fail",
    evidence: rootMFA
      ? "Root account MFA is enabled"
      : "Root account MFA is NOT enabled",
  });

  // 4️⃣ CloudTrail enabled
  const cloudTrail = await checkCloudTrail();
  results.push({
    check: "CloudTrail is enabled",
    status: cloudTrail ? "pass" : "fail",
    evidence: cloudTrail
      ? "CloudTrail trail is active in this account"
      : "No active CloudTrail trail found",
  });

  // 5️⃣ Security groups check
  const sgIssues = await checkSGOpen(instances);
  results.push({
    check: "Security groups not open to 0.0.0.0/0 for SSH/RDP",
    status: sgIssues.length === 0 ? "pass" : "fail",
    evidence:
      sgIssues.length === 0
        ? "No security group allows SSH/RDP from 0.0.0.0/0"
        : sgIssues.join(" | "),
  });

  return results;
}
