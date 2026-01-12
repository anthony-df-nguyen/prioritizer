
const ImportButton = () => {
  async function importBackup() {
    window.api.db.importBackup(null);
  }
  return (
    <div className="button bgPrimary bgHover max-w-fit" onClick={() => importBackup()}>
      Import Database
    </div>
  );
};

export { ImportButton };
