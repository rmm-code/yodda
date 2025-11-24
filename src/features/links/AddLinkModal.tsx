import * as React from "react";
import { useLinkStore } from "./useLinkStore";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FolderSelector } from "./FolderSelector";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddLinkModal({ isOpen, onClose }: AddLinkModalProps) {
    const { addLink, folders } = useLinkStore();

    const [url, setUrl] = React.useState("");
    const [title, setTitle] = React.useState("");
    const [folderId, setFolderId] = React.useState(folders[0]?.id || "default");
    const [note, setNote] = React.useState("");
    const [isFavorite, setIsFavorite] = React.useState(false);

    // Reset form when opening
    React.useEffect(() => {
        if (isOpen) {
            setUrl("");
            setTitle("");
            setNote("");
            setIsFavorite(false);
            setFolderId(folders[0]?.id || "default");
        }
    }, [isOpen, folders]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !title) return;

        addLink({
            url,
            title,
            folder_id: folderId,
            note,
            is_favorite: isFavorite,
        });
        onClose();
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setUrl(text);
        } catch (err) {
            console.error("Failed to read clipboard", err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Save Link">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                    <Input
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        label="URL"
                        required
                        className="flex-1"
                    />
                    <div className="pt-6">
                        <Button type="button" variant="secondary" size="sm" onClick={handlePaste}>
                            Paste
                        </Button>
                    </div>
                </div>

                <Input
                    placeholder="Link Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    label="Title"
                    required
                />

                <FolderSelector selectedFolderId={folderId} onSelect={setFolderId} />

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Note (Optional)</label>
                    <textarea
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={cn(
                            "flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isFavorite
                                ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                    >
                        <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
                        <span>Favorite</span>
                    </button>
                </div>

                <Button type="submit" className="w-full">
                    Save Link
                </Button>
            </form>
        </Modal>
    );
}
