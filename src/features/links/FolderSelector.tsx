import * as React from "react";
import { Plus } from "lucide-react";
import { useLinkStore } from "./useLinkStore";
import { cn } from "../../lib/utils";
import { useLanguageStore } from "../../lib/useLanguageStore";
import { getTranslations } from "../../lib/translations";

interface FolderSelectorProps {
    selectedFolderId: string;
    onSelect: (folderId: string) => void;
}

export function FolderSelector({ selectedFolderId, onSelect }: FolderSelectorProps) {
    const { folders, addFolder } = useLinkStore();
    const [isCreating, setIsCreating] = React.useState(false);
    const [newFolderName, setNewFolderName] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { language } = useLanguageStore();
    const t = getTranslations(language);

    const handleCreate = () => {
        if (newFolderName.trim()) {
            const newId = addFolder(newFolderName.trim());
            onSelect(newId);
            setNewFolderName("");
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCreate();
        }
    };

    React.useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.folders.folderLabel}</label>
            <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                {folders.map((folder) => (
                    <button
                        key={folder.id}
                        type="button"
                        onClick={() => onSelect(folder.id)}
                        className={cn(
                            "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
                            selectedFolderId === folder.id
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                    >
                        {folder.id === "default" ? t.folders.general : folder.name}
                    </button>
                ))}

                {isCreating ? (
                    <div className="flex items-center space-x-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 dark:bg-blue-900/30 dark:border-blue-500">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={() => {
                                if (!newFolderName) setIsCreating(false);
                            }}
                            className="w-20 bg-transparent text-sm text-blue-700 focus:outline-none dark:text-blue-400"
                            placeholder={t.folders.namePlaceholder}
                        />
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="flex-shrink-0 flex items-center space-x-1 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300"
                    >
                        <Plus className="h-3 w-3" />
                        <span>{t.folders.new}</span>
                    </button>
                )}
            </div>
        </div>
    );
}

