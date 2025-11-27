import * as React from "react";
import { Plus, Search, Star, ExternalLink, Trash2 } from "lucide-react";
import { useLinkStore } from "./useLinkStore";
import { AddLinkModal } from "./AddLinkModal";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";
import { useLanguageStore } from "../../lib/useLanguageStore";
import { getTranslations } from "../../lib/translations";

export function LinksHome() {
    const { links, folders, deleteLink } = useLinkStore();
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
    const { language } = useLanguageStore();
    const t = getTranslations(language);

    const filteredLinks = links.filter((link) => {
        const matchesSearch =
            link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = selectedFolderId ? link.folder_id === selectedFolderId : true;
        return matchesSearch && matchesFolder;
    });

    const getFolderName = (id: string) => {
        if (id === "default") return t.folders.general;
        return folders.find((f) => f.id === id)?.name || t.links.unknownFolder;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 px-4 transition-colors">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.links.title}</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-full bg-blue-600 p-2 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-blue-700"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>

            {/* Search */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder={t.links.searchPlaceholder}
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Folder Filters */}
            <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setSelectedFolderId(null)}
                    className={cn(
                        "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
                        selectedFolderId === null
                            ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                            : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}
                >
                    {t.links.all}
                </button>
                {folders.map((folder) => (
                    <button
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={cn(
                            "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
                            selectedFolderId === folder.id
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500"
                                : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        )}
                    >
                        {folder.id === "default" ? t.folders.general : folder.name}
                    </button>
                ))}
            </div>

            {/* Link List */}
            <div className="space-y-3">
                {filteredLinks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                            <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{t.links.noLinks}</p>
                    </div>
                ) : (
                    filteredLinks.map((link) => (
                        <Card key={link.id} className="flex flex-col space-y-2 overflow-hidden">
                            {link.thumbnail && (
                                <div className="w-full h-32 -mx-2 -mt-2 mb-2 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                    <img
                                        src={link.thumbnail}
                                        alt={link.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{link.title}</h3>
                                    {link.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {link.description}
                                        </p>
                                    )}
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        <ExternalLink className="mr-1 h-3 w-3 flex-shrink-0" />
                                        <span className="line-clamp-1">
                                            {link.site_name || (() => {
                                                try {
                                                    return new URL(link.url).hostname;
                                                } catch {
                                                    return link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url;
                                                }
                                            })()}
                                        </span>
                                    </a>
                                </div>
                                {link.is_favorite && (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0 ml-2" />
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {getFolderName(link.folder_id)}
                                </span>
                                <button
                                    onClick={() => deleteLink(link.id)}
                                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <AddLinkModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
}

