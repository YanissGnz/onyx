import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_GOALS = ["cut", "maintain", "bulk"];
const VALID_SPLITS = ["PPL", "upper-lower", "full-body", "bro-split", "push-pull", "custom"];
const VALID_EQUIPMENT = [
  "barbell", "dumbbells", "cable-machine", "kettlebell", "resistance-bands",
  "pull-up-bar", "squat-rack", "bench", "leg-press", "lat-pulldown",
  "treadmill", "exercise-bike", "rowing-machine", "smith-machine", "ez-bar",
  "foam-roller", "medicine-ball", "jump-rope",
];

interface ValidationError {
  field: string;
  message: string;
}

function validateOnboardingBody(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (body.weightKg !== undefined && body.weightKg !== null) {
    if (typeof body.weightKg !== "number" || body.weightKg <= 0 || body.weightKg > 350) {
      errors.push({ field: "weightKg", message: "Must be a number between 1 and 350" });
    }
  }

  if (body.goal !== undefined && body.goal !== null) {
    if (!VALID_GOALS.includes(body.goal as string)) {
      errors.push({ field: "goal", message: `Must be one of: ${VALID_GOALS.join(", ")}` });
    }
  }

  if (body.caloricTarget !== undefined && body.caloricTarget !== null) {
    if (typeof body.caloricTarget !== "number" || body.caloricTarget < 1200 || body.caloricTarget > 6000) {
      errors.push({ field: "caloricTarget", message: "Must be a number between 1200 and 6000" });
    }
  }

  if (body.proteinTarget !== undefined && body.proteinTarget !== null) {
    if (typeof body.proteinTarget !== "number" || body.proteinTarget < 30 || body.proteinTarget > 400) {
      errors.push({ field: "proteinTarget", message: "Must be a number between 30 and 400" });
    }
  }

  if (body.equipment !== undefined && body.equipment !== null) {
    if (!Array.isArray(body.equipment)) {
      errors.push({ field: "equipment", message: "Must be an array of equipment strings" });
    } else {
      const invalid = (body.equipment as string[]).filter((e) => !VALID_EQUIPMENT.includes(e));
      if (invalid.length > 0) {
        errors.push({ field: "equipment", message: `Invalid equipment: ${invalid.join(", ")}` });
      }
    }
  }

  if (body.preferredSplit !== undefined && body.preferredSplit !== null) {
    if (!VALID_SPLITS.includes(body.preferredSplit as string)) {
      errors.push({ field: "preferredSplit", message: `Must be one of: ${VALID_SPLITS.join(", ")}` });
    }
  }

  if (body.sessionDuration !== undefined && body.sessionDuration !== null) {
    if (typeof body.sessionDuration !== "number" || body.sessionDuration < 15 || body.sessionDuration > 180) {
      errors.push({ field: "sessionDuration", message: "Must be a number between 15 and 180" });
    }
  }

  if (body.trainingDays !== undefined && body.trainingDays !== null) {
    if (typeof body.trainingDays !== "number" || body.trainingDays < 1 || body.trainingDays > 7) {
      errors.push({ field: "trainingDays", message: "Must be a number between 1 and 7" });
    }
  }

  if (body.preferredIngredients !== undefined && body.preferredIngredients !== null) {
    if (!Array.isArray(body.preferredIngredients)) {
      errors.push({ field: "preferredIngredients", message: "Must be an array of strings" });
    }
  }

  if (body.excludedIngredients !== undefined && body.excludedIngredients !== null) {
    if (!Array.isArray(body.excludedIngredients)) {
      errors.push({ field: "excludedIngredients", message: "Must be an array of strings" });
    }
  }

  if (body.cuisineStyle !== undefined && body.cuisineStyle !== null) {
    if (typeof body.cuisineStyle !== "string") {
      errors.push({ field: "cuisineStyle", message: "Must be a string" });
    }
  }

  return errors;
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } },
        { status: 400 }
      );
    }

    // Validate input
    const validationErrors = validateOnboardingBody(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid fields", details: validationErrors } },
        { status: 400 }
      );
    }

    // Build update object with only provided fields (strip null/undefined)
    const updates: Record<string, unknown> = {};

    if (body.weightKg !== undefined && body.weightKg !== null) updates.weight_kg = body.weightKg;
    if (body.goal !== undefined && body.goal !== null) updates.goal = body.goal;
    if (body.caloricTarget !== undefined && body.caloricTarget !== null) updates.caloric_target = body.caloricTarget;
    if (body.proteinTarget !== undefined && body.proteinTarget !== null) updates.protein_target = body.proteinTarget;
    if (body.equipment !== undefined && body.equipment !== null) updates.equipment = body.equipment;
    if (body.preferredSplit !== undefined && body.preferredSplit !== null) updates.preferred_split = body.preferredSplit;
    if (body.sessionDuration !== undefined && body.sessionDuration !== null) updates.session_duration = body.sessionDuration;
    if (body.trainingDays !== undefined && body.trainingDays !== null) updates.training_days = body.trainingDays;
    if (body.preferredIngredients !== undefined && body.preferredIngredients !== null) updates.preferred_ingredients = body.preferredIngredients;
    if (body.excludedIngredients !== undefined && body.excludedIngredients !== null) updates.excluded_ingredients = body.excludedIngredients;
    if (body.cuisineStyle !== undefined && body.cuisineStyle !== null) updates.cuisine_style = body.cuisineStyle;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: { code: "NO_FIELDS", message: "No valid fields to update" } },
        { status: 400 }
      );
    }

    // Upsert: try update first, then insert if no matching row
    // Using upsert with onConflict ensures the profile row always exists
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          ...updates,
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      );

    if (upsertError) {
      console.error("Supabase profile upsert error:", upsertError);
      console.error("Updates payload:", JSON.stringify(updates));
      console.error("User ID:", user.id);
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: upsertError.message, details: upsertError } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err) {
    console.error("Onboarding API error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
