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
        remindersTitle: string;
        remindersEnabled: string;
        reminderDaysLabel: string;
        reminderTimeLabel: string;
        saveReminder: string;
        reminderSaved: string;
        nextReminder: string;
        noUpcomingReminders: string;
        dueNow: string;
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
        noLinksHint: string;
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
        general: string;
        new: string;
        folderLabel: string;
    };
    subs: {
        title: string;
        noSubs: string;
        noSubsHint: string;
        next: string;
        trackTitle: string;
        editTitle: string;
        nameLabel: string;
        namePlaceholder: string;
        categoryLabel: string;
        amountLabel: string;
        currencyLabel: string;
        cycleLabel: string;
        dateLabel: string;
        trackButton: string;
        saveButton: string;
        renewButton: string;
        renewedLabel: string;
        monthly: string;
        yearly: string;
        byCategory: string;
        upcoming: string;
        undoDelete: string;
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
            remindersTitle: "Renewal Reminders",
            remindersEnabled: "Enable reminders",
            reminderDaysLabel: "Remind me before (days)",
            reminderTimeLabel: "Reminder time",
            saveReminder: "Save reminder",
            reminderSaved: "Saved",
            nextReminder: "Next reminder",
            noUpcomingReminders: "No upcoming reminders",
            dueNow: "Due now",
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
            noLinks: "No links found",
            noLinksHint: "Tap + to save your first link",
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
            general: "General",
            new: "New",
            folderLabel: "Folder",
        },
        subs: {
            title: "Subscriptions",
            noSubs: "No subscriptions yet",
            noSubsHint: "Tap + to track your first subscription",
            next: "Next:",
            trackTitle: "Track Subscription",
            editTitle: "Edit Subscription",
            nameLabel: "Name",
            namePlaceholder: "Netflix, Spotify...",
            categoryLabel: "Category",
            amountLabel: "Amount",
            currencyLabel: "Currency",
            cycleLabel: "Billing Cycle",
            dateLabel: "Next Bill Date",
            trackButton: "Track Subscription",
            saveButton: "Save Changes",
            renewButton: "Renew",
            renewedLabel: "Renewed",
            monthly: "Monthly",
            yearly: "Yearly",
            byCategory: "By Category",
            upcoming: "Upcoming (Next 7 Days)",
            undoDelete: "Subscription deleted",
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
            remindersTitle: "Напоминания о продлении",
            remindersEnabled: "Включить напоминания",
            reminderDaysLabel: "Напомнить за (дней)",
            reminderTimeLabel: "Время напоминания",
            saveReminder: "Сохранить напоминание",
            reminderSaved: "Сохранено",
            nextReminder: "Следующее напоминание",
            noUpcomingReminders: "Нет ближайших напоминаний",
            dueNow: "Сейчас",
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
            noLinks: "Ссылки не найдены",
            noLinksHint: "Нажмите + чтобы сохранить первую ссылку",
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
            general: "Общее",
            new: "Новая",
            folderLabel: "Папка",
        },
        subs: {
            title: "Подписки",
            noSubs: "Нет подписок",
            noSubsHint: "Нажмите + чтобы добавить первую подписку",
            next: "След:",
            trackTitle: "Добавить подписку",
            editTitle: "Изменить подписку",
            nameLabel: "Название",
            namePlaceholder: "Netflix, Spotify...",
            categoryLabel: "Категория",
            amountLabel: "Сумма",
            currencyLabel: "Валюта",
            cycleLabel: "Цикл оплаты",
            dateLabel: "Дата след. оплаты",
            trackButton: "Добавить",
            saveButton: "Сохранить",
            renewButton: "Продлить",
            renewedLabel: "Продлено",
            monthly: "Ежемесячно",
            yearly: "Ежегодно",
            byCategory: "По категориям",
            upcoming: "Ближайшие (7 дней)",
            undoDelete: "Подписка удалена",
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
            remindersTitle: "Obunani eslatmalar",
            remindersEnabled: "Eslatmalarni yoqish",
            reminderDaysLabel: "Necha kun oldin eslatilsin",
            reminderTimeLabel: "Eslatma vaqti",
            saveReminder: "Eslatmani saqlash",
            reminderSaved: "Saqlandi",
            nextReminder: "Keyingi eslatma",
            noUpcomingReminders: "Yaqin eslatmalar yo'q",
            dueNow: "Hozir eslatish kerak",
        },
        tabs: {
            links: "Havolalar",
            folders: "Faylar",
            subs: "Obunalar",
            settings: "Sozlamalar",
        },
        links: {
            title: "Havolalar",
            searchPlaceholder: "Qidirish...",
            all: "Barchasi",
            noLinks: "Havolalar topilmadi",
            noLinksHint: "Birinchi havolani saqlash uchun + tugmasini bosing",
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
            title: "Fayllar",
            linkCount: "ta havola",
            renameTitle: "Jildni nomlash",
            createTitle: "Yangi jild",
            namePlaceholder: "Jild nomi",
            save: "Saqlash",
            create: "Yaratish",
            general: "Umumiy",
            new: "Yangi",
            folderLabel: "Jild",
        },
        subs: {
            title: "Obunalar",
            noSubs: "Hali obunalar yo'q",
            noSubsHint: "Birinchi obunangizni qo'shish uchun + tugmasini bosing",
            next: "Keyingi:",
            trackTitle: "Obuna qo'shish",
            editTitle: "Obunani tahrirlash",
            nameLabel: "Nomi",
            namePlaceholder: "Netflix, Spotify...",
            categoryLabel: "Toifa",
            amountLabel: "Summa",
            currencyLabel: "Valyuta",
            cycleLabel: "To'lov davri",
            dateLabel: "Keyingi to'lov",
            trackButton: "Qo'shish",
            saveButton: "Saqlash",
            renewButton: "Yangilash",
            renewedLabel: "Yangilandi",
            monthly: "Oylik",
            yearly: "Yillik",
            byCategory: "Toifalar bo'yicha",
            upcoming: "Yaqinlashayotgan (7 kun)",
            undoDelete: "Obuna o'chirildi",
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


