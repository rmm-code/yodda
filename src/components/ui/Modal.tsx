import * as React from "react";
import { X } from "lucide-react";


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-md transform rounded-t-2xl bg-white p-6 shadow-xl transition-all sm:rounded-2xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
