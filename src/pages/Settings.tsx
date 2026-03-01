import * as React from "react";
import { useThemeStore } from "../lib/useThemeStore";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/Card";
import { Moon, Shield, LogOut, Languages, Phone, Bell } from "lucide-react";
import { useLanguageStore } from "../lib/useLanguageStore";
import { getTranslations } from "../lib/translations";
import { useUserStore } from "../lib/useUserStore";
import { useSubStore } from "../features/subs/useSubStore";

type ReminderItem = {
    name: string;
    reminderAt: Date;
    renewal: Date;
};

const getLocaleByLanguage = (language: "en" | "ru" | "uz") =>
    language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "uz-UZ";

const parseReminderTime = (value: string) => {
    const [hour, minute] = value.split(":").map((part) => Number(part));
    return {
        hour: Number.isNaN(hour) ? 9 : hour,
        minute: Number.isNaN(minute) ? 0 : minute,
    };
};

const buildReminderItems = (
    subscriptions: Array<{ name: string; next_billing_date: string }>,
    reminderDays: number,
    reminderTime: string
): ReminderItem[] => {
    const { hour, minute } = parseReminderTime(reminderTime);

    return subscriptions.map((sub) => {
        const renewal = new Date(sub.next_billing_date);
        const reminderAt = new Date(renewal);
        reminderAt.setDate(reminderAt.getDate() - reminderDays);
        reminderAt.setHours(hour, minute, 0, 0);
        return { name: sub.name, reminderAt, renewal };
    });
};

const getParamFromSearchOrHash = (key: string): string | null => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
    return searchParams.get(key) || hashParams.get(key);
};

