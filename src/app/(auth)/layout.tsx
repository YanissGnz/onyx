import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ONYX — Sign In",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-heading-xl font-heading text-foreground">ONYX</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Unified workout and nutrition orchestrator
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}