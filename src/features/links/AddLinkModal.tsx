import * as React from "react";
import { useLinkStore } from "./useLinkStore";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { FolderSelector } from "./FolderSelector";
import { Star, Loader2, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";
import { fetchLinkPreview, type LinkPreview } from "../../lib/linkPreview";

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
    const [urlError, setUrlError] = React.useState("");
    const [preview, setPreview] = React.useState<LinkPreview | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

    // Reset form when opening
    React.useEffect(() => {
        if (isOpen) {
            setUrl("");
            setTitle("");
            setNote("");
            setIsFavorite(false);
            setFolderId(folders[0]?.id || "default");
            setUrlError("");
            setPreview(null);
            setIsLoadingPreview(false);
        }
    }, [isOpen, folders]);

    // Fetch preview when URL is valid
    React.useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!url.trim()) {
                setPreview(null);
                return;
            }

            let normalizedUrl = url.trim();
            if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
                normalizedUrl = `https://${normalizedUrl}`;
            }

            if (validateUrl(normalizedUrl)) {
                setIsLoadingPreview(true);
                const previewData = await fetchLinkPreview(normalizedUrl);
                setPreview(previewData);
                if (previewData?.title && !title) {
                    setTitle(previewData.title);
                }
                setIsLoadingPreview(false);
            } else {
                setPreview(null);
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
    }, [url]);

    const validateUrl = (urlString: string): boolean => {
        if (!urlString.trim()) return false;
        try {
            // Try to parse as URL
            const url = new URL(urlString);
            // Check if it has a valid protocol
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            // If URL parsing fails, try adding https://
            try {
                const url = new URL(`https://${urlString}`);
                return url.hostname.length > 0;
            } catch {
                return false;
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !title) return;

        // Validate URL
        if (!validateUrl(url)) {
            setUrlError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        // Normalize URL - add https:// if missing
        let normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = `https://${normalizedUrl}`;
        }

        addLink({
            url: normalizedUrl,
            title,
            folder_id: folderId,
            note,
            is_favorite: isFavorite,
            thumbnail: preview?.image,
            description: preview?.description,
            site_name: preview?.siteName,
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
                <div className="space-y-1">
                    <div className="flex space-x-2">
                        <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                if (urlError) setUrlError("");
                            }}
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
                    {urlError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{urlError}</p>
                    )}
                </div>

                <Input
                    placeholder="Link Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    label="Title"
                    required
                />

                {/* Link Preview */}
                {preview && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                        {preview.image && (
                            <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                <img
                                    src={preview.image}
                                    alt={preview.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    {preview.title}
                                </h4>
                                {isLoadingPreview && (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                )}
                            </div>
                            {preview.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {preview.description}
                                </p>
                            )}
                            {preview.siteName && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {preview.siteName}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {isLoadingPreview && !preview && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading preview...</span>
                    </div>
                )}

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
