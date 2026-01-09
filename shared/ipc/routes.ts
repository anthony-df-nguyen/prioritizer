// shared/ipc/routes.ts
import type {
  Project,
  NewProject,
  DecisionDriver,
  NewDecisionDriver,
  DecisionDriverScoringOption,
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
      "projectId" | "name" | "weight" | "description" | "id"
    > & {
      scoringOptions?: Pick<
        ScoringScaleOption,
        "label" | "value" | "sortOrder"
      >[];
    };
    output: DecisionDriver;
  };
  "drivers:update": {
    input: Partial<DecisionDriver> &
      Pick<DecisionDriver, "id"> & {
        scoringOptions?: Pick<
          ScoringScaleOption,
          "id" | "label" | "value" | "sortOrder"
        >[];
      };
    output: DecisionDriver;
  };

  // Driver Scoring Option
  // "driverScoringOption:create": {
  //   input: Pick<DecisionDriverScoringOption, "driverId" | "scoringOptionId">;
  //   output: Promise<void>;
  // };
  "driverScoringOption:delete": {
    input: Pick<DecisionDriverScoringOption, "driverId" | "scoringOptionId">;
    output: Promise<void>;
  };
  // Scoring Scale Options
  "scoringScaleOption:listByDriver": {
    input: { driverId: string };
    output: ScoringScaleOption[];
  };
  "scoringScaleOption:create": {
    input: Pick<NewScoringScaleOption, "label" | "value"> &
      Partial<Pick<NewScoringScaleOption, "sortOrder">> & { projectId: string };
    output: ScoringScaleOption;
  };
  "scoringScaleOption:update": {
    input: Partial<ScoringScaleOption> &
      Pick<ScoringScaleOption, "id"> & { projectId: string };
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
    input: { projectId: string };
    output: Promise<void>;
  };
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
