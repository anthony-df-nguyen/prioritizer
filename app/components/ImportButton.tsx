import React from "react";
import { unwrapIpcResult } from "@/shared/ipc/unwrap";


const ImportButton = () => {
  async function importBackup() {
    window.api.db.importBackup(null)
  }
  return (
    <div className="submit_button max-w-fit" onClick={() => importBackup()}>
      Import Database
    </div>
  );
};

export default ImportButton;
