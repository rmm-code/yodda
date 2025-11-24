import { useThemeStore } from "../lib/useThemeStore";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/Card";
import { Moon, Bell, Shield, LogOut } from "lucide-react";

export function Settings() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 px-4 transition-colors">
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

            <div className="space-y-4">
                <Card className="space-y-1 p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div
                        onClick={toggleTheme}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center space-x-3">
                            <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                        </div>
                        <div className={cn("h-6 w-11 rounded-full p-1 transition-colors", theme === 'dark' ? "bg-blue-600" : "bg-gray-200")}>
                            <div className={cn("h-4 w-4 rounded-full bg-white shadow-sm transition-transform", theme === 'dark' ? "translate-x-5" : "translate-x-0")} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">Notifications</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">Privacy</span>
                        </div>
                    </div>
                </Card>

                <button className="w-full flex items-center justify-center space-x-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
                    Version 1.0.0 • SaqlaBot
                </p>
            </div>
        </div>
    );
}
