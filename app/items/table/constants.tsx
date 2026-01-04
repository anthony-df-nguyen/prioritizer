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
      headerName: "Score",
      sortable: true,
      cellDataType: "number",
      width:100,
    },
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      filter: true,
      editable: true,
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
      //flex: 1,
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
        if (p.value == null) return "";
        const n = Number(p.value);
        if (Number.isNaN(n)) return "";
        return hasOptions ? labelByValue.get(n) ?? String(n) : String(n);
      },

      cellEditor: "agSelectCellEditor",
      //cellEditorPopup: true,
      cellEditorParams: hasOptions
        ? {
            values: ["None", ...options.map((o) => o.value)],
          }
        : undefined,

      valueSetter: (p: ValueSetterParams<ItemsWithScores>) => {
        const raw = p.newValue;
        //console.log('raw: ', raw);
        const next =
          raw === "None" || raw === "" || raw == null ? null : Number(raw);

        if (next !== null && Number.isNaN(next)) return false;

        // Save to DB using existing set function
        window.api.itemScores
          .set({
            itemId: p.data.id,
            driverId: d.id,
            scoringScaleOptionId: null, // We're using the value directly
            value: next,
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
        p.data[d.id] = next;
        return true;
      },
    };
  });

  return [...base, ...driverCols];
}