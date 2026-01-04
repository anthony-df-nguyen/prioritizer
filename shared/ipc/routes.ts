// shared/ipc/routes.ts
import type {
  Project,
  NewProject,
  DecisionDriver,
  NewDecisionDriver,
  ScoringScale,
  NewScoringScale,
  ScoringScaleOption,
  NewScoringScaleOption,
  Item,
  NewItem,
  ItemDriverScore,
} from "../../electron/db/schema/";

import type { IpcResult } from "./result";
// If importing from electron feels weird, you can move IpcResult type to shared too.
// But for now, this matches your existing file.

export type IpcRoutes = {
  // Projects
  "projects:list": {
    input: void;
    output: Project[];
  };
  "projects:create": {
    input: Pick<NewProject, "name" | "description">;
    output: Project;
  };
  "projects:update": {
    input: Pick<Project, "id"> &
      Partial<Pick<Project, "name" | "description" | "archived" | "shortId">>;
    output: Project;
  };

  // Drivers
  "drivers:listActiveByProject": {
    input: { projectId: Project["id"] };
    output: DecisionDriver[];
  };
  "drivers:listAllByProject": {
    input: { projectId: Project["id"] };
    output: DecisionDriver[];
  };
  "drivers:create": {
    input: Pick<
      NewDecisionDriver,
      "projectId" | "name" | "weight" | "description"
    >;
    output: DecisionDriver;
  };
  "drivers:update": {
    input: Pick<DecisionDriver, "id"> &
      Partial<
        Pick<
          DecisionDriver,
          "name" | "weight" | "archived" | "description" | "scaleId"
        >
      >;
    output: DecisionDriver;
  };

  // Scoring Scales
  "scoringScales:listByProject": {
    input: { projectId: Project["id"] };
    output: ScoringScale[];
  };
  "scoringScales:create": {
    input: Pick<NewScoringScale, "projectId" | "name"> &
      Partial<Pick<NewScoringScale, "key" | "sortOrder" | "description">>;
    output: ScoringScale;
  };
  "scoringScales:update": {
    input: Partial<ScoringScale> & Pick<ScoringScale, "id">;
    output: ScoringScale;
  };
  "scoringScales:archive": {
    input: Pick<ScoringScale, "id">;
    output: ScoringScale;
  };

  // Scoring Scale Options
  "scoringScaleOption:listByScale": {
    input: { scaleId: ScoringScale["id"] };
    output: ScoringScaleOption[];
  };
  "scoringScaleOption:create": {
    input: Pick<NewScoringScaleOption, "scaleId" | "label" | "value"> &
      Partial<Pick<NewScoringScaleOption, "sortOrder">> & { projectId: string };
    output: ScoringScaleOption;
  };
  "scoringScaleOption:update": {
   input: Partial<ScoringScaleOption> & Pick<ScoringScaleOption, "id"> & { projectId: string };
    output: ScoringScaleOption;
  };
  "scoringScaleOption:delete": {
    input: { id: ScoringScaleOption["id"] } & { projectId: string };
    output: ScoringScaleOption;
  };

  // Items
  "items:listByProject": {
    input: { projectId: Project["id"] };
    output: Item[];
  };
  "items:create": {
    input: Pick<NewItem, "projectId" | "name" | "description">;
    output: Item;
  };
  "items:update": {
    input: Pick<Item, "id"> &
      Partial<Pick<Item, "name" | "description" | "archived">>;
    output: Item;
  };
  "items:updateAllItemScores": {
    input: {projectId: string},
    output: Promise<void>
  }
  // Item Driver Scores
  "itemScores:listByItem": {
    input: { itemId: Item["id"] };
    output: ItemDriverScore[];
  };
  "itemScores:set": {
    input: {
      itemId: Item["id"];
      driverId: DecisionDriver["id"];
      scoringScaleOptionId: string | null;
      value: number | null;
    };
    output: ItemDriverScore;
  };
};

// Helper types for consumers
export type RouteKey = keyof IpcRoutes;

// Output from invoke is always wrapped in IpcResult<T>
export type RouteResult<K extends RouteKey> = IpcResult<IpcRoutes[K]["output"]>;
