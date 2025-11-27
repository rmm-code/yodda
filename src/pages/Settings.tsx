import { useThemeStore } from "../lib/useThemeStore";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/Card";
import { Moon, Shield, LogOut, Languages, Phone } from "lucide-react";
import { useLanguageStore } from "../lib/useLanguageStore";
import { getTranslations } from "../lib/translations";
import { useUserStore } from "../lib/useUserStore";
import { useEffect } from "react";

export function Settings() {
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const { profile, setProfile } = useUserStore();
    const t = getTranslations(language);

    // Load user data from Telegram WebApp
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
            import('@twa-dev/sdk').then((module) => {
                const WebApp = module.default;
                const initData = WebApp.initDataUnsafe;
                
                if (initData?.user) {
                    const user = initData.user;
                    // phone_number is not available in WebAppUser type, but might be in initData
                    const phoneNumber = (initData as any).user?.phone_number || profile?.phoneNumber;
                    setProfile({
                        id: user.id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        username: user.username,
                        phoneNumber: phoneNumber,
                    });
                }
            }).catch(() => {
                // Not in Telegram, use mock data for development
                if (!profile) {
                    setProfile({
                        id: 123456789,
                        firstName: "John",
                        lastName: "Doe",
                        username: "johndoe",
                        phoneNumber: "+998901234567",
                    });
                }
            });
        }
    }, [setProfile, profile]);

    const languageOptions = [
        { code: "uz", label: "UZ" },
        { code: "ru", label: "RU" },
        { code: "en", label: "EN" },
    ] as const;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 px-4 transition-colors">
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{t.settings.title}</h1>

            <div className="space-y-4">
                {/* Profile Card */}
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                            {profile?.firstName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {profile?.firstName && profile?.lastName
                                    ? `${profile.firstName} ${profile.lastName}`
                                    : profile?.firstName || profile?.username || "User"}
                            </h3>
                            {profile?.username && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {profile?.phoneNumber && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{profile.phoneNumber}</span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="space-y-1 p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <Languages className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{t.settings.languageSelector}</span>
                        </div>
                        <div className="flex space-x-2">
                            {languageOptions.map((option) => (
                                <button
                                    key={option.code}
                                    onClick={() => setLanguage(option.code)}
                                    className={cn(
                                        "rounded-full px-3 py-1 text-sm font-semibold border transition-colors",
                                        language === option.code
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card className="space-y-1 p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div
                        onClick={toggleTheme}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center space-x-3">
                            <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{t.settings.darkMode}</span>
                        </div>
                        <div className={cn("h-6 w-11 rounded-full p-1 transition-colors", theme === 'dark' ? "bg-blue-600" : "bg-gray-200")}>
                            <div className={cn("h-4 w-4 rounded-full bg-white shadow-sm transition-transform", theme === 'dark' ? "translate-x-5" : "translate-x-0")} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">{t.settings.privacy}</span>
                        </div>
                    </div>
                </Card>

                <button className="w-full flex items-center justify-center space-x-2 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <LogOut className="h-5 w-5" />
                    <span>{t.settings.logout}</span>
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
                    {t.settings.version}
                </p>
            </div>
        </div>
    );
}
