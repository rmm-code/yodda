import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Folder {
    id: string;
    name: string;
    position_index: number;
    created_at: string;
}

export interface Link {
    id: string;
    folder_id: string;
    url: string;
    title: string;
    note?: string;
    is_favorite: boolean;
    created_at: string;
}

interface LinkState {
    folders: Folder[];
    links: Link[];
    addFolder: (name: string) => string;
    updateFolder: (id: string, name: string) => void;
    deleteFolder: (id: string) => void;
    reorderFolders: (folders: Folder[]) => void;
    addLink: (link: Omit<Link, "id" | "created_at">) => void;
    updateLink: (id: string, updates: Partial<Link>) => void;
    deleteLink: (id: string) => void;
}

export const useLinkStore = create<LinkState>()(
    persist(
        (set, get) => ({
            folders: [
                { id: "default", name: "General", position_index: 0, created_at: new Date().toISOString() },
            ],
            links: [],

            addFolder: (name) => {
                const newFolder: Folder = {
                    id: uuidv4(),
                    name,
                    position_index: get().folders.length,
                    created_at: new Date().toISOString(),
                };
                set((state) => ({ folders: [...state.folders, newFolder] }));
                return newFolder.id;
            },

            updateFolder: (id, name) => {
                set((state) => ({
                    folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
                }));
            },

            deleteFolder: (id) => {
                set((state) => ({
                    folders: state.folders.filter((f) => f.id !== id),
                    // Move links to default folder or delete them? 
                    // Spec says "Link MUST belong to exactly one folder". 
                    // For MVP, let's delete links in deleted folder to keep it simple, or move to default.
                    // Let's delete for now as per "Delete folder (handle orphan links strategy)" - usually implies deletion or move.
                    // I'll filter out links that belong to this folder.
                    links: state.links.filter((l) => l.folder_id !== id),
                }));
            },

            reorderFolders: (folders) => {
                set({ folders });
            },

            addLink: (linkData) => {
                const newLink: Link = {
                    ...linkData,
                    id: uuidv4(),
                    created_at: new Date().toISOString(),
                };
                set((state) => ({ links: [newLink, ...state.links] }));
            },

            updateLink: (id, updates) => {
                set((state) => ({
                    links: state.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
                }));
            },

            deleteLink: (id) => {
                set((state) => ({
                    links: state.links.filter((l) => l.id !== id),
                }));
            },
        }),
        {
            name: "link-storage",
        }
    )
);
