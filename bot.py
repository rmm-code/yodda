import os
import logging
import urllib.parse
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.memory import MemoryStorage
from dotenv import load_dotenv
import asyncio

# Load environment variables from .env file
load_dotenv()

# Get bot token from environment variable
BOT_TOKEN = os.getenv('BOT_TOKEN')
GROUP_ID = os.getenv('GROUP_ID')  # Optional: Telegram group/channel ID

if not BOT_TOKEN:
    print('❌ ERROR: BOT_TOKEN is not set in .env file!')
    print('Please create a .env file and add your bot token:')
    print('BOT_TOKEN=your_bot_token_here')
    exit(1)

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize bot and dispatcher
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

TRANSLATIONS = {
    "en": {
        "start": "Welcome! Please choose your language first, then open the mini app.",
        "button": "Open Mini App",
        "fallback": "I'm here to help you keep links and subscriptions organized. Tap the button or use /start.",
        "error": "Something went wrong. Please try again later.",
        "choose_language": "Choose Language",
        "language_selected": "Language selected! Now you can open the mini app.",
        "request_phone": "To save your profile and synchronize data, we need your phone number.",
        "phone_received": "Thank you! This number is only used for security and recovery. You won't lose your links.",
    },
    "ru": {
        "start": "Добро пожаловать! Пожалуйста, сначала выберите язык, затем откройте мини-приложение.",
        "button": "Открыть мини‑приложение",
        "fallback": "Я помогу навести порядок в ссылках и подписках. Нажмите кнопку или используйте /start.",
        "error": "Что-то пошло не так. Попробуйте позже.",
        "choose_language": "Выберите язык",
        "language_selected": "Язык выбран! Теперь вы можете открыть мини-приложение.",
        "request_phone": "Для сохранения вашего профиля и синхронизации данных нам нужен ваш номер телефона.",
        "phone_received": "Спасибо! Этот номер используется только для безопасности и восстановления. Вы не потеряете свои ссылки.",
    },
    "uz": {
        "start": "Xush kelibsiz! Iltimos, avval tilingizni tanlang, keyin mini ilovani oching.",
        "button": "Mini ilovani ochish",
        "fallback": "Men havola va obunalarni tartibga solishda yordam beraman. Tugmani bosing yoki /start buyrug'idan foydalaning.",
        "error": "Nimadir xato ketdi. Iltimos, birozdan so'ng yana urinib ko'ring.",
        "choose_language": "Tilni tanlang",
        "language_selected": "Til tanlandi! Endi mini ilovani ochishingiz mumkin.",
        "request_phone": "Profilingizga kirishni saqlash va ma'lumotlarni sinxronlashtirish uchun telefon raqamingiz kerak bo'ladi.",
        "phone_received": "Rahmat! Bu raqam faqat xavfsizlik va tiklash uchun ishlatiladi. Siz o'zingizni linklarizni yoqotib qo'ymaysiz. Ma'lumotlaringiz xavfsiz saqlanadi va faqat sizga tegishli.",
    },
}

DEFAULT_LANGUAGE = os.getenv("DEFAULT_LANGUAGE", "en")

# Store user language preferences and phone numbers (in production, use a database)
user_languages = {}
user_phone_numbers = {}
user_profiles = {}
user_group_messages = {}  # Store group message IDs per user
user_photo_urls = {}  # Store user profile photo URLs


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


async def send_user_info_to_group(user_id: int, user, phone_number: str = None) -> None:
    """Send or update user information in the group."""
    if not GROUP_ID:
        return
    
    try:
        # Format user info
        name = f"{user.first_name or ''} {user.last_name or ''}".strip() or "N/A"
        username = f"@{user.username}" if user.username else "N/A"
        user_id_str = str(user_id)
        phone = phone_number or "Kutilmoqda..."
        
        message_text = (
            f"👤 <b>Yangi foydalanuvchi</b>\n\n"
            f"📛 <b>Ism:</b> {name}\n"
            f"🔖 <b>Username:</b> {username}\n"
            f"🆔 <b>ID:</b> <code>{user_id_str}</code>\n"
            f"📱 <b>Telefon:</b> {phone}"
        )
        
        # Check if we already sent a message for this user
        if user_id in user_group_messages:
            # Update existing message
            try:
                await bot.edit_message_text(
                    chat_id=GROUP_ID,
                    message_id=user_group_messages[user_id],
                    text=message_text,
                    parse_mode='HTML'
                )
            except Exception as e:
                logger.error(f"Failed to update group message: {e}")
                # If update fails, send new message
                msg = await bot.send_message(
                    chat_id=GROUP_ID,
                    text=message_text,
                    parse_mode='HTML'
                )
                user_group_messages[user_id] = msg.message_id
        else:
            # Send new message
            msg = await bot.send_message(
                chat_id=GROUP_ID,
                text=message_text,
                parse_mode='HTML'
            )
            user_group_messages[user_id] = msg.message_id
    except Exception as e:
        logger.error(f"Failed to send user info to group: {e}")


