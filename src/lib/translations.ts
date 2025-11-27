import type { Language } from "./useLanguageStore";

type TranslationSection = {
    settings: {
        title: string;
        darkMode: string;
        notifications: string;
        privacy: string;
        logout: string;
        languageSelector: string;
        version: string;
    };
    tabs: {
        links: string;
        folders: string;
        subs: string;
        settings: string;
    };
};

const translations: Record<Language, TranslationSection> = {
    en: {
        settings: {
            title: "Settings",
            darkMode: "Dark Mode",
            notifications: "Notifications",
            privacy: "Privacy",
            logout: "Log Out",
            languageSelector: "Language",
            version: "Version 1.0.0 • Yodda",
        },
        tabs: {
            links: "Links",
            folders: "Folders",
            subs: "Subs",
            settings: "Settings",
        },
    },
    ru: {
        settings: {
            title: "Настройки",
            darkMode: "Темный режим",
            notifications: "Уведомления",
            privacy: "Конфиденциальность",
            logout: "Выйти",
            languageSelector: "Язык",
            version: "Версия 1.0.0 • Yodda",
        },
        tabs: {
            links: "Ссылки",
            folders: "Папки",
            subs: "Подписки",
            settings: "Настройки",
        },
    },
    uz: {
        settings: {
            title: "Sozlamalar",
            darkMode: "Tungi rejim",
            notifications: "Bildirishnomalar",
            privacy: "Maxfiylik",
            logout: "Chiqish",
            languageSelector: "Til",
            version: "Versiya 1.0.0 • Yodda",
        },
        tabs: {
            links: "Havolalar",
            folders: "Jildlar",
            subs: "Obunalar",
            settings: "Sozlamalar",
        },
    },
};

export const getTranslations = (language: Language) => translations[language];


