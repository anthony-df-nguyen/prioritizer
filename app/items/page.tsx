import { useState } from "react";
import PageHeader from "../components/AppShell/PageHeader";
import { CreateItemForm } from "./CreateItemForm";
import { useItems } from "../context/ItemsContext";
import Table from "./table/Table";

const ItemsList = () => {
  const [createMode, handleCreateMode] = useState<boolean>(false);
  const { refreshItems } = useItems();
  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Items"
        actionButton
        actionText="Create"
        onActionClick={() => handleCreateMode(true)}
      />
      {/* Create Form */}
      {createMode && (
        <CreateItemForm
          onCreate={async (payload) => {
            await window.api.items.create(payload);
            refreshItems();
            handleCreateMode(false); // Close
          }}
          onCancel={() => handleCreateMode(false)}
        />
      )}
      {/* Existing Items */}
      {!createMode && <Table />}
    </div>
  );
};

export default ItemsList;
