import React from "react";

const PoamTable = React.memo(({ poamList, currentRoleConfig, handlePoamClosure }) => {
  return (
    <div className="bg-gray-800 rounded-b-xl shadow-2xl overflow-hidden border border-gray-700">
      <table className="min-w-full text-sm text-left text-gray-400">
        <thead className="bg-gray-700 text-gray-300 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-6 py-3">#</th>
            <th className="px-6 py-3">Control ID</th>
            <th className="px-6 py-3">Control Name</th>
            <th className="px-6 py-3">Deficiency</th>
            <th className="px-6 py-3">Severity</th>
            <th className="px-6 py-3">Mitigation</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {poamList.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="px-6 py-4 text-center text-gray-500 italic"
              >
                No POA&amp;M entries found.
              </td>
            </tr>
          ) : (
            poamList.map((poam, index) => (
              <tr
                key={poam.id || index}
                className="hover:bg-gray-700 transition duration-200"
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-mono text-cyan-400">
                  {poam.controlId}
                </td>
                <td className="px-6 py-4">{poam.controlName}</td>
                <td className="px-6 py-4">{poam.deficiency}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      poam.severity === "High"
                        ? "bg-red-600 text-white"
                        : poam.severity === "Medium"
                        ? "bg-yellow-500 text-black"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {poam.severity}
                  </span>
                </td>
                <td className="px-6 py-4">{poam.mitigation}</td>
                <td className="px-6 py-4">{poam.status}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handlePoamClosure(poam.id)}
                    disabled={
                      !currentRoleConfig.permissions.includes("edit_controls")
                    }
                    className="px-4 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold disabled:bg-gray-600"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default PoamTable;
