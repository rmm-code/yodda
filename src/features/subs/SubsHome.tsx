import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSubStore } from "./useSubStore";
import { AddSubForm } from "./AddSubForm";
import { Card } from "../../components/ui/Card";


export function SubsHome() {
    const { subscriptions, deleteSubscription } = useSubStore();
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

    const totalMonthly = subscriptions.reduce((acc, sub) => {
        let monthlyAmount = sub.amount;
        if (sub.billing_cycle_type === "weekly") monthlyAmount = sub.amount * 4;
        if (sub.billing_cycle_type === "yearly") monthlyAmount = sub.amount / 12;
        return acc + monthlyAmount;
    }, 0);

    const totalYearly = totalMonthly * 12;

    const sortedSubs = [...subscriptions].sort((a, b) =>
        new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime()
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 pt-4 px-4 transition-colors">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-full bg-blue-600 p-2 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-blue-700"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>

            {/* Summary Card */}
            <Card className="mb-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none dark:from-blue-800 dark:to-blue-900">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-blue-100 text-sm font-medium">Total Monthly</p>
                        <h2 className="text-3xl font-bold">${totalMonthly.toFixed(2)}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-100 text-xs">Yearly</p>
                        <p className="font-semibold">${totalYearly.toFixed(2)}</p>
                    </div>
                </div>
            </Card>

            {/* List */}
            <div className="space-y-3">
                {sortedSubs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No subscriptions tracked yet.
                    </div>
                ) : (
                    sortedSubs.map((sub) => (
                        <Card key={sub.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg text-gray-900 dark:text-white">
                                    {sub.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{sub.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Next: {formatDate(sub.next_billing_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        ${sub.amount.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                        {sub.billing_cycle_type}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteSubscription(sub.id)}
                                    className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <AddSubForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
}
