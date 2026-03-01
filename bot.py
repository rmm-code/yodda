import os
import json
import logging
import urllib.parse
import sqlite3
from datetime import date, datetime, timedelta
from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.filters import Command, CommandStart
from aiogram.fsm.storage.memory import MemoryStorage
from dotenv import load_dotenv
import asyncio

# Load environment variables from .env file
load_dotenv()

# Configure logging first
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ── SQLite persistence ────────────────────────────────────────────────────────
DB_PATH = os.getenv("DB_PATH", "yodda_users.db")

def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    with _db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id     INTEGER PRIMARY KEY,
                language    TEXT,
                phone       TEXT,
                first_name  TEXT,
                last_name   TEXT,
                username    TEXT,
                photo_url   TEXT,
                group_msg_id INTEGER
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS subscriptions (
                id                  TEXT    NOT NULL,
                user_id             INTEGER NOT NULL,
                name                TEXT    NOT NULL,
                category            TEXT    NOT NULL,
                amount              REAL    NOT NULL,
                currency            TEXT    NOT NULL,
                billing_cycle_type  TEXT    NOT NULL,
                billing_cycle_value INTEGER NOT NULL DEFAULT 1,
                next_billing_date   TEXT    NOT NULL,
                reminder_days       INTEGER NOT NULL DEFAULT 3,
                notes               TEXT,
                is_free_trial       INTEGER NOT NULL DEFAULT 0,
                created_at          TEXT    NOT NULL,
                PRIMARY KEY (id, user_id),
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        """)
        conn.commit()

def get_user(user_id: int) -> dict | None:
    with _db() as conn:
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
        return dict(row) if row else None

def upsert_user(user_id: int, **fields) -> None:
    existing = get_user(user_id)
    if existing:
        sets = ", ".join(f"{k} = ?" for k in fields)
        conn = _db()
        conn.execute(f"UPDATE users SET {sets} WHERE user_id = ?", (*fields.values(), user_id))
        conn.commit()
        conn.close()
    else:
        fields["user_id"] = user_id
        cols = ", ".join(fields.keys())
        placeholders = ", ".join("?" * len(fields))
        conn = _db()
        conn.execute(f"INSERT INTO users ({cols}) VALUES ({placeholders})", tuple(fields.values()))
        conn.commit()
        conn.close()
# ─────────────────────────────────────────────────────────────────────────────

# Get bot token from environment variable
BOT_TOKEN = os.getenv('BOT_TOKEN')
GROUP_ID_STR = os.getenv('GROUP_ID')  # Optional: Telegram group/channel ID
GROUP_ID = None
if GROUP_ID_STR:
    try:
        GROUP_ID = int(GROUP_ID_STR)
    except ValueError:
        logger.warning(f"GROUP_ID '{GROUP_ID_STR}' is not a valid integer. Group messaging will be disabled.")

if not BOT_TOKEN:
    print('❌ ERROR: BOT_TOKEN is not set in .env file!')
    print('Please create a .env file and add your bot token:')
    print('BOT_TOKEN=your_bot_token_here')
    exit(1)

# Initialize bot and dispatcher
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

TRANSLATIONS = {
    "en": {
        "start": "Welcome! Choose your language to get started.",
        "button": "Open Mini App",
        "fallback": "I'm here to help you keep links and subscriptions organised. Tap the button or use /start.",
        "error": "Something went wrong. Please try again later.",
        "choose_language": "Choose Language",
        "language_selected": "All set! Tap the button below to open the app.",
    },
    "ru": {
        "start": "Добро пожаловать! Выберите язык, чтобы начать.",
        "button": "Открыть мини‑приложение",
        "fallback": "Я помогу навести порядок в ссылках и подписках. Нажмите кнопку или используйте /start.",
        "error": "Что-то пошло не так. Попробуйте позже.",
        "choose_language": "Выберите язык",
        "language_selected": "Готово! Нажмите кнопку ниже, чтобы открыть приложение.",
    },
    "uz": {
        "start": "Xush kelibsiz! Boshlash uchun tilingizni tanlang.",
        "button": "Mini ilovani ochish",
        "fallback": "Men havola va obunalarni tartibga solishda yordam beraman. Tugmani bosing yoki /start buyrug'idan foydalaning.",
        "error": "Nimadir xato ketdi. Iltimos, birozdan so'ng yana urinib ko'ring.",
        "choose_language": "Tilni tanlang",
        "language_selected": "Tayyor! Ilovani ochish uchun quyidagi tugmani bosing.",
    },
}

DEFAULT_LANGUAGE = os.getenv("DEFAULT_LANGUAGE", "en")

# ── In-memory helpers that delegate to SQLite ─────────────────────────────────
def _get_field(user_id: int, field: str):
    row = get_user(user_id)
    return row[field] if row else None

def _set_field(user_id: int, **fields) -> None:
    upsert_user(user_id, **fields)
# ─────────────────────────────────────────────────────────────────────────────


# ── Subscription helpers ──────────────────────────────────────────────────────
def sync_subscriptions(user_id: int, subs: list[dict]) -> None:
    """Replace all subscriptions for a user with the provided list (full sync)."""
    with _db() as conn:
        conn.execute("DELETE FROM subscriptions WHERE user_id = ?", (user_id,))
        for s in subs:
            conn.execute(
                """INSERT INTO subscriptions
                   (id, user_id, name, category, amount, currency,
                    billing_cycle_type, billing_cycle_value,
                    next_billing_date, reminder_days, notes,
                    is_free_trial, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    s["id"], user_id, s["name"], s["category"],
                    float(s["amount"]), s["currency"],
                    s["billing_cycle_type"], int(s.get("billing_cycle_value", 1)),
                    s["next_billing_date"], int(s.get("reminder_days", 3)),
                    s.get("notes"), int(bool(s.get("is_free_trial", False))),
                    s.get("created_at", datetime.utcnow().isoformat()),
                ),
            )
        conn.commit()


