"use client";

import { useAIPlanDrawer } from "@/hooks/useAIPlanDrawer";
import {
  Apple,
  BarChart3,
  Dumbbell,
  Sparkles,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const getPillLeft = (index: number) => `${index * 25}%`; // 4 tabs = 25% each

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openDrawer } = useAIPlanDrawer();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pillLeft, setPillLeft] = useState("0%");

  // Determine active index from pathname (exclude /plan from nav tabs)
  const getActiveIndex = useCallback((path: string) => {
    // Map /plan to a special index (4, beyond the 4 regular tabs)
    if (path === "/plan" || path.startsWith("/plan/")) {
      return 4;
    }
    const tabs = ["/workout", "/nutrition", "/stats", "/profile"];
    const idx = tabs.findIndex(
      (t) => path === t || path.startsWith(t + "/"),
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
    // Handle AI Plan button click
    if (href === "/plan") {
      e.preventDefault();
      openDrawer();
      return;
    }

    if (targetIndex === activeIndex) return;

    e.preventDefault();
    setPillLeft(getPillLeft(targetIndex));
    router.push(href);
  };

   return (
     <nav
       className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.8)] backdrop-blur-md px-1.5"
       style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
       aria-label="Main navigation"
     >
       <div className="relative flex h-full w-full items-center justify-between">
         {/* Permanent sliding pill — width 25% (100% / 4 tabs), positioned via percentage left */}
         <div
           className="absolute bottom-0 top-0 z-[-1] rounded-xl bg-[rgba(195,244,0,0.1)] shadow-[inset_0_0_0_1px_rgba(195,244,0,0.2)] origin-center"
           style={{
             width: "20%",
             left: pillLeft,
             transition: "left 400ms cubic-bezier(0.4, 0, 0.2, 1)",
           }}
           aria-hidden="true"
         />

         {/* Left tabs */}
         {[
           { path: "/workout", icon: Dumbbell, label: "Workout" },
           { path: "/nutrition", icon: Apple, label: "Nutrition" },
         ].map((tab, i) => {
           const isActive = i === activeIndex;
           const Icon = tab.icon;
           return (
             <a
               key={tab.path}
               href={tab.path}
               onClick={(e) => handleTabClick(e, i, tab.path)}
               aria-label={`Go to ${tab.label} tab`}
               aria-current={isActive ? "page" : undefined}
               className="relative flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-none bg-transparent px-2 py-2 text-center focus-visible:outline-2 focus-visible:outline-[#c3f400]"
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

          {/* AI Plan button — floating circular with outer glow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              openDrawer();
            }}
            aria-label="Open AI Plan Drawer"
            className="group relative flex items-center justify-center"
            style={{
              width: "72px",
              height: "72px",
              marginTop: "-24px",
            }}
          >
            {/* Outer glow layer */}
            <div
              className="absolute -inset-2 rounded-full opacity-80 blur-lg transition-all duration-300 group-hover:opacity-100 group-hover:blur-xl"
              style={{
                background: "radial-gradient(circle, #c3f400 0%, rgba(195,244,0,0.6) 30%, rgba(195,244,0,0.2) 60%, transparent 80%)",
                boxShadow: "0 0 0px rgba(195,244,0,0.5), 0 0 0px rgba(195,244,0,0.3)",
              }}
              aria-hidden="true"
            />

            {/* Inner circle */}
            <div
              className="absolute inset-2 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #d4ff4d 0%, #c3f400 50%, #a8d900 100%)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)",
              }}
              aria-hidden="true"
            />

            {/* Sparkles icon */}
            <Sparkles
              strokeWidth={1.5}
              className="relative z-10 h-7 w-7 text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]"
            />
          </button>

         {/* Right tabs */}
         {[
           { path: "/stats", icon: BarChart3, label: "Stats" },
           { path: "/profile", icon: User, label: "Profile" },
         ].map((tab, i) => {
           const isActive = i + 1 === activeIndex;
           const Icon = tab.icon;
           return (
             <a
               key={tab.path}
               href={tab.path}
               onClick={(e) => handleTabClick(e, i + 1, tab.path)}
               aria-label={`Go to ${tab.label} tab`}
               aria-current={isActive ? "page" : undefined}
               className="relative flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-none bg-transparent px-2 py-2 text-center focus-visible:outline-2 focus-visible:outline-[#c3f400]"
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
