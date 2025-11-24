import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Link, Folder, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { Tabs } from "./components/ui/Tabs";
import { LinksHome } from "./features/links/LinksHome";
import { FoldersHome } from "./features/links/FoldersHome";
import { SubsHome } from "./features/subs/SubsHome";
import { Settings } from "./pages/Settings";
import { useThemeStore } from "./lib/useThemeStore";

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const navItems = [
    { label: "Links", icon: Link, path: "/" },
    { label: "Folders", icon: Folder, path: "/folders" },
    { label: "Subs", icon: CreditCard, path: "/subs" },
    { label: "Settings", icon: SettingsIcon, path: "/settings" },
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
