# Yodda - Telegram Mini App

A Telegram mini app for managing links, folders, and subscriptions with multi-language support (UZ/RU/EN).

## 🚀 Running Locally

### Frontend (React App)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - The app will be available at `http://localhost:5173` (or the port shown in terminal)
   - You can test the language switcher and UI changes here

### Backend (Telegram Bot)

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create `.env` file** in the project root:
   ```env
   BOT_TOKEN=your_bot_token_from_botfather
   WEB_APP_URL=https://your-tunnel-url.com
   DEFAULT_LANGUAGE=en
   ```

3. **Start the bot:**
   ```bash
   python bot.py
   ```

### Testing with Telegram

To test the mini app in Telegram, you need to expose your localhost:

1. **Option 1: Using ngrok** (recommended)
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 5173
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and use it as `WEB_APP_URL` in your `.env`

2. **Option 2: Using localtunnel**
   ```bash
   npx localtunnel --port 5173
   ```
   Copy the URL provided and use it as `WEB_APP_URL`

3. **Update bot settings:**
   - Go to @BotFather on Telegram
   - Use `/setmenubutton` or `/newapp` to set your mini app URL
   - Use the tunnel URL you got from ngrok/localtunnel

## 📝 Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
