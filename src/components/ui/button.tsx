import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#347468]/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#244f45] text-white shadow-[0_10px_24px_rgba(36,79,69,0.18)] hover:bg-[#347468] hover:-translate-y-0.5",
        secondary:
          "border border-[#d7e3ce] bg-[#f4fbf3] text-[#347468] hover:border-[#244f45] hover:bg-white hover:-translate-y-0.5",
        outline:
          "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:-translate-y-0.5",
        ghost: "text-neutral-700 hover:bg-[#f4fbf3] hover:text-[#244f45]",
        danger:
          "border border-red-200 bg-white text-red-700 hover:bg-red-50",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
