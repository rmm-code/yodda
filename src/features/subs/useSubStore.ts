import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { scheduleSyncSubscriptions } from "../../lib/syncSubscriptions";

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
                set((state) => {
                    const next = [newSub, ...state.subscriptions];
                    scheduleSyncSubscriptions(next);
                    return { subscriptions: next };
                });
            },

            updateSubscription: (id, updates) => {
                set((state) => {
                    const next = state.subscriptions.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    );
                    scheduleSyncSubscriptions(next);
                    return { subscriptions: next };
                });
            },

            deleteSubscription: (id) => {
                set((state) => {
                    const next = state.subscriptions.filter((s) => s.id !== id);
                    scheduleSyncSubscriptions(next);
                    return { subscriptions: next };
                });
            },
        }),
        {
            name: "sub-storage",
        }
    )
);
