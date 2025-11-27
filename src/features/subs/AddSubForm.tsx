import * as React from "react";
import { useSubStore, type Category, type BillingCycle } from "./useSubStore";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { BookOpen, Briefcase, Film, DollarSign, Heart, MoreHorizontal } from "lucide-react";

interface AddSubFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES: { value: Category; label: string; icon: any }[] = [
    { value: "Education", label: "Education", icon: BookOpen },
    { value: "Productivity", label: "Productivity", icon: Briefcase },
    { value: "Entertainment", label: "Entertainment", icon: Film },
    { value: "Finance", label: "Finance", icon: DollarSign },
    { value: "Health", label: "Health", icon: Heart },
    { value: "Other", label: "Other", icon: MoreHorizontal },
];

const CYCLES: { value: BillingCycle; label: string }[] = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
];

export function AddSubForm({ isOpen, onClose }: AddSubFormProps) {
    const { addSubscription } = useSubStore();

    const [name, setName] = React.useState("");
    const [category, setCategory] = React.useState<Category>("Other");
    const [amount, setAmount] = React.useState("");
    const [currency, setCurrency] = React.useState("USD");
    const [cycle, setCycle] = React.useState<BillingCycle>("monthly");
    const [date, setDate] = React.useState("");

    React.useEffect(() => {
        if (isOpen) {
            setName("");
            setCategory("Other");
            setAmount("");
            setCycle("monthly");
            setDate(new Date().toISOString().split("T")[0]);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount || !date) return;

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
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Track Subscription">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Name"
                    placeholder="Netflix, Spotify..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
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
                        label="Amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="flex-1"
                    />
                    <div className="w-24 space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="SUM">SUM</option>
                        </select>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <div className="flex-1 space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Billing Cycle</label>
                        <select
                            value={cycle}
                            onChange={(e) => setCycle(e.target.value as BillingCycle)}
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            {CYCLES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <Input
                            label="Next Bill Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    Track Subscription
                </Button>
            </form>
        </Modal>
    );
}
