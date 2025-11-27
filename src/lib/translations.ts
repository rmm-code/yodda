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
    links: {
        title: string;
        searchPlaceholder: string;
        all: string;
        noLinks: string;
        unknownFolder: string;
        addLink: string;
        urlLabel: string;
        urlPlaceholder: string;
        paste: string;
        titleLabel: string;
        titlePlaceholder: string;
        folderLabel: string;
        noteLabel: string;
        favorite: string;
        save: string;
        loadingPreview: string;
        urlError: string;
    };
    folders: {
        title: string;
        linkCount: string;
        renameTitle: string;
        createTitle: string;
        namePlaceholder: string;
        save: string;
        create: string;
    };
    subs: {
        title: string;
        noSubs: string;
        next: string;
        trackTitle: string;
        nameLabel: string;
        namePlaceholder: string;
        categoryLabel: string;
        amountLabel: string;
        currencyLabel: string;
        cycleLabel: string;
        dateLabel: string;
        trackButton: string;
        monthly: string;
        yearly: string;
        byCategory: string;
        upcoming: string;
        categories: {
            Education: string;
            Productivity: string;
            Entertainment: string;
            Finance: string;
            Health: string;
            Other: string;
        };
        cycles: {
            weekly: string;
            monthly: string;
            yearly: string;
            custom: string;
        };
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
        links: {
            title: "Links",
            searchPlaceholder: "Search links...",
            all: "All",
            noLinks: "No links found.",
            unknownFolder: "Unknown",
            addLink: "Save Link",
            urlLabel: "URL",
            urlPlaceholder: "https://example.com",
            paste: "Paste",
            titleLabel: "Title",
            titlePlaceholder: "Link Title",
            folderLabel: "Folder",
            noteLabel: "Note (Optional)",
            favorite: "Favorite",
            save: "Save Link",
            loadingPreview: "Loading preview...",
            urlError: "Please enter a valid URL (e.g., https://example.com)",
        },
        folders: {
            title: "Folders",
            linkCount: "links",
            renameTitle: "Rename Folder",
            createTitle: "Create New Folder",
            namePlaceholder: "Folder Name",
            save: "Save Changes",
            create: "Create Folder",
        },
        subs: {
            title: "Subscriptions",
            noSubs: "No subscriptions tracked yet.",
            next: "Next:",
            trackTitle: "Track Subscription",
            nameLabel: "Name",
            namePlaceholder: "Netflix, Spotify...",
            categoryLabel: "Category",
            amountLabel: "Amount",
            currencyLabel: "Currency",
            cycleLabel: "Billing Cycle",
            dateLabel: "Next Bill Date",
            trackButton: "Track Subscription",
            monthly: "Monthly",
            yearly: "Yearly",
            byCategory: "By Category",
            upcoming: "Upcoming (Next 7 Days)",
            categories: {
                Education: "Education",
                Productivity: "Productivity",
                Entertainment: "Entertainment",
                Finance: "Finance",
                Health: "Health",
                Other: "Other",
            },
            cycles: {
                weekly: "Weekly",
                monthly: "Monthly",
                yearly: "Yearly",
                custom: "Custom",
            },
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
        links: {
            title: "Ссылки",
            searchPlaceholder: "Поиск ссылок...",
            all: "Все",
            noLinks: "Ссылки не найдены.",
            unknownFolder: "Неизвестно",
            addLink: "Сохранить ссылку",
            urlLabel: "URL",
            urlPlaceholder: "https://example.com",
            paste: "Вставить",
            titleLabel: "Название",
            titlePlaceholder: "Название ссылки",
            folderLabel: "Папка",
            noteLabel: "Заметка (необязательно)",
            favorite: "Избранное",
            save: "Сохранить",
            loadingPreview: "Загрузка превью...",
            urlError: "Введите корректный URL (например, https://example.com)",
        },
        folders: {
            title: "Папки",
            linkCount: "ссылок",
            renameTitle: "Переименовать папку",
            createTitle: "Создать папку",
            namePlaceholder: "Название папки",
            save: "Сохранить",
            create: "Создать",
        },
        subs: {
            title: "Подписки",
            noSubs: "Нет подписок.",
            next: "След:",
            trackTitle: "Добавить подписку",
            nameLabel: "Название",
            namePlaceholder: "Netflix, Spotify...",
            categoryLabel: "Категория",
            amountLabel: "Сумма",
            currencyLabel: "Валюта",
            cycleLabel: "Цикл оплаты",
            dateLabel: "Дата след. оплаты",
            trackButton: "Добавить",
            monthly: "Ежемесячно",
            yearly: "Ежегодно",
            byCategory: "По категориям",
            upcoming: "Ближайшие (7 дней)",
            categories: {
                Education: "Образование",
                Productivity: "Продуктивность",
                Entertainment: "Развлечения",
                Finance: "Финансы",
                Health: "Здоровье",
                Other: "Другое",
            },
            cycles: {
                weekly: "Еженедельно",
                monthly: "Ежемесячно",
                yearly: "Ежегодно",
                custom: "Пользовательский",
            },
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
        links: {
            title: "Havolalar",
            searchPlaceholder: "Qidirish...",
            all: "Barchasi",
            noLinks: "Havolalar topilmadi.",
            unknownFolder: "Noma'lum",
            addLink: "Havolani saqlash",
            urlLabel: "URL",
            urlPlaceholder: "https://example.com",
            paste: "Qo'yish",
            titleLabel: "Nomi",
            titlePlaceholder: "Havola nomi",
            folderLabel: "Jild",
            noteLabel: "Izoh (ixtiyoriy)",
            favorite: "Sevimli",
            save: "Saqlash",
            loadingPreview: "Yuklanmoqda...",
            urlError: "To'g'ri URL kiriting (masalan, https://example.com)",
        },
        folders: {
            title: "Jildlar",
            linkCount: "ta havola",
            renameTitle: "Jildni nomlash",
            createTitle: "Yangi jild",
            namePlaceholder: "Jild nomi",
            save: "Saqlash",
            create: "Yaratish",
        },
        subs: {
            title: "Obunalar",
            noSubs: "Obunalar yo'q.",
            next: "Keyingi:",
            trackTitle: "Obuna qo'shish",
            nameLabel: "Nomi",
            namePlaceholder: "Netflix, Spotify...",
            categoryLabel: "Toifa",
            amountLabel: "Summa",
            currencyLabel: "Valyuta",
            cycleLabel: "To'lov davri",
            dateLabel: "Keyingi to'lov",
            trackButton: "Qo'shish",
            monthly: "Oylik",
            yearly: "Yillik",
            byCategory: "Toifalar bo'yicha",
            upcoming: "Yaqinlashayotgan (7 kun)",
            categories: {
                Education: "Ta'lim",
                Productivity: "Ish unumdorligi",
                Entertainment: "Ko'ngilochar",
                Finance: "Moliya",
                Health: "Salomatlik",
                Other: "Boshqa",
            },
            cycles: {
                weekly: "Haftalik",
                monthly: "Oylik",
                yearly: "Yillik",
                custom: "Boshqa",
            },
        },
    },
};

export const getTranslations = (language: Language) => translations[language];


