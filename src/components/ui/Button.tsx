import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
                        "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
                        "hover:bg-gray-100 text-gray-700": variant === "ghost",
                        "bg-red-50 text-red-600 hover:bg-red-100": variant === "danger",
                        "h-9 px-4 text-sm": size === "sm",
                        "h-11 px-6 text-base": size === "md",
                        "h-14 px-8 text-lg": size === "lg",
                        "h-10 w-10 p-0": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