def get_due_subscriptions(within_days: int = 7) -> list[dict]:
    """Return all subscriptions whose next_billing_date falls within the next N days."""
    today = date.today()
    cutoff = today + timedelta(days=within_days)
    with _db() as conn:
        rows = conn.execute(
            """SELECT s.*, u.language
               FROM subscriptions s
               JOIN users u ON s.user_id = u.user_id
               WHERE s.next_billing_date BETWEEN ? AND ?
               ORDER BY s.next_billing_date ASC""",
            (today.isoformat(), cutoff.isoformat()),
        ).fetchall()
    return [dict(r) for r in rows]
# ─────────────────────────────────────────────────────────────────────────────


# ── HTTP Sync API (aiohttp) ───────────────────────────────────────────────────
API_PORT = int(os.getenv("API_PORT", "8080"))
API_SECRET = os.getenv("API_SECRET", "")   # optional bearer token for security


async def handle_sync(request: web.Request) -> web.Response:
    """
    POST /api/sync
    Headers: Authorization: Bearer <API_SECRET>   (if API_SECRET is set)
    Body (JSON):
        { "user_id": 123456789, "subscriptions": [ ...Subscription objects... ] }
    """
    # ── Auth ──────────────────────────────────────────────────────────────────
    if API_SECRET:
        auth = request.headers.get("Authorization", "")
        if auth != f"Bearer {API_SECRET}":
            return web.json_response({"error": "Unauthorized"}, status=401)

    # ── Parse body ────────────────────────────────────────────────────────────
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"error": "Invalid JSON"}, status=400)

    user_id = body.get("user_id")
    subs    = body.get("subscriptions")

    if not isinstance(user_id, int) or not isinstance(subs, list):
        return web.json_response({"error": "user_id (int) and subscriptions (list) are required"}, status=422)

    # ── Persist ───────────────────────────────────────────────────────────────
    try:
        sync_subscriptions(user_id, subs)
    except Exception as e:
        logger.error(f"sync_subscriptions failed for user {user_id}: {e}")
        return web.json_response({"error": "Internal server error"}, status=500)

    logger.info(f"✅ Synced {len(subs)} subscriptions for user {user_id}")
    return web.json_response({"ok": True, "synced": len(subs)})