def build_web_app_url(user_id: int, user_lang: str) -> str:
    """Build web app URL with all user data."""
    web_app_url = os.getenv('WEB_APP_URL', 'https://your-web-app-url.com')
    user_phone = user_phone_numbers.get(user_id, "")
    user_profile = user_profiles.get(user_id, {})
    
    first_name = user_profile.get("first_name", "") or ""
    last_name = user_profile.get("last_name", "") or ""
    username = user_profile.get("username", "") or ""
    photo_url = user_photo_urls.get(user_id, "")
    
    # Build URL with parameters
    params = {
        "lang": user_lang,
    }
    
    if user_phone:
        params["phone"] = user_phone
    if first_name:
        params["first_name"] = first_name
    if last_name:
        params["last_name"] = last_name
    if username:
        params["username"] = username
    if photo_url:
        params["photo"] = photo_url
    
    # Build query string
    query_string = "&".join([f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items()])
    return f"{web_app_url}?{query_string}"


@dp.message(CommandStart())
async def cmd_start(message: Message):
    """Handle /start command."""
    user_id = message.from_user.id
    user = message.from_user
    
    # Store user profile info when they start
    if user_id not in user_profiles:
        user_profiles[user_id] = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
        }
    
    # Get and store user profile photo
    if user_id not in user_photo_urls:
        photo_path = await get_user_photo_url(user_id)
        if photo_path:
            photo_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{photo_path}"
            user_photo_urls[user_id] = photo_url
    
    # Send user info to group (without phone number initially)
    await send_user_info_to_group(user_id, user)
    
    # Check if user already has phone number
    user_phone = user_phone_numbers.get(user_id)
    user_lang = user_languages.get(user_id)
    
    if user_phone and user_lang:
        # User already completed setup, show mini app button
        messages = TRANSLATIONS[user_lang]
        web_app_url_with_lang = build_web_app_url(user_id, user_lang)
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=messages["button"], web_app={"url": web_app_url_with_lang})]
        ])
        
        await message.answer(
            messages["start"],
            reply_markup=keyboard
        )
    elif user_lang:
        # User selected language but no phone number yet
        messages = TRANSLATIONS[user_lang]
        # Request phone number
        keyboard = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]],
            resize_keyboard=True,
            one_time_keyboard=True
        )
        
        await message.answer(
            messages["request_phone"],
            reply_markup=keyboard
        )
    else:
        # Show language selector in Uzbek
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="🇺🇿 O'zbek", callback_data="lang_uz"),
                InlineKeyboardButton(text="🇷🇺 Русский", callback_data="lang_ru"),
                InlineKeyboardButton(text="🇬🇧 English", callback_data="lang_en"),
            ]
        ])
        
        await message.answer(
            TRANSLATIONS["uz"]["choose_language"],
            reply_markup=keyboard
        )


