import * as React from "react";
import { Plus, Trash2, Pencil, RefreshCw } from "lucide-react";
import { useSubStore, type Subscription } from "./useSubStore";
import { AddSubForm } from "./AddSubForm";
import { Card } from "../../components/ui/Card";
import { SpendingDashboard } from "./SpendingDashboard";
import { useLanguageStore } from "../../lib/useLanguageStore";
import { getTranslations } from "../../lib/translations";

export function SubsHome() {
    const { subscriptions, deleteSubscription, updateSubscription } = useSubStore();
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [editingSub, setEditingSub] = React.useState<Subscription | null>(null);
    const [undoToast, setUndoToast] = React.useState<{ sub: Subscription; timer: ReturnType<typeof setTimeout> } | null>(null);
    const [renewedId, setRenewedId] = React.useState<string | null>(null);
    const { language } = useLanguageStore();
    const t = getTranslations(language);

    const sortedSubs = [...subscriptions].sort((a, b) =>
        new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime()
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(
            language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "uz-UZ",
            { month: "short", day: "numeric" }
        );
    };

    const formatAmount = (amount: number, currency: string) => {
        try {
            return new Intl.NumberFormat(language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "uz-UZ", {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currency} ${amount.toFixed(2)}`;
        }
    };

    const handleDelete = (sub: Subscription) => {
        // Clear existing toast if any
        if (undoToast) {
            clearTimeout(undoToast.timer);
            // Commit the previous pending delete (it was already removed from store)
        }
        deleteSubscription(sub.id);
        const timer = setTimeout(() => {
            setUndoToast(null);
        }, 3500);
        setUndoToast({ sub, timer });
    };

    const handleUndo = () => {
        if (!undoToast) return;
        clearTimeout(undoToast.timer);
        const { sub } = undoToast;
        // Re-add via updateSubscription trick — we need to re-add it
        // Since deleteSubscription already ran, we restore by adding back
        useSubStore.setState((state) => ({
            subscriptions: [sub, ...state.subscriptions],
        }));
        setUndoToast(null);
    };

    const handleRenew = (sub: Subscription) => {
        const current = new Date(sub.next_billing_date);
        const next = new Date(current);
        if (sub.billing_cycle_type === "weekly") next.setDate(next.getDate() + 7);
        else if (sub.billing_cycle_type === "yearly") next.setFullYear(next.getFullYear() + 1);
        else next.setMonth(next.getMonth() + 1);

        updateSubscription(sub.id, { next_billing_date: next.toISOString().split("T")[0] });
        setRenewedId(sub.id);
        setTimeout(() => setRenewedId(null), 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 px-4 transition-colors">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.subs.title}</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-full bg-blue-600 p-2 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-blue-700"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>

            {/* Spending Dashboard */}
            <SpendingDashboard />

            {/* List */}
            <div className="space-y-3">
                {sortedSubs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-5">
                            <RefreshCw className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{t.subs.noSubs}</p>
                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{t.subs.noSubsHint}</p>
                    </div>
                ) : (
                    sortedSubs.map((sub) => (
                        <Card key={sub.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-semibold text-gray-900 dark:text-white">
                                        {sub.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{sub.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t.subs.next} {formatDate(sub.next_billing_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {formatAmount(sub.amount, sub.currency)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {t.subs.cycles[sub.billing_cycle_type]}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRenew(sub)}
                                        title={t.subs.renewButton}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400 transition-colors"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${renewedId === sub.id ? "text-green-500 dark:text-green-400" : ""}`} />
                                    </button>
                                    <button
                                        onClick={() => setEditingSub(sub)}
                                        title="Edit"
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sub)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Undo Toast */}
            {undoToast && (
                <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between rounded-xl bg-gray-900 dark:bg-gray-700 px-4 py-3 shadow-lg">
                    <span className="text-sm text-white">{t.subs.undoDelete}</span>
                    <button
                        onClick={handleUndo}
                        className="ml-4 text-sm font-semibold text-blue-400 hover:text-blue-300"
                    >
                        Undo
                    </button>
                </div>
            )}

            <AddSubForm
                isOpen={isAddModalOpen || editingSub !== null}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingSub(null);
                }}
                editingSub={editingSub}
            />
        </div>
    );
}
