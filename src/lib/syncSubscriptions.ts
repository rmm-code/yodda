/**
 * Syncs the current subscription list to the Yodda backend so the Telegram
 * bot can send renewal reminder notifications.
 *
 * The API endpoint is configured via the VITE_API_URL environment variable
 * (defaults to the same origin in production).  An optional bearer token can
 * be set with VITE_API_SECRET for extra security.
 *
 * The sync is debounced — multiple rapid changes are coalesced into one
 * request after a short delay.
 */

import type { Subscription } from "../features/subs/useSubStore";

const API_BASE  = import.meta.env.VITE_API_URL    ?? "";
const API_SECRET = import.meta.env.VITE_API_SECRET ?? "";

/** Read the Telegram user_id injected by the bot via the Web App URL (?user_id=...) */
function getTelegramUserId(): number | null {
    // 1. Try Telegram WebApp initDataUnsafe
    const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: number } } } } }).Telegram?.WebApp;
    const tgId = tg?.initDataUnsafe?.user?.id;
    if (tgId) return tgId;

    // 2. Fall back to query param injected by bot URL builder
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("user_id");
    if (raw) {
        const n = parseInt(raw, 10);
        if (!isNaN(n)) return n;
    }

    return null;
}

let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSyncSubscriptions(subscriptions: Subscription[]): void {
    if (_debounceTimer !== null) clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
        _debounceTimer = null;
        void syncSubscriptionsNow(subscriptions);
    }, 800);  // 800 ms debounce
}

export async function syncSubscriptionsNow(subscriptions: Subscription[]): Promise<void> {
    const userId = getTelegramUserId();
    if (!userId) {
        // Not running inside Telegram — skip silently
        return;
    }

    const url = `${API_BASE}/api/sync`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (API_SECRET) headers["Authorization"] = `Bearer ${API_SECRET}`;

    try {
        const res = await fetch(url, {
            method:  "POST",
            headers,
            body: JSON.stringify({ user_id: userId, subscriptions }),
        });
        if (!res.ok) {
            console.warn(`[yodda] Sync failed: HTTP ${res.status}`);
        }
    } catch (err) {
        // Network errors are non-fatal — local data is always the source of truth
        console.warn("[yodda] Sync request failed (offline?):", err);
    }
}