async def start_api_server() -> web.AppRunner:
    app = web.Application()
    app.router.add_post("/api/sync", handle_sync)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", API_PORT)
    await site.start()
    logger.info(f"🌐 Sync API listening on http://0.0.0.0:{API_PORT}/api/sync")
    return runner
# ─────────────────────────────────────────────────────────────────────────────


# ── Reminder scheduler ────────────────────────────────────────────────────────
REMINDER_TRANSLATIONS = {
    "en": {
        "title":    "⏰ Upcoming Renewal",
        "body":     "Your <b>{name}</b> subscription renews in <b>{days} day{s}</b> ({date}) for <b>{amount} {currency}</b>.",
        "trial":    "🆓 <b>{name}</b> free trial ends in <b>{days} day{s}</b> ({date}). It will charge <b>{amount} {currency}</b>.",
        "today":    "Your <b>{name}</b> subscription renews <b>today</b> for <b>{amount} {currency}</b>.",
        "trial_today": "🆓 <b>{name}</b> free trial ends <b>today</b>. Charge: <b>{amount} {currency}</b>.",
    },
    "ru": {
        "title":    "⏰ Предстоящее списание",
        "body":     "Подписка <b>{name}</b> продлится через <b>{days} дн.</b> ({date}) на сумму <b>{amount} {currency}</b>.",
        "trial":    "🆓 Пробный период <b>{name}</b> заканчивается через <b>{days} дн.</b> ({date}). С вас спишут <b>{amount} {currency}</b>.",
        "today":    "Подписка <b>{name}</b> продлевается <b>сегодня</b> на сумму <b>{amount} {currency}</b>.",
        "trial_today": "🆓 Пробный период <b>{name}</b> заканчивается <b>сегодня</b>. Спишется <b>{amount} {currency}</b>.",
    },
    "uz": {
        "title":    "⏰ Yaqinlashayotgan to'lov",
        "body":     "<b>{name}</b> obunangiz <b>{days} kun</b> ichida ({date}) <b>{amount} {currency}</b> miqdorida yangilanadi.",
        "trial":    "🆓 <b>{name}</b> sinov muddati <b>{days} kun</b> ichida ({date}) tugaydi. <b>{amount} {currency}</b> hisobdan chiqariladi.",
        "today":    "<b>{name}</b> obunangiz <b>bugun</b> <b>{amount} {currency}</b> miqdorida yangilanadi.",
        "trial_today": "🆓 <b>{name}</b> sinov muddati <b>bugun</b> tugaydi. <b>{amount} {currency}</b> hisobdan chiqariladi.",
    },
}


def _format_reminder(sub: dict, lang: str) -> str:
    msgs  = REMINDER_TRANSLATIONS.get(lang, REMINDER_TRANSLATIONS["en"])
    today = date.today()
    due   = date.fromisoformat(sub["next_billing_date"])
    days  = (due - today).days
    is_trial = bool(sub.get("is_free_trial"))

    fmt_date   = due.strftime("%-d %b")     # e.g. "4 Mar"
    fmt_amount = f"{sub['amount']:.2f}".rstrip("0").rstrip(".")
    currency   = sub["currency"]
    name       = sub["name"]
    s          = "" if days == 1 else "s"   # pluralise for English

    if days == 0:
        template = msgs["trial_today"] if is_trial else msgs["today"]
        body = template.format(name=name, amount=fmt_amount, currency=currency)
    else:
        template = msgs["trial"] if is_trial else msgs["body"]
        body = template.format(name=name, days=days, s=s, date=fmt_date,
                               amount=fmt_amount, currency=currency)

    return f"{msgs['title']}\n\n{body}"


async def run_reminder_scheduler() -> None:
    """Check daily and send reminder messages for upcoming subscriptions."""
    while True:
        try:
            due_subs = get_due_subscriptions(within_days=7)
            seen: set[str] = set()   # avoid double-notifying same sub on same day
            for sub in due_subs:
                key = f"{sub['user_id']}:{sub['id']}"
                if key in seen:
                    continue
                seen.add(key)
                days_left = (date.fromisoformat(sub["next_billing_date"]) - date.today()).days
                if days_left > sub.get("reminder_days", 3):
                    continue   # not within the user's chosen reminder window
                lang = sub.get("language") or "en"
                text = _format_reminder(sub, lang)
                try:
                    await bot.send_message(
                        chat_id=sub["user_id"],
                        text=text,
                        parse_mode="HTML",
                    )
                    logger.info(f"📨 Reminder sent → user {sub['user_id']} for '{sub['name']}'")
                except Exception as send_err:
                    logger.warning(f"Could not send reminder to {sub['user_id']}: {send_err}")
        except Exception as e:
            logger.error(f"Reminder scheduler error: {e}")

        # Sleep until next check (every 12 hours)
        await asyncio.sleep(12 * 3600)
