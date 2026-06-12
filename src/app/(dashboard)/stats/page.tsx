import { BarChart3 } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-6">
      <div className="text-center">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-[#c4c9ac]" />
        <h1 className="font-heading text-heading-lg text-on-surface">
          Stats
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          Your statistics and progress will appear here.
        </p>
      </div>
    </div>
  );
}