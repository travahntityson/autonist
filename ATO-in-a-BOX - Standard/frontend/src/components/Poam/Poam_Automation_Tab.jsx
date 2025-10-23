import React from "react";
import PoamTable from "../Poam_Table";

const PoamAutomationTab = React.memo(
  ({
    poamList,
    currentRoleConfig,
    generatePOAandM,
    handlePoamClosure,
    exportControlsToEmassCsv,
    exportPoamToEmassCsv,
    handleExport,
  }) => {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-white border-l-4 border-cyan-400 pl-3">
          Plan of Action &amp; Milestones (POA&amp;M) Automation
        </h2>

        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-t-xl border-b border-gray-700">
          <p className="text-gray-300 font-medium">
            Total Deficiencies Logged:
            <span className="text-cyan-400 font-bold"> {poamList.length}</span>
          </p>

          <div className="flex gap-4">
            <button
              onClick={generatePOAandM}
              disabled={!currentRoleConfig.permissions.includes("edit_controls")}
              className="cyber-button px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm disabled:bg-gray-600"
            >
              Generate New POA&amp;M Entries
            </button>

            <button
              onClick={exportControlsToEmassCsv}
              disabled={!currentRoleConfig.permissions.includes("edit_controls")}
              className="cyber-button px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm disabled:bg-gray-600"
            >
              Export Security Controls CSV
            </button>

            <button
              onClick={exportPoamToEmassCsv}
              disabled={!currentRoleConfig.permissions.includes("edit_controls")}
              className="cyber-button px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-sm disabled:bg-gray-600"
            >
              Export POA&amp;M CSV
            </button>
          </div>
        </div>

        {/* Table Section */}
        <PoamTable
          poamList={poamList}
          currentRoleConfig={currentRoleConfig}
          handlePoamClosure={handlePoamClosure}
        />
      </div>
    );
  }
);

export default PoamAutomationTab;
