import * as React from "react";
import { useSubStore } from "./useSubStore";
import { Card } from "../../components/ui/Card";
import { TrendingUp, Calendar, DollarSign, PieChart } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLanguageStore } from "../../lib/useLanguageStore";
import { getTranslations } from "../../lib/translations";

export function SpendingDashboard() {
    const { subscriptions } = useSubStore();
    const { language } = useLanguageStore();
    const t = getTranslations(language);

    // Calculate totals
    const totals = React.useMemo(() => {
        let monthly = 0;

        subscriptions.forEach((sub) => {
            let monthlyAmount = sub.amount;
            if (sub.billing_cycle_type === "weekly") {
                monthlyAmount = sub.amount * 4;
            } else if (sub.billing_cycle_type === "yearly") {
                monthlyAmount = sub.amount / 12;
            }
            monthly += monthlyAmount;
        });

        return { monthly, yearly: monthly * 12 };
    }, [subscriptions]);

    // Calculate by category
    const categorySpending = React.useMemo(() => {
        const categoryMap: Record<string, number> = {};

        subscriptions.forEach((sub) => {
            let monthlyAmount = sub.amount;
            if (sub.billing_cycle_type === "weekly") {
                monthlyAmount = sub.amount * 4;
            } else if (sub.billing_cycle_type === "yearly") {
                monthlyAmount = sub.amount / 12;
            }

            categoryMap[sub.category] = (categoryMap[sub.category] || 0) + monthlyAmount;
        });

        return Object.entries(categoryMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [subscriptions]);

    // Upcoming renewals (next 7 days)
    const upcomingRenewals = React.useMemo(() => {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        return subscriptions
            .filter((sub) => {
                const billingDate = new Date(sub.next_billing_date);
                return billingDate >= today && billingDate <= nextWeek;
            })
            .sort((a, b) =>
                new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime()
            )
            .slice(0, 5);
    }, [subscriptions]);

    const formatCurrency = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(language === 'en' ? "en-US" : language === 'ru' ? "ru-RU" : "uz-UZ", { month: "short", day: "numeric" });
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Entertainment: "bg-purple-500",
            Productivity: "bg-blue-500",
            Education: "bg-green-500",
            Finance: "bg-yellow-500",
            Health: "bg-red-500",
            Other: "bg-gray-500",
        };
        return colors[category] || colors.Other;
    };

    const maxCategoryAmount = categorySpending[0]?.amount || 1;

    if (subscriptions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 mb-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none dark:from-blue-800 dark:to-blue-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs font-medium mb-1">{t.subs.monthly}</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(totals.monthly)}</h3>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-200" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-none dark:from-green-800 dark:to-green-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-xs font-medium mb-1">{t.subs.yearly}</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(totals.yearly)}</h3>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-200" />
                    </div>
                </Card>
            </div>

            {/* Category Breakdown */}
            {categorySpending.length > 0 && (
                <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <PieChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.subs.byCategory}</h3>
                    </div>
                    <div className="space-y-3">
                        {categorySpending.map(({ category, amount }) => (
                            <div key={category}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {category}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(amount)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={cn(
                                            "h-2 rounded-full transition-all",
                                            getCategoryColor(category)
                                        )}
                                        style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Upcoming Renewals */}
            {upcomingRenewals.length > 0 && (
                <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.subs.upcoming}</h3>
                    </div>
                    <div className="space-y-2">
                        {upcomingRenewals.map((sub) => (
                            <div
                                key={sub.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {sub.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(sub.next_billing_date)}
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(sub.amount, sub.currency)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}


