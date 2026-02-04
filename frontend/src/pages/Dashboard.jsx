import { useEffect, useState } from "react";
import Card from "../components/Card";
import CISResultsTable from "../components/CISResultsTable";
import EC2Table from "../components/EC2Table";
import S3Table from "../components/S3Table";

export default function Dashboard() {
  const [cisResults, setCisResults] = useState([]);
  const [ec2Data, setEc2Data] = useState([]);
  const [s3Data, setS3Data] = useState([]);

  useEffect(() => {
    const runScanAndFetch = async () => {
      // Step 1: Run fresh scan
      await fetch("http://localhost:4000/scan");

      // Step 2: Get updated scan history
      const res = await fetch("http://localhost:4000/scan-history");
      const scans = await res.json();

      const latestScan = scans[scans.length - 1];
      setCisResults(latestScan?.results || []);
    };

    runScanAndFetch();
  }, []);


  useEffect(() => {
    fetch("http://localhost:4000/instances")
      .then((res) => res.json())
      .then(setEc2Data);
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/buckets")
      .then((res) => res.json())
      .then(setS3Data);
  }, []);

  const passed = cisResults.filter((c) => c.status === "pass").length;
  const score =
    cisResults.length > 0
      ? Math.round((passed / cisResults.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-14">
          <h1 className="text-4xl text-center font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ☁️ Cloud Posture Scanner
          </h1>
          <p className="text-gray-500 text-center mt-2">
            AWS Security & CIS Benchmark Monitoring Dashboard
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card title="Total Checks" value={cisResults.length} />
          <Card title="Passed Checks" value={passed} />
          <Card title="Security Score" value={`${score}%`} />
        </div>


        <div className="space-y-20">
          <CISResultsTable data={cisResults} />
          <EC2Table data={ec2Data} />
          <S3Table data={s3Data} />
        </div>

      </div>
    </div>
  );
}
