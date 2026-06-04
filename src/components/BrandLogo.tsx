import { Home, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
};

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  return (
    <span
      aria-label="Familie Kompas"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#244f45] text-[#fff2b8] shadow-sm ring-4 ring-[#fff2b8]",
        sizes[size],
        className,
      )}
    >
      <Home className="h-1/2 w-1/2" aria-hidden="true" />
      <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e66d35] text-white ring-2 ring-[#fffdf7]">
        <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </span>
  );
}