export function Settings() {
    const { theme, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const { profile, setProfile, updateProfile } = useUserStore();
    const { subscriptions } = useSubStore();
    const t = getTranslations(language);

    const [photoError, setPhotoError] = React.useState(false);
    const [remindersEnabled, setRemindersEnabled] = React.useState(true);
    const [reminderDays, setReminderDays] = React.useState(3);
    const [reminderTime, setReminderTime] = React.useState("09:00");
    const [isReminderSaved, setIsReminderSaved] = React.useState(false);

    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                if (typeof window === "undefined") {
                    return;
                }

                const phoneFromUrl = getParamFromSearchOrHash("phone");
                const photoFromUrl = getParamFromSearchOrHash("photo");
                const firstNameFromUrl = getParamFromSearchOrHash("first_name");
                const lastNameFromUrl = getParamFromSearchOrHash("last_name");
                const usernameFromUrl = getParamFromSearchOrHash("username");
                const hasProfileFromUrl = Boolean(
                    phoneFromUrl || photoFromUrl || firstNameFromUrl || lastNameFromUrl || usernameFromUrl
                );

                let webAppUser: {
                    id: number;
                    first_name?: string;
                    last_name?: string;
                    username?: string;
                } | null = null;

                try {
                    const module = await import("@twa-dev/sdk");
                    const webApp = module.default;

                    if (
                        !webApp.initDataUnsafe &&
                        (window as Window & { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp
                    ) {
                        await new Promise((resolve) => setTimeout(resolve, 200));
                    }

                    webAppUser = webApp.initDataUnsafe?.user || null;
                } catch {
                    webAppUser = null;
                }

                if (webAppUser) {
                    setProfile({
                        id: webAppUser.id,
                        firstName: webAppUser.first_name || undefined,
                        lastName: webAppUser.last_name || undefined,
                        username: webAppUser.username || undefined,
                        phoneNumber: phoneFromUrl || undefined,
                        photoUrl: photoFromUrl || undefined,
                    });
                    return;
                }

                if (hasProfileFromUrl) {
                    setProfile({
                        firstName: firstNameFromUrl || undefined,
                        lastName: lastNameFromUrl || undefined,
                        username: usernameFromUrl || undefined,
                        phoneNumber: phoneFromUrl || undefined,
                        photoUrl: photoFromUrl || undefined,
                    });
                    return;
                }

                const isTelegram = Boolean(
                    (window as Window & { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp ||
                        window.location.href.includes("t.me")
                );

                if (!isTelegram && !profile) {
                    setProfile({
                        id: 123456789,
                        firstName: "John",
                        lastName: "Doe",
                        username: "johndoe",
                        phoneNumber: "+998901234567",
                    });
                }
            } catch (error) {
                console.error("Error loading user data:", error);

                const phoneFromUrl = getParamFromSearchOrHash("phone");
                const photoFromUrl = getParamFromSearchOrHash("photo");
                const firstNameFromUrl = getParamFromSearchOrHash("first_name");
                const lastNameFromUrl = getParamFromSearchOrHash("last_name");
                const usernameFromUrl = getParamFromSearchOrHash("username");

                if (phoneFromUrl || photoFromUrl || firstNameFromUrl || lastNameFromUrl || usernameFromUrl) {
                    setProfile({
                        firstName: firstNameFromUrl || undefined,
                        lastName: lastNameFromUrl || undefined,
                        username: usernameFromUrl || undefined,
                        phoneNumber: phoneFromUrl || undefined,
                        photoUrl: photoFromUrl || undefined,
                    });
                }
            }
        };

        loadUserData();
    }, [setProfile]);

    React.useEffect(() => {
        setPhotoError(false);
    }, [profile?.photoUrl]);

    React.useEffect(() => {
        const pref = profile?.reminderPreference;
        if (!pref) {
            return;
        }

        setRemindersEnabled(pref.enabled);
        setReminderDays(pref.leadDays);
        setReminderTime(pref.reminderTime);
    }, [profile?.reminderPreference]);

    const nextReminderText = React.useMemo(() => {
        if (!remindersEnabled) {
            return null;
        }
        const locale = getLocaleByLanguage(language);
        const now = new Date();
        const nextReminder = buildReminderItems(subscriptions, reminderDays, reminderTime)
            .filter((item) => item.renewal >= now)
            .sort((a, b) => a.reminderAt.getTime() - b.reminderAt.getTime())[0];

        if (!nextReminder) {
            return null;
        }

        return `${nextReminder.name} • ${nextReminder.reminderAt.toLocaleString(locale)}`;
    }, [remindersEnabled, reminderDays, reminderTime, subscriptions, language]);

    const dueReminderNames = React.useMemo(() => {
        if (!remindersEnabled) {
            return [] as string[];
        }
        const now = new Date();

        return buildReminderItems(subscriptions, reminderDays, reminderTime)
            .filter((item) => now >= item.reminderAt && now <= item.renewal)
            .map((item) => item.name);
    }, [remindersEnabled, reminderDays, reminderTime, subscriptions]);

    const saveReminderPreference = () => {
        updateProfile({
            reminderPreference: {
                enabled: remindersEnabled,
                leadDays: reminderDays,
                reminderTime,
            },
        });
        setIsReminderSaved(true);
        window.setTimeout(() => setIsReminderSaved(false), 1500);
    };

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
                        {profile?.photoUrl && !photoError ? (
                            <img
                                src={profile.photoUrl}
                                alt={profile.firstName || "User"}
                                className="h-12 w-12 rounded-full object-cover border-2 border-blue-600"
                                onError={() => setPhotoError(true)}
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                                {profile?.firstName?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                        )}
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

                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{t.settings.remindersTitle}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t.settings.remindersEnabled}</span>
                        <button
                            onClick={() => setRemindersEnabled((value) => !value)}
                            className={cn("h-6 w-11 rounded-full p-1 transition-colors", remindersEnabled ? "bg-blue-600" : "bg-gray-200")}
                        >
                            <div className={cn("h-4 w-4 rounded-full bg-white shadow-sm transition-transform", remindersEnabled ? "translate-x-5" : "translate-x-0")} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{t.settings.reminderDaysLabel}</span>
                            <input
                                type="number"
                                min={0}
                                max={30}
                                value={reminderDays}
                                onChange={(event) => setReminderDays(Math.max(0, Math.min(30, Number(event.target.value) || 0)))}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </label>

                        <label className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{t.settings.reminderTimeLabel}</span>
                            <input
                                type="time"
                                value={reminderTime}
                                onChange={(event) => setReminderTime(event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </label>
                    </div>

                    <button
                        onClick={saveReminderPreference}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {isReminderSaved ? t.settings.reminderSaved : t.settings.saveReminder}
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.settings.nextReminder}: {nextReminderText || t.settings.noUpcomingReminders}
                    </p>
                    {dueReminderNames.length > 0 && (
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            {t.settings.dueNow}: {dueReminderNames.join(", ")}
                        </p>
                    )}
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
