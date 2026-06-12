"use client";

import {
  Apple,
  BarChart3,
  Dumbbell,
  Sparkles,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface TabConfig {
  path: string;
  icon: React.ComponentType<{ strokeWidth?: number; className?: string }>;
  label: string;
  ariaLabel: string;
}

const tabs: TabConfig[] = [
  { path: "/workout", icon: Dumbbell, label: "Workout", ariaLabel: "Go to Workout tab" },
  { path: "/nutrition", icon: Apple, label: "Nutrition", ariaLabel: "Go to Nutrition tab" },
  { path: "/plan", icon: Sparkles, label: "Plan", ariaLabel: "Go to Generate Plan tab" },
  { path: "/stats", icon: BarChart3, label: "Stats", ariaLabel: "Go to Stats tab" },
  { path: "/profile", icon: User, label: "Profile", ariaLabel: "Go to Profile tab" },
];

const getPillLeft = (index: number) => `calc(${index * 20}%)`;
  // index === 0 ? `calc(${index * 20}% + 6px)` : index === tabs.length - 1 ? `calc(${index * 20}% - 6px)` : `calc(${index * 20}%)`;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pillLeft, setPillLeft] = useState("0%");

  // Determine active index from pathname
  const getActiveIndex = useCallback((path: string) => {
    const idx = tabs.findIndex(
      (t) => path === t.path || path.startsWith(t.path + "/"),
    );
    return idx >= 0 ? idx : 0;
  }, []);

  // Sync active index with pathname changes
  useEffect(() => {
    const idx = getActiveIndex(pathname);
    setActiveIndex(idx);
    setPillLeft(getPillLeft(idx));
  }, [pathname, getActiveIndex]);

  // Initial pill position
  useEffect(() => {
    const idx = getActiveIndex(pathname);
    setPillLeft(getPillLeft(idx));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetIndex: number,
    href: string,
  ) => {
    if (targetIndex === activeIndex) return;

    e.preventDefault();
    setPillLeft(getPillLeft(targetIndex));
    router.push(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-[64px] border-t border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.8)] backdrop-blur-md px-1.5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      <div className="relative flex h-full w-full items-center ">
        {/* Permanent sliding pill — width 20% (100% / 5 tabs), positioned via percentage left */}
        <div
          className="absolute bottom-0 top-0 z-[-1]  rounded-xl bg-[rgba(195,244,0,0.1)] shadow-[inset_0_0_0_1px_rgba(195,244,0,0.2)] origin-center  "
          style={{
            width: "20% ",
            left: pillLeft,
            transition: "left 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          aria-hidden="true"
        />

        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          const Icon = tab.icon;
          return (
            <a
              key={tab.path}
              href={tab.path}
              onClick={(e) => handleTabClick(e, i, tab.path)}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? "page" : undefined}
              className="relative flex min-h-[44px] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-none bg-transparent px-2 py-2 text-center focus-visible:outline-2 focus-visible:outline-[#c3f400] w-1/5"
            >
              <Icon
                strokeWidth={2}
                className={`h-5 w-5 ${
                  isActive
                    ? "text-[#c3f400] drop-shadow-[0_0_6px_rgba(204,255,0,0.4)]"
                    : "text-[#c4c9ac]"
                }`}
              />
              <span
                className={`font-jetbrains-mono text-[10px] tracking-wide ${
                  isActive ? "text-[#c3f400]" : "text-[#c4c9ac]"
                }`}
              >
                {tab.label.toUpperCase()}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
