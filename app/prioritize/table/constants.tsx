import type { ColDef, ValueSetterParams } from "ag-grid-community";
import type { ItemsWithScores } from "@/app/context/ItemsContext";

export type ScoringScaleOptionForGrid = {
  id: string;
  label: string;
  value: number;
};

export type DriverForGrid = {
  id: string;
  name: string;
  archived: number;
  scoringScaleOptions?: ScoringScaleOptionForGrid[];
};

export function buildItemCols(
  drivers: DriverForGrid[],
  activeProjectId: string,
  refreshItems?: () => Promise<void>
): ColDef<ItemsWithScores>[] {
  const base: ColDef<ItemsWithScores>[] = [
    {
      field: "score",
      headerName: "Total Score",
      sortable: true,
      cellDataType: "number",
      width: 120,
      pinned: "right",
    },
    {
      field: "name",
      headerName: "Item Name",
      pinned: "left",
      sortable: true,
      filter: true,
      editable: true,
      //headerStyle: {backgroundColor: "#667eea", color:"white"},
      valueSetter: (p: ValueSetterParams<ItemsWithScores>) => {
        const raw = p.newValue;
        if (raw === p.oldValue) return false; // no change

        // call the IPC to update the item
        window.api.items
          .update({ id: p.data.id, name: raw as string })
          .then(() => {
            if (refreshItems) void refreshItems();
          })
          .catch((e) => console.error("Failed to update name", e));

        // update local row data so grid reflects change immediately
        p.data.name = raw as string;
        return true;
      },
    },
    {
      field: "description",
      headerName: "Description",
      //headerStyle: {backgroundColor: "#667eea", color:"white"},
      sortable: true,
      filter: true,
      editable: true,
      valueSetter: (p: ValueSetterParams<ItemsWithScores>) => {
        const raw = p.newValue;
        if (raw === p.oldValue) return false; // no change

        window.api.items
          .update({ id: p.data.id, description: raw as string })
          .then(() => {
            if (refreshItems) void refreshItems();
          })
          .catch((e) => console.error("Failed to update description", e));

        p.data.description = raw as string;
        return true;
      },
      flex: 1,
      //minWidth: 240,
    },
  ];

  const activeDrivers = drivers.filter((d) => d.archived === 0);

  const driverCols: ColDef<ItemsWithScores>[] = activeDrivers.map((d) => {
    const options = d.scoringScaleOptions ?? [];
    const hasOptions = options.length > 0;

    const labelByValue = new Map(
      options.map((o) => [o.value, o.label] as const)
    );
    const labelByID = new Map(options.map((o) => [o.id, o.label]));

    return {
      colId: `driver:${d.id}`,
      field: d.id,
      headerName: d.name,
      sortable: true,
      filter: true,
      editable: true,
      width: 160,
      singleClickEdit: true,
      valueFormatter: (p) => {
        const n = String(p.value)
        return typeof n === 'string' ? labelByID.get(n) as string : "";
      },

      cellEditor: "agSelectCellEditor",
      //cellEditorPopup: true,
      cellEditorParams: hasOptions
        ? {
            values: ["None", ...options.map((o) => o.id)], // Use ID instead of value
          }
        : undefined,

      valueSetter: (p: ValueSetterParams<ItemsWithScores>) => {
        const selectedID = p.newValue;
        console.log('selectedID: ', selectedID);
        

        // Find the scoring scale option that matches the selected scale ID
        const option = options.find((o) => o.id === selectedID); // Match by ID instead of value

        // Save to DB using existing set function
        window.api.itemScores
          .set({
            itemId: p.data.id,
            driverId: d.id,
            scoringScaleOptionId: option ? selectedID : null,
            value: option ? option?.value : undefined,
          })
          .then(async () => {
            // Refresh data after successful save
            if (refreshItems) {
              await refreshItems();
            }
          })
          .catch((e) => {
            console.error("Failed to save score", e);
          });

        // Update grid data immediately
        p.data[d.id] = selectedID; // Store the ID instead of the value
        return true;
      },
    };
  });

  return [...base, ...driverCols];
}
