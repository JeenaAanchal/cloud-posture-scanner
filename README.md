#Cloud Posture Scanner

A lightweight Cloud Posture Scanner built using Node.js, Express, AWS SDK, React, and DynamoDB.
This tool connects to an AWS account and performs basic CIS security checks on EC2, S3, IAM, CloudTrail, and Security Groups.

Features

Fetch EC2 Instances
Fetch S3 Buckets
Perform CIS Security Checks:
No S3 buckets publicly accessible
All S3 buckets encrypted
IAM root account has MFA enabled
CloudTrail is enabled
Security groups not open to 0.0.0.0/0 for SSH/RDP
Store scan results in DynamoDB
View scan history
Security score calculation
Clean dashboard UI

Tech Stack
Backend
Node.js
Express.js
AWS SDK v3
DynamoDB
Frontend
React.js
Tailwind CSS

AWS Services Used
EC2
S3
IAM
CloudTrail
DynamoDB