# ─────────────────────────────────────────────────────────────────────────────


def detect_language(user) -> str:
    """Pick the best language for the current user."""
    if user and user.language_code:
        normalized = user.language_code.lower().split("-")[0]
        if normalized in TRANSLATIONS:
            return normalized
        if normalized.startswith("ru"):
            return "ru"
        if normalized in {"uz", "uzb"}:
            return "uz"
    return DEFAULT_LANGUAGE if DEFAULT_LANGUAGE in TRANSLATIONS else "en"


async def get_user_photo_url(user_id: int) -> str:
    """Get user profile photo URL from Telegram Bot API."""
    try:
        photos = await bot.get_user_profile_photos(user_id, limit=1)
        if photos.total_count > 0:
            file = await bot.get_file(photos.photos[0][-1].file_id)
            return file.file_path
    except Exception as e:
        logger.error(f"Failed to get profile photo for user {user_id}: {e}")
    return None


async def send_user_info_to_group(user_id: int, user) -> None:
    """Send or update user information in the group."""
    if not GROUP_ID:
        logger.info(f"GROUP_ID not set, skipping group message for user {user_id}")
        return
    
    try:
        # First, verify we can access the group
        try:
            chat = await bot.get_chat(GROUP_ID)
            logger.debug(f"Group access verified: {chat.title or chat.username or 'Unknown'}")
        except Exception as e:
            logger.error(f"⚠️  Cannot access group {GROUP_ID}: {e}")
            logger.error("   For PRIVATE groups, ensure:")
            logger.error("   1. Bot is added as a MEMBER of the group")
            logger.error("   2. Bot has 'Send Messages' permission")
            logger.error("   3. GROUP_ID is correct (currently: {})".format(GROUP_ID))
            logger.error("   Tip: Try /testgroup command to verify access")
            return  # Don't try to send if we can't access the group
        
        # Format user info
        name = f"{user.first_name or ''} {user.last_name or ''}".strip() or "N/A"
        username = f"@{user.username}" if user.username else "N/A"
        user_id_str = str(user_id)

        message_text = (
            f"👤 <b>Yangi foydalanuvchi</b>\n\n"
            f"📛 <b>Ism:</b> {name}\n"
            f"🔖 <b>Username:</b> {username}\n"
            f"🆔 <b>ID:</b> <code>{user_id_str}</code>"
        )
        
        # Check if we already sent a message for this user
        existing_msg_id = _get_field(user_id, "group_msg_id")
        if existing_msg_id:
            # Update existing message
            try:
                await bot.edit_message_text(
                    chat_id=GROUP_ID,
                    message_id=existing_msg_id,
                    text=message_text,
                    parse_mode='HTML'
                )
                logger.info(f"Updated group message for user {user_id}")
            except Exception as e:
                logger.warning(f"Failed to update group message: {e}, sending new message")
                # If update fails, send new message
                try:
                    msg = await bot.send_message(
                        chat_id=GROUP_ID,
                        text=message_text,
                        parse_mode='HTML'
                    )
                    _set_field(user_id, group_msg_id=msg.message_id)
                    logger.info(f"Sent new group message for user {user_id}")
                except Exception as e2:
                    logger.error(f"Failed to send new group message: {e2}")
        else:
            # Send new message
            msg = await bot.send_message(
                chat_id=GROUP_ID,
                text=message_text,
                parse_mode='HTML'
            )
            _set_field(user_id, group_msg_id=msg.message_id)
            logger.info(f"✅ Sent group message for user {user_id} to group {GROUP_ID}")
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send user info to group {GROUP_ID}: {error_msg}")
        
        # Provide helpful error messages
        if "chat not found" in error_msg.lower() or "chat_id is empty" in error_msg.lower():
            logger.error(f"⚠️  GROUP_ID {GROUP_ID} is invalid or bot is not a member of the PRIVATE group.")
            logger.error("   For PRIVATE groups, you MUST:")
            logger.error("   1. Add the bot as a MEMBER (not just invite)")
            logger.error("   2. Give bot 'Send Messages' permission")
            logger.error("   3. Verify GROUP_ID is correct")
            logger.error("   Use /testgroup command to test")
        elif "forbidden" in error_msg.lower():
            logger.error("   Bot doesn't have permission to send messages in this group")
            logger.error("   Make bot an admin or give 'Send Messages' permission")


