// electron/repositories/drivers/update.repo.ts
import { db } from "../../db";
import {
  decisionDrivers,
  type DecisionDriver,
  decisionDriverScoringOptions,
  scoringScaleOptions,
  type ScoringScaleOption,
  itemDriverScores,
} from "../../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { calculateAllItemScores } from "../items";

export async function updateDriver(
  input: Partial<DecisionDriver> &
    Pick<DecisionDriver, "id"> & {
      scoringOptions?: Pick<
        ScoringScaleOption,
        "id" | "label" | "value" | "sortOrder"
      >[];
    }
): Promise<DecisionDriver> {
  const now = new Date().toISOString();

  // Handle archived state: set archivedOn accordingly
  let archivedOnValue: string | null = null;
  if (typeof input.archived !== "undefined") {
    archivedOnValue = input.archived === 1 ? now : null;
  }

  const driverFields: Partial<DecisionDriver> = {
    name: input.name,
    description: input.description,
    weight: input.weight,
    archived: input.archived,
    archivedOn: archivedOnValue,
    updatedOn: now,
  };

  // Update the driver
  const [driver] = await db
    .update(decisionDrivers)
    .set(driverFields)
    .where(eq(decisionDrivers.id, input.id))
    .returning();

  // Handle scoring options if provided
  if (input.scoringOptions) {
    console.log("Passing in score options on update: ", input.scoringOptions);
    // Get existing scoring options for this driver
    const existingOptions = await db
      .select()
      .from(decisionDriverScoringOptions)
      .where(eq(decisionDriverScoringOptions.driverId, input.id));

    // Extract IDs of existing options
    const existingOptionIds = existingOptions.map((e) => e.scoringOptionId);

    // Process scoring options
    const optionsToCreate = [];
    const optionsToUpdate = [];
    const optionsToDelete: string[] = [];

    // Separate options to create, update, or delete
    for (const option of input.scoringOptions) {
      // Check if this option already exists by matching the ID
      const existingOption = existingOptions.find(
        (e) => e.scoringOptionId === option.id
      );

      if (existingOption) {
        // Option exists - mark for update
        optionsToUpdate.push({ ...option });
      } else if (option.id && option.id.startsWith("temp-")) {
        // This is a temporary ID for a new option - create it
        optionsToCreate.push({ ...option, id: undefined });
      } else if (!option.id) {
        // This is a new option without an ID - create it
        optionsToCreate.push({ ...option });
      } else {
        // This is an existing option with a real ID - update it
        optionsToUpdate.push({ ...option });
      }
    }

    // Find options to delete (exist in DB but not in input)
    for (const existingOptionId of existingOptionIds) {
      // Check if this existing option is present in the input options
      const isPresent = input.scoringOptions.some(
        (opt) => opt.id === existingOptionId
      );
      if (!isPresent) {
        optionsToDelete.push(existingOptionId);
      }
    }

    // Perform database operations
    // 1. Delete options that are no longer referenced
    if (optionsToDelete.length > 0) {
      console.log("Options to be deleted", optionsToDelete);

      try {
        db.transaction((tx) => {
          // Delete from junction table first
          tx.delete(decisionDriverScoringOptions)
            .where(
              and(
                eq(decisionDriverScoringOptions.driverId, input.id),
                inArray(
                  decisionDriverScoringOptions.scoringOptionId,
                  optionsToDelete
                )
              )
            )
            .run();

          // Then null the value from the item_driver_score table
          tx.update(itemDriverScores)
            .set({
              value: null,
            })
            .where(
              inArray(itemDriverScores.scoringScaleOptionId, optionsToDelete)
            )
            .run();

          // Then delete from the scoring scale options table
          tx.delete(scoringScaleOptions)
            .where(inArray(scoringScaleOptions.id, optionsToDelete))
            .run();
        });
      } catch (error) {
        console.error("Error deleting options:", error);
        throw error;
      }
    }

    // 2. Update existing options
    for (const option of optionsToUpdate) {
      if (option.id && !option.id.startsWith("temp-")) {
        // Update the Scoring Scale Option
        await db
          .update(scoringScaleOptions)
          .set({
            label: option.label,
            value: option.value,
            sortOrder: option.sortOrder,
            updatedOn: now,
          })
          .where(eq(scoringScaleOptions.id, option.id));
        await db
          .update(itemDriverScores)
          .set({
            value: option.value,
          })
          .where(eq(itemDriverScores.scoringScaleOptionId, option.id));
      }
    }

    // 3. Create new options
    for (const option of optionsToCreate) {
      const newOption = await db
        .insert(scoringScaleOptions)
        .values({
          id: globalThis.crypto?.randomUUID?.(),
          label: option.label,
          value: option.value,
          sortOrder: option.sortOrder,
          createdOn: now,
          updatedOn: now,
        })
        .returning();

      // Link new option to driver
      await db.insert(decisionDriverScoringOptions).values({
        driverId: input.id,
        scoringOptionId: newOption[0].id,
      });
    }

    // 4. Recalculate Item Scores if options were deleted or updated
    if (optionsToUpdate.length > 0 || optionsToDelete.length > 0) {
      await calculateAllItemScores(input.projectId as string);
    }
  }

  return driver;
}
