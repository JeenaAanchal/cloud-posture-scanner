import Table from "./Table";

export default function S3Table({ data }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl text-center font-semibold text-gray-700 mb-4">
        S3 Buckets
      </h2>

      <Table
        headers={[
          "Bucket Name",
          "Region",
          "Creation Date",
          "Encryption",
          "Public Access",
        ]}
        data={data.map((bucket) => [
          bucket.bucketName, 
          bucket.region || "-",
          bucket.creationDate
            ? new Date(bucket.creationDate).toLocaleDateString()
            : "-",
          bucket.encryptionEnabled ? "Yes" : "No", 
          bucket.publicAccess ? "Yes" : "No", 
        ])}
      />
    </div>
  );
}
