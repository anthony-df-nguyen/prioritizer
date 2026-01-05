import { useState } from "react";
import PageHeader from "../components/AppShell/PageHeader";
import { CreateItemForm } from "./forms/CreateItemForm";
import { useItems } from "../context/ItemsContext";
import { useProjects } from "../context/ProjectContext";
import Table from "./table/Table";

const ItemsList = () => {
  const [createMode, handleCreateMode] = useState<boolean>(false);
  const { activeProjectId } = useProjects();
  const { refreshItems } = useItems();
  return (
    <div>
      {/* Header */}
      {/* <PageHeader
        title="Priority Table"
        actionButton
        actionText="Add a Row"
        onActionClick={() => handleCreateMode(true)}
        secondaryActionButton={
          <button className="submit_button">Refresh Scores</button>
        }
        secondaryAction={}
      /> */}
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className="submit_button"
          onClick={() => handleCreateMode(true)}
        >
          Add a Row
        </button>
        <button
          className="submit_button"
          onClick={async () => {
            await window.api.items.updateAllItemScores({
              projectId: activeProjectId as string,
            });
            refreshItems();
          }}
        >
          Refresh
        </button>
        <div className="flex-1"></div>
        <button className="cancel_button">Add a Score Dimension</button>
      </div>
      {/* Create Form */}
      {createMode && (
        <CreateItemForm onCancel={() => handleCreateMode(false)} />
      )}
      {/* Existing Items */}
      {!createMode && <Table />}
    </div>
  );
};

export default ItemsList;
