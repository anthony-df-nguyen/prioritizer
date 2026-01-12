const DeleteButton = () => {
  async function deleteDB() {
    window.api.db.delete(null);
  }
  return (
    <div
      className="button bgDestructive bgHover max-w-fit"
      onClick={() => deleteDB()}
    >
      Delete Database
    </div>
  );
};

export { DeleteButton };
