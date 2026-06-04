 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  currentUser: {
    name?: string;
    email: string;
  } | null;
  onSignOut: () => void;
};

export function AppHeader({ currentUser, onSignOut }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#d7e3ce] bg-white/88 backdrop-blur-xl">
      <div className="bg-[#7d8b38] px-6 py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#fff2b8]">
        Familie Kompas
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:min-h-24 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="Familie Kompas dashboard"
            className="rounded-full"
          >
            <BrandLogo size="sm" className="sm:h-16 sm:w-16" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#347468]">
              Thuisbasis
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[#5e6656]">
              Taken, ritme en kleine overwinningen
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:items-end">
          {currentUser ? (
            <div className="hidden text-sm text-neutral-600 sm:block sm:text-right">
              <p className="font-semibold text-neutral-950">
                {currentUser.name ?? currentUser.email}
              </p>
              <p>{currentUser.email}</p>
            </div>
          ) : null}
          <nav className="grid w-full min-w-0 gap-2 sm:w-auto sm:grid-cols-[auto_auto]">
            <Link
              href="/overzicht"
              className={cn(
                getNavClass(pathname === "/overzicht"),
                "h-11 w-full justify-center sm:col-span-2",
              )}
            >
              <CalendarCheck2 className="h-4 w-4" />
              Vandaag
            </Link>
            <div className="grid min-w-0 grid-cols-[1.2fr_0.8fr_2.75rem] gap-1 rounded-3xl border border-[#d7e3ce] bg-[#f4fbf3] p-1 shadow-sm sm:col-span-2 sm:grid-cols-3 sm:gap-2">
              <Link href="/" className={getNavClass(pathname === "/")}>
                <LayoutDashboard className="h-4 w-4" />
                <span className="truncate">Dashboard</span>
              </Link>
              <Link href="/team" className={getNavClass(pathname === "/team")}>
                <UsersRound className="h-4 w-4" />
                <span className="truncate">Gezin</span>
              </Link>
              <Button
                onClick={onSignOut}
                variant="outline"
                size="sm"
                aria-label="Uitloggen"
                title="Uitloggen"
                className="min-w-0 px-2 sm:w-auto"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Uitloggen</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function getNavClass(isActive: boolean) {
  return cn(
    buttonVariants({
      variant: isActive ? "default" : "secondary",
      size: "sm",
    }),
    "min-w-0 px-2 no-underline [&>svg]:shrink-0",
  );
}
