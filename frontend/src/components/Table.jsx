export default function Table({ headers, data }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          
          {/* Header */}
          <thead className="bg-gray-600 text-white text-md uppercase tracking-wider">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 transition duration-200"
              >
                {row.map((cell, i) => (
                  <td key={i} className="px-6 py-4 text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
