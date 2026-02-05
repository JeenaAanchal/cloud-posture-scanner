import Table from "./Table";
import StatusBadge from "./StatusBadge";

export default function CISResultsTable({ data }) {
  return (
    <div className="mt-10 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-gray-300 pb-2">
        CIS Security Check Results
      </h2>

      <div className="w-full max-w-5xl overflow-x-auto">
        <Table
          headers={["Check", "Status", "Evidence"]}
          data={data.map((c) => [
            c.check,
            <StatusBadge status={c.status} />,
            // Normalize evidence
            Array.isArray(c.evidence)
              ? c.evidence.length > 0
                ? c.evidence.join(", ")
                : "-"
              : typeof c.evidence === "string"
              ? c.evidence
              : "-",
          ])}
        />
      </div>
    </div>
  );
}
