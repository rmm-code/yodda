import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Link, Folder, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { Tabs } from "./components/ui/Tabs";
import { LinksHome } from "./features/links/LinksHome";
import { FoldersHome } from "./features/links/FoldersHome";
import { SubsHome } from "./features/subs/SubsHome";
import { Settings } from "./pages/Settings";
import { useThemeStore } from "./lib/useThemeStore";
import { useLanguageStore, type Language } from "./lib/useLanguageStore";
import { getTranslations } from "./lib/translations";

function App() {
  const { theme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const t = getTranslations(language);

  // Check URL parameter for language on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Language | null;
    if (langParam && (langParam === 'uz' || langParam === 'ru' || langParam === 'en')) {
      setLanguage(langParam);
    }
  }, [setLanguage]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const navItems = [
    { label: t.tabs.links, icon: Link, path: "/" },
    { label: t.tabs.folders, icon: Folder, path: "/folders" },
    { label: t.tabs.subs, icon: CreditCard, path: "/subs" },
    { label: t.tabs.settings, icon: SettingsIcon, path: "/settings" },
  ];

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors">
        <Routes>
          <Route path="/" element={<LinksHome />} />
          <Route path="/folders" element={<FoldersHome />} />
          <Route path="/subs" element={<SubsHome />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Tabs items={navItems} />
      </div>
    </HashRouter>
  );
}

export default App;
