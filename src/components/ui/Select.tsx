import * as React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, children, ...props }, ref) => {
        return (
            <div className="w-full space-y-1">
                {label && (
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
