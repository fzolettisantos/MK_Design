import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** <select> nativo estilizado (teclado e leitores de tela de graça). */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-12 w-full appearance-none rounded-input border border-neutral-mid bg-surface px-4 pr-10 text-base text-brand-ink aria-[invalid=true]:border-2 aria-[invalid=true]:border-error",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2" aria-hidden="true" />
    </div>
  ),
);
Select.displayName = "Select";