def build_web_app_url(user_id: int, user_lang: str) -> str:
    """Build web app URL with user profile data."""
    web_app_url = os.getenv('WEB_APP_URL', 'https://your-web-app-url.com')
    row = get_user(user_id) or {}

    first_name = row.get("first_name") or ""
    last_name  = row.get("last_name") or ""
    username   = row.get("username") or ""
    photo_url  = row.get("photo_url") or ""

    # user_id is always included so the frontend can sync subscriptions back to the bot
    params: dict[str, str] = {"lang": user_lang, "user_id": str(user_id)}
    if first_name: params["first_name"] = first_name
    if last_name:  params["last_name"]  = last_name
    if username:   params["username"]   = username
    if photo_url:  params["photo"]      = photo_url

    query_string = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    return f"{web_app_url}?{query_string}"


@dp.message(CommandStart())
async def cmd_start(message: Message):
    """Handle /start command."""
    user_id = message.from_user.id
    user = message.from_user

    # Upsert user profile (always keep name/username fresh)
    upsert_user(user_id,
                first_name=user.first_name,
                last_name=user.last_name,
                username=user.username)

    # Cache profile photo once
    if not _get_field(user_id, "photo_url"):
        photo_path = await get_user_photo_url(user_id)
        if photo_path:
            _set_field(user_id, photo_url=f"https://api.telegram.org/file/bot{BOT_TOKEN}/{photo_path}")

    # Notify group
    try:
        await send_user_info_to_group(user_id, user)
    except Exception as e:
        logger.error(f"Error sending user info to group: {e}")

    user_lang = _get_field(user_id, "language")

    if user_lang:
        # Already chose a language — go straight to the app
        msgs = TRANSLATIONS[user_lang]
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=msgs["button"], web_app={"url": build_web_app_url(user_id, user_lang)})]
        ])
        await message.answer(msgs["start"], reply_markup=keyboard)
    else:
        # First time — ask for language
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="🇺🇿 O'zbek", callback_data="lang_uz"),
                InlineKeyboardButton(text="🇷🇺 Русский", callback_data="lang_ru"),
                InlineKeyboardButton(text="🇬🇧 English", callback_data="lang_en"),
            ]
        ])
        await message.answer(TRANSLATIONS["uz"]["choose_language"], reply_markup=keyboard)


@dp.callback_query(F.data.startswith("lang_"))
async def handle_language_callback(callback: CallbackQuery):
    """Handle language selection from inline keyboard."""
    user_id = callback.from_user.id
    user = callback.from_user

    selected_lang = callback.data.replace("lang_", "")
    if selected_lang not in TRANSLATIONS:
        await callback.answer()
        return

    _set_field(user_id, language=selected_lang,
               first_name=user.first_name,
               last_name=user.last_name,
               username=user.username)

    if not _get_field(user_id, "photo_url"):
        photo_path = await get_user_photo_url(user_id)
        if photo_path:
            _set_field(user_id, photo_url=f"https://api.telegram.org/file/bot{BOT_TOKEN}/{photo_path}")

    try:
        await send_user_info_to_group(user_id, user)
    except Exception as e:
        logger.error(f"Error sending user info to group: {e}")

    msgs = TRANSLATIONS[selected_lang]
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=msgs["button"], web_app={"url": build_web_app_url(user_id, selected_lang)})]
    ])
    await callback.answer()
    await callback.message.edit_text(msgs["language_selected"], reply_markup=keyboard)


