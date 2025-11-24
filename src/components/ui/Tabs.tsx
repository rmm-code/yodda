import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

interface TabItem {
    label: string;
    icon: React.ElementType;
    path: string;
}

interface TabsProps {
    items: TabItem[];
}

export function Tabs({ items }: TabsProps) {
    const location = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-safe dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-16 items-center justify-around">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center space-y-1 py-1 text-xs font-medium transition-colors",
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
