// electron/repositories/drivers.repo.ts
import { db } from "../../db";
import {
  decisionDriverScoringOptions,
  type DecisionDriverScoringOption,
} from "../../db/schema";

import { eq, and, asc } from "drizzle-orm";

export async function deleteDriverScoringOptionLink(
  input: Pick<DecisionDriverScoringOption, "driverId" | "scoringOptionId">
): Promise<void> {
  const { driverId, scoringOptionId } = input;
  console.log(
    `Deleting Driver-Score Junction Row for ${driverId} and ${scoringOptionId}`
  );
  await db
    .delete(decisionDriverScoringOptions)
    .where(
      and(
        eq(decisionDriverScoringOptions.driverId, driverId),
        eq(decisionDriverScoringOptions.scoringOptionId, scoringOptionId)
      )
    );
}
