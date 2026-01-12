import React from "react";
import { unwrapIpcResult } from "@/shared/ipc/unwrap";


const ExportButton = () => {
  async function onExportBackup() {
    window.api.db.exportBackup(null)
  }
  return (
    <div className="button bgPrimary max-w-fit" onClick={() => onExportBackup()}>
      Export Database
    </div>
  );
};

export {ExportButton}
