import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get bot token from environment variable
BOT_TOKEN = os.getenv('BOT_TOKEN')

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


def detect_language(update: Update) -> str:
    """Pick the best language for the current user."""
    user_language = update.effective_user.language_code if update.effective_user else None
    if user_language:
        normalized = user_language.lower().split("-")[0]
        if normalized in TRANSLATIONS:
            return normalized
        if normalized.startswith("ru"):
            return "ru"
        if normalized in {"uz", "uzb"}:
            return "uz"
    return DEFAULT_LANGUAGE if DEFAULT_LANGUAGE in TRANSLATIONS else "en"


# Store user language preferences and phone numbers (in production, use a database)
user_languages = {}
user_phone_numbers = {}
user_profiles = {}

# Handle /start command
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    if not update.message:
        return

    user_id = update.effective_user.id if update.effective_user else None
    if not user_id:
        return

    # Check if user already has phone number
    user_phone = user_phone_numbers.get(user_id)
    user_lang = user_languages.get(user_id)
    
    if user_phone and user_lang:
        # User already completed setup, show mini app button
        messages = TRANSLATIONS[user_lang]
        web_app_url = os.getenv('WEB_APP_URL', 'https://your-web-app-url.com')
        # Add language parameter to URL
        web_app_url_with_lang = f"{web_app_url}?lang={user_lang}"
        
        keyboard = [
            [InlineKeyboardButton(messages["button"], web_app={"url": web_app_url_with_lang})]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            messages["start"],
            reply_markup=reply_markup
        )
    elif user_lang:
        # User selected language but no phone number yet
        messages = TRANSLATIONS[user_lang]
        # Request phone number
        keyboard = [
            [KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=True)
        
        await update.message.reply_text(
            messages["request_phone"],
            reply_markup=reply_markup
        )
    else:
        # Show language selector in Uzbek
        keyboard = [
            [
                InlineKeyboardButton("🇺🇿 O'zbek", callback_data="lang_uz"),
                InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru"),
                InlineKeyboardButton("🇬🇧 English", callback_data="lang_en"),
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            TRANSLATIONS["uz"]["choose_language"],
            reply_markup=reply_markup
        )

# Handle language selection callback
async def handle_language_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle language selection from inline keyboard."""
    query = update.callback_query
    if not query or not query.data:
        return
    
    user_id = update.effective_user.id if update.effective_user else None
    if not user_id:
        return
    
    # Extract language from callback data
    if query.data.startswith("lang_"):
        selected_lang = query.data.replace("lang_", "")
        if selected_lang in TRANSLATIONS:
            user_languages[user_id] = selected_lang
            messages = TRANSLATIONS[selected_lang]
            
            # Store user profile info
            if update.effective_user:
                user_profiles[user_id] = {
                    "id": update.effective_user.id,
                    "first_name": update.effective_user.first_name,
                    "last_name": update.effective_user.last_name,
                    "username": update.effective_user.username,
                }
            
            # Check if user already has phone number
            user_phone = user_phone_numbers.get(user_id)
            
            if user_phone:
                # User already has phone, show mini app button
                web_app_url = os.getenv('WEB_APP_URL', 'https://your-web-app-url.com')
                web_app_url_with_lang = f"{web_app_url}?lang={selected_lang}"
                
                keyboard = [
                    [InlineKeyboardButton(messages["button"], web_app={"url": web_app_url_with_lang})]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await query.answer()
                await query.edit_message_text(
                    messages["language_selected"],
                    reply_markup=reply_markup
                )
            else:
                # Request phone number
                keyboard = [
                    [KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]
                ]
                reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=True)
                
                await query.answer()
                await query.message.reply_text(
                    messages["request_phone"],
                    reply_markup=reply_markup
                )

# Handle phone number
async def handle_contact(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle phone number from contact."""
    if not update.message or not update.message.contact:
        return
    
    user_id = update.effective_user.id if update.effective_user else None
    if not user_id:
        return
    
    phone_number = update.message.contact.phone_number
    user_lang = user_languages.get(user_id, "uz")
    messages = TRANSLATIONS[user_lang]
    
    # Store phone number
    user_phone_numbers[user_id] = phone_number
    
    # Update user profile
    if user_id in user_profiles:
        user_profiles[user_id]["phone_number"] = phone_number
    
    # Show confirmation and mini app button
    web_app_url = os.getenv('WEB_APP_URL', 'https://your-web-app-url.com')
    web_app_url_with_lang = f"{web_app_url}?lang={user_lang}"
    
    keyboard = [
        [InlineKeyboardButton(messages["button"], web_app={"url": web_app_url_with_lang})]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    # Remove keyboard
    remove_keyboard = ReplyKeyboardMarkup([[]], resize_keyboard=True)
    await update.message.reply_text(
        messages["phone_received"],
        reply_markup=remove_keyboard
    )
    
    await update.message.reply_text(
        messages["language_selected"],
        reply_markup=reply_markup
    )

# Handle regular text messages
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle regular text messages."""
    if not update.message:
        return
    
    # Check if it's a contact (phone number)
    if update.message.contact:
        await handle_contact(update, context)
        return
    
    if not update.message.text:
        return

    # Ignore commands (they're handled separately)
    if update.message.text.startswith('/'):
        return
    
    user_id = update.effective_user.id if update.effective_user else None
    user_lang = user_languages.get(user_id) if user_id else None
    
    # If user hasn't selected language, they might be trying to send phone manually
    if user_id and user_lang and not user_phone_numbers.get(user_id):
        # Check if message looks like a phone number
        text = update.message.text.strip()
        if text.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '').isdigit() and len(text.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '')) >= 9:
            user_phone_numbers[user_id] = text
            messages = TRANSLATIONS[user_lang]
            web_app_url = os.getenv('WEB_APP_URL', 'https://your-web-app-url.com')
            web_app_url_with_lang = f"{web_app_url}?lang={user_lang}"
            
            keyboard = [
                [InlineKeyboardButton(messages["button"], web_app={"url": web_app_url_with_lang})]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(
                messages["phone_received"],
                reply_markup=reply_markup
            )
            return
    
    language = detect_language(update)
    messages = TRANSLATIONS[language]
    logger.info("Received message from %s: %s", update.effective_user.id if update.effective_user else "unknown", update.message.text)
    await update.message.reply_text(messages["fallback"])

# Error handler
async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log the error and send a message to the user."""
    logger.error("Exception while handling an update: {0}".format(context.error))
    if isinstance(update, Update) and update.effective_chat:
        language = detect_language(update)
        messages = TRANSLATIONS[language]
        try:
            context.bot.send_message(chat_id=update.effective_chat.id, text=messages["error"])
        except Exception as bot_error:
            logger.error("Failed to notify user about the error: %s", bot_error)

def main() -> None:
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Register handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(handle_language_callback))
    application.add_handler(MessageHandler(filters.CONTACT, handle_contact))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Register error handler
    application.add_error_handler(error_handler)
    
    # Start the bot
    print('✅ Bot is running!')
    print('🤖 Telegram bot started successfully!')
    print('📱 Send /start to your bot to test it.')
    
    # Run the bot until the user presses Ctrl-C
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()

