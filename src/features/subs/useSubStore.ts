import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type Category = "Education" | "Productivity" | "Entertainment" | "Finance" | "Health" | "Other";
export type BillingCycle = "weekly" | "monthly" | "yearly" | "custom";

export interface Subscription {
    id: string;
    name: string;
    category: Category;
    amount: number;
    currency: string;
    billing_cycle_type: BillingCycle;
    billing_cycle_value: number;
    next_billing_date: string;
    reminder_days: number;
    notes?: string;
    is_free_trial: boolean;
    created_at: string;
}

interface SubState {
    subscriptions: Subscription[];
    addSubscription: (sub: Omit<Subscription, "id" | "created_at">) => void;
    updateSubscription: (id: string, updates: Partial<Subscription>) => void;
    deleteSubscription: (id: string) => void;
}

export const useSubStore = create<SubState>()(
    persist(
        (set) => ({
            subscriptions: [],

            addSubscription: (subData) => {
                const newSub: Subscription = {
                    ...subData,
                    id: uuidv4(),
                    created_at: new Date().toISOString(),
                };
                set((state) => ({ subscriptions: [newSub, ...state.subscriptions] }));
            },

            updateSubscription: (id, updates) => {
                set((state) => ({
                    subscriptions: state.subscriptions.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                }));
            },

            deleteSubscription: (id) => {
                set((state) => ({
                    subscriptions: state.subscriptions.filter((s) => s.id !== id),
                }));
            },
        }),
        {
            name: "sub-storage",
        }
    )
);
