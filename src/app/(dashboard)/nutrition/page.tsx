import { Apple } from "lucide-react";

export default function NutritionPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-6">
      <div className="text-center">
        <Apple className="mx-auto mb-4 h-12 w-12 text-[#c4c9ac]" />
        <h1 className="font-heading text-heading-lg text-on-surface">
          Nutrition
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          Your nutrition tracking will appear here.
        </p>
      </div>
    </div>
  );
}