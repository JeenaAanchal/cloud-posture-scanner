export default function StatusBadge({ status }) {
  const isPass = status === "pass";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isPass
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {isPass ? "PASS" : "FAIL"}
    </span>
  );
}
