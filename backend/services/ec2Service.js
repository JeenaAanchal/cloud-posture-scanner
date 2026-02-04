import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "../config/aws.js";

export async function getEC2Instances() {
  try {
    const command = new DescribeInstancesCommand({});
    const data = await ec2Client.send(command);

   
    const reservations = data.Reservations || [];

    const instances = reservations.flatMap(res =>
      (res.Instances || []).map(inst => ({
        instanceId: inst.InstanceId,
        instanceType: inst.InstanceType,            
        state: inst.State?.Name || "unknown",       
        region: process.env.AWS_REGION,             
        publicIp: inst.PublicIpAddress || "N/A",
        securityGroups: (inst.SecurityGroups || []).map(
          sg => sg.GroupName
        ),
      }))
    );

    console.log("EC2 Instances Found:", instances.length);

    return instances;
  } catch (err) {
    console.error("Error fetching EC2 instances:", err);
    throw err; 
  }
}
