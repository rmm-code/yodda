import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    phoneNumber?: string;
    photoUrl?: string;
}

interface UserState {
    profile: UserProfile | null;
    setProfile: (profile: UserProfile) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            profile: null,
            setProfile: (profile) => set({ profile }),
            updateProfile: (updates) =>
                set((state) => ({
                    profile: state.profile ? { ...state.profile, ...updates } : updates as UserProfile,
                })),
        }),
        {
            name: "user-profile-storage",
        }
    )
);

