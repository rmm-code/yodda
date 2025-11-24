import * as React from "react";
import { useLinkStore } from "./useLinkStore";
import { Card } from "../../components/ui/Card";
import { Folder, Trash2, Edit2 } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

export function FoldersHome() {
    const { folders, links, deleteFolder, updateFolder } = useLinkStore();
    const [editingFolder, setEditingFolder] = React.useState<{ id: string; name: string } | null>(null);

    const getLinkCount = (folderId: string) => {
        return links.filter((l) => l.folder_id === folderId).length;
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFolder && editingFolder.name.trim()) {
            updateFolder(editingFolder.id, editingFolder.name.trim());
            setEditingFolder(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 px-4 transition-colors">
            <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Folders</h1>

            <div className="space-y-3">
                {folders.map((folder) => (
                    <Card key={folder.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Folder className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{folder.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{getLinkCount(folder.id)} links</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setEditingFolder({ id: folder.id, name: folder.name })}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            {folder.id !== "default" && (
                                <button
                                    onClick={() => deleteFolder(folder.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={!!editingFolder}
                onClose={() => setEditingFolder(null)}
                title="Rename Folder"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        value={editingFolder?.name || ""}
                        onChange={(e) =>
                            setEditingFolder((prev) => (prev ? { ...prev, name: e.target.value } : null))
                        }
                        placeholder="Folder Name"
                        required
                    />
                    <Button type="submit" className="w-full">
                        Save Changes
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
