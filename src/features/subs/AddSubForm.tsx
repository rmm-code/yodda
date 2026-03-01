import * as React from "react";
import { useSubStore, type Category, type BillingCycle, type Subscription } from "./useSubStore";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { BookOpen, Briefcase, Film, DollarSign, Heart, MoreHorizontal } from "lucide-react";
import { useLanguageStore } from "../../lib/useLanguageStore";
import { getTranslations } from "../../lib/translations";

interface AddSubFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingSub?: Subscription | null;
}

export function AddSubForm({ isOpen, onClose, editingSub }: AddSubFormProps) {
    const { addSubscription, updateSubscription } = useSubStore();
    const { language } = useLanguageStore();
    const t = getTranslations(language);

    const isEditing = Boolean(editingSub);

    const [name, setName] = React.useState("");
    const [category, setCategory] = React.useState<Category>("Other");
    const [amount, setAmount] = React.useState("");
    const [currency, setCurrency] = React.useState("USD");
    const [cycle, setCycle] = React.useState<BillingCycle>("monthly");
    const [date, setDate] = React.useState("");

    const CATEGORIES: { value: Category; label: string; icon: any }[] = [
        { value: "Education", label: t.subs.categories.Education, icon: BookOpen },
        { value: "Productivity", label: t.subs.categories.Productivity, icon: Briefcase },
        { value: "Entertainment", label: t.subs.categories.Entertainment, icon: Film },
        { value: "Finance", label: t.subs.categories.Finance, icon: DollarSign },
        { value: "Health", label: t.subs.categories.Health, icon: Heart },
        { value: "Other", label: t.subs.categories.Other, icon: MoreHorizontal },
    ];

    const CYCLES: { value: BillingCycle; label: string }[] = [
        { value: "weekly", label: t.subs.cycles.weekly },
        { value: "monthly", label: t.subs.cycles.monthly },
        { value: "yearly", label: t.subs.cycles.yearly },
    ];

    React.useEffect(() => {
        if (isOpen) {
            if (editingSub) {
                setName(editingSub.name);
                setCategory(editingSub.category);
                setAmount(String(editingSub.amount));
                setCurrency(editingSub.currency);
                setCycle(editingSub.billing_cycle_type);
                setDate(editingSub.next_billing_date);
            } else {
                setName("");
                setCategory("Other");
                setAmount("");
                setCurrency("USD");
                setCycle("monthly");
                setDate(new Date().toISOString().split("T")[0]);
            }
        }
    }, [isOpen, editingSub]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount || !date) return;

        if (isEditing && editingSub) {
            updateSubscription(editingSub.id, {
                name,
                category,
                amount: parseFloat(amount),
                currency,
                billing_cycle_type: cycle,
                next_billing_date: date,
            });
        } else {
            addSubscription({
                name,
                category,
                amount: parseFloat(amount),
            currency,
            billing_cycle_type: cycle,
            billing_cycle_value: 1,
            next_billing_date: date,
            reminder_days: 1,
            is_free_trial: false,
        });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? t.subs.editTitle : t.subs.trackTitle}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={t.subs.nameLabel}
                    placeholder={t.subs.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.subs.categoryLabel}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategory(cat.value)}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-xl border p-2 transition-colors",
                                    category === cat.value
                                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                )}
                            >
                                <cat.icon className="mb-1 h-5 w-5" />
                                <span className="text-[10px] font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Input
                        label={t.subs.amountLabel}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="flex-1"
                    />
                    <div className="w-24">
                        <Select
                            label={t.subs.currencyLabel}
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="SUM">SUM</option>
                        </Select>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <div className="flex-1">
                        <Select
                            label={t.subs.cycleLabel}
                            value={cycle}
                            onChange={(e) => setCycle(e.target.value as BillingCycle)}
                        >
                            {CYCLES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Input
                            label={t.subs.dateLabel}
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    {isEditing ? t.subs.saveButton : t.subs.trackButton}
                </Button>
            </form>
        </Modal>
    );
}

