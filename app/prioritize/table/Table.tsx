import { useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import { AgGridReact } from "ag-grid-react";
import { useItems, type ItemsWithScores } from "@/app/context/ItemsContext";
import { useProjects } from "@/app/context/ProjectContext";
import { useDrivers } from "@/app/context/DecisionDriverContext";
import { buildItemCols } from "./constants";

const Table = () => {
  const { items, refreshItems } = useItems();
  const rowData = items as ItemsWithScores[];
  const { drivers } = useDrivers();
  const { activeProjectId } = useProjects();
  const columnDefs = useMemo(
    () =>
      buildItemCols(
        drivers.map((d) => ({
          id: d.id,
          name: d.name,
          archived: d.archived,
          scoringScaleOptions: d.scoringOptions.map((o) => ({
            id: o.id,
            label: o.label,
            value: o.value as number,
          })),
        })),
        activeProjectId as string,
        refreshItems
      ),
    [drivers, refreshItems, activeProjectId]
  );

  return (
    <div className="h-[70vh]">
      <AgGridReact<ItemsWithScores>
        rowData={rowData}
        columnDefs={columnDefs}
        columnMenu="new"
        domLayout="normal"
      />
    </div>
  );
};

export default Table;