@dp.callback_query(F.data.startswith("lang_"))
async def handle_language_callback(callback: CallbackQuery):
    """Handle language selection from inline keyboard."""
    user_id = callback.from_user.id
    user = callback.from_user
    
    # Extract language from callback data
    selected_lang = callback.data.replace("lang_", "")
    if selected_lang in TRANSLATIONS:
        user_languages[user_id] = selected_lang
        messages = TRANSLATIONS[selected_lang]
        
        # Store user profile info and get photo
        if user_id not in user_profiles:
            user_profiles[user_id] = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
            }
        
        # Get profile photo if not already stored
        if user_id not in user_photo_urls:
            photo_path = await get_user_photo_url(user_id)
            if photo_path:
                photo_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{photo_path}"
                user_photo_urls[user_id] = photo_url
        
        # Check if user already has phone number
        user_phone = user_phone_numbers.get(user_id)
        
        if user_phone:
            # User already has phone, show mini app button
            web_app_url_with_lang = build_web_app_url(user_id, selected_lang)
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text=messages["button"], web_app={"url": web_app_url_with_lang})]
            ])
            
            await callback.answer()
            await callback.message.edit_text(
                messages["language_selected"],
                reply_markup=keyboard
            )
        else:
            # Request phone number
            keyboard = ReplyKeyboardMarkup(
                keyboard=[[KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]],
                resize_keyboard=True,
                one_time_keyboard=True
            )
            
            await callback.answer()
            await callback.message.answer(
                messages["request_phone"],
                reply_markup=keyboard
            )


@dp.message(F.contact)
async def handle_contact(message: Message):
    """Handle phone number from contact."""
    user_id = message.from_user.id
    user = message.from_user
    contact = message.contact
    
    if not contact:
        return
    
    phone_number = contact.phone_number
    user_lang = user_languages.get(user_id, "uz")
    messages = TRANSLATIONS[user_lang]
    
    # Store phone number
    user_phone_numbers[user_id] = phone_number
    
    # Update user profile
    if user_id in user_profiles:
        user_profiles[user_id]["phone_number"] = phone_number
    
    # Update group message with phone number
    await send_user_info_to_group(user_id, user, phone_number)
    
    # Get profile photo if not already stored
    if user_id not in user_photo_urls:
        photo_path = await get_user_photo_url(user_id)
        if photo_path:
            photo_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{photo_path}"
            user_photo_urls[user_id] = photo_url
    
    # Show confirmation and mini app button
    web_app_url_with_lang = build_web_app_url(user_id, user_lang)
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=messages["button"], web_app={"url": web_app_url_with_lang})]
    ])
    
    # Remove keyboard
    remove_keyboard = ReplyKeyboardMarkup(keyboard=[[]], resize_keyboard=True)
    await message.answer(
        messages["phone_received"],
        reply_markup=remove_keyboard
    )
    
    await message.answer(
        messages["language_selected"],
        reply_markup=keyboard
    )


@dp.message(F.text & ~F.text.startswith('/'))
async def handle_message(message: Message):
    """Handle regular text messages."""
    user_id = message.from_user.id
    user = message.from_user
    user_lang = user_languages.get(user_id)
    
    # If user hasn't selected language, they might be trying to send phone manually
    if user_id and user_lang and not user_phone_numbers.get(user_id):
        # Check if message looks like a phone number
        text = message.text.strip()
        if text.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '').isdigit() and len(text.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '')) >= 9:
            user_phone_numbers[user_id] = text
            
            # Update user profile
            if user_id in user_profiles:
                user_profiles[user_id]["phone_number"] = text
            
            # Update group message with phone number
            await send_user_info_to_group(user_id, user, text)
            
            # Get profile photo if not already stored
            if user_id not in user_photo_urls:
                photo_path = await get_user_photo_url(user_id)
                if photo_path:
                    photo_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{photo_path}"
                    user_photo_urls[user_id] = photo_url
            
            messages = TRANSLATIONS[user_lang]
            web_app_url_with_lang = build_web_app_url(user_id, user_lang)
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text=messages["button"], web_app={"url": web_app_url_with_lang})]
            ])
            
            await message.answer(
                messages["phone_received"],
                reply_markup=keyboard
            )
            return
    
    # Default fallback message
    language = detect_language(user)
    messages = TRANSLATIONS[language]
    logger.info("Received message from %s: %s", user_id, message.text)
    await message.answer(messages["fallback"])


@dp.errors()
async def error_handler(update, exception):
    """Handle errors."""
    logger.error(f"Exception while handling an update: {exception}")
    return True


async def main():
    """Start the bot."""
    logger.info('Starting bot...')
    await dp.start_polling(bot, allowed_updates=["message", "callback_query"])


if __name__ == '__main__':
    print('✅ Bot is running!')
    print('🤖 Telegram bot started successfully!')
    print('📱 Send /start to your bot to test it.')
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped")
