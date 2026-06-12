import LoginForm from "@/components/features/auth/LoginForm";
import OAuthButtons from "@/components/features/auth/OAuthButtons";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <LoginForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4 hover:opacity-80">
          Sign up
        </Link>
      </p>
    </div>
  );
}