@dp.message(F.text & ~F.text.startswith('/'))
async def handle_message(message: Message):
    """Handle regular text messages — just reply with the fallback hint."""
    user_id = message.from_user.id
    user = message.from_user
    user_lang = _get_field(user_id, "language") or detect_language(user)
    msgs = TRANSLATIONS[user_lang]
    logger.info("Received message from %s: %s", user_id, message.text)
    await message.answer(msgs["fallback"])


@dp.message(Command("testgroup"))
async def cmd_test_group(message: Message):
    """Test command to check if bot can send messages to the group."""
    if not GROUP_ID:
        await message.answer("❌ GROUP_ID is not set in .env file")
        return
    
    # First, try to get chat info
    try:
        chat = await bot.get_chat(GROUP_ID)
        chat_type = "Private Group" if chat.type == "supergroup" or chat.type == "group" else chat.type
        chat_name = chat.title or chat.username or "Unknown"
        await message.answer(
            f"✅ Group access verified!\n\n"
            f"📋 Group: {chat_name}\n"
            f"🔢 ID: {GROUP_ID}\n"
            f"📝 Type: {chat_type}\n\n"
            f"Testing message send..."
        )
    except Exception as e:
        await message.answer(
            f"❌ Cannot access group {GROUP_ID}\n\n"
            f"Error: {str(e)}\n\n"
            f"For PRIVATE groups:\n"
            f"1. Add bot as MEMBER (Group Settings → Members → Add)\n"
            f"2. Give bot 'Send Messages' permission\n"
            f"3. Verify GROUP_ID is correct\n\n"
            f"Current GROUP_ID: {GROUP_ID}"
        )
        return
    
    # Try to send a test message
    try:
        test_msg = await bot.send_message(
            chat_id=GROUP_ID,
            text="✅ Bot test message - if you see this in the group, everything works!"
        )
        await message.answer(
            f"✅ SUCCESS!\n\n"
            f"Test message sent to group!\n"
            f"Message ID: {test_msg.message_id}\n\n"
            f"Check the group to confirm the message arrived."
        )
        logger.info(f"Test message sent successfully to group {GROUP_ID}")
    except Exception as e:
        error_msg = str(e)
        await message.answer(
            f"❌ Failed to send message to group\n\n"
            f"Error: {error_msg}\n\n"
            f"For PRIVATE groups, ensure:\n"
            f"1. Bot is a MEMBER (not just invited)\n"
            f"2. Bot has 'Send Messages' permission\n"
            f"3. GROUP_ID is correct: {GROUP_ID}\n\n"
            f"💡 Tip: Make bot an admin temporarily to test"
        )
        logger.error(f"Test group message failed: {error_msg}")


@dp.errors()
async def error_handler(update, exception):
    """Handle errors."""
    logger.error(f"Exception while handling an update: {exception}")
    return True


async def main():
    """Start the bot, HTTP sync API, and reminder scheduler."""
    init_db()
    logger.info("Starting Yodda bot…")
    logger.info(f"Bot token: {BOT_TOKEN[:10]}…")

    if GROUP_ID:
        logger.info(f"GROUP_ID: {GROUP_ID}")
        try:
            chat = await bot.get_chat(GROUP_ID)
            logger.info(f"✅ Group found: {chat.title or chat.username or 'Unknown'}")
        except Exception as e:
            logger.warning(f"⚠️  Cannot access group {GROUP_ID}: {e}")
    else:
        logger.warning("⚠️  GROUP_ID not set — group messaging disabled")

    # Start the HTTP sync API
    api_runner = await start_api_server()

    # Start the reminder scheduler as a background task
    scheduler_task = asyncio.create_task(run_reminder_scheduler())
    logger.info("⏰ Reminder scheduler started")

    try:
        await dp.start_polling(bot, allowed_updates=["message", "callback_query"])
    finally:
        scheduler_task.cancel()
        await api_runner.cleanup()


if __name__ == '__main__':
    print('✅ Bot is running!')
    print('🤖 Telegram bot started successfully!')
    print('📱 Send /start to your bot to test it.')
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped")
