# AI Models Integration Setup

## ✅ What's Done

Your SymptomSense app now supports **3 AI models**:
1. **Mistral** (Already configured with your API key)
2. **Gemini 1.5 Pro** (Google)
3. **Ashish Pro**

## 🔑 Add Your API Keys

### Step 1: Get API Keys

**For Gemini:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

**For Ashish Pro:**
1. Get your Ashish Pro API key and endpoint URL
2. You'll need both the API key and the API URL

### Step 2: Add Keys to Your App

Open `src/app/constants/app.constants.ts` and replace the placeholder API keys:

```typescript
export const AI_MODELS = {
  MISTRAL: {
    name: 'Mistral',
    apiKey: 'SFDoNcIdekOhrpWpaRTfbVjHnk4yKPYz', // ✅ Already set
    apiUrl: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-tiny',
  },
  GEMINI: {
    name: 'Gemini 1.5 Pro',
    apiKey: 'YOUR_GEMINI_API_KEY', // 👈 Replace this
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    model: 'gemini-1.5-pro',
  },
  ASHISH: {
    name: 'Ashish Pro',
    apiKey: 'YOUR_ASHISH_API_KEY', // 👈 Replace this
    apiUrl: 'YOUR_ASHISH_API_URL', // 👈 Replace this
    model: 'ashish-pro',
  },
};
```

## 🎮 How to Use

1. **Start your app**: `npm start`
2. **Go to chat page**: Click "Start Chat"
3. **Select AI Model**: Use the dropdown in the header to switch between:
   - Mistral
   - Gemini 1.5 Pro  
   - Ashish Pro
4. **Chat**: Send messages and the selected AI will respond!

## 🎨 Features

- ✨ **Beautiful gradient UI**
- 🎙️ **Voice-to-text** (click microphone button)
- 📸 **Image upload** (camera button)
- 🔄 **Easy model switching** (dropdown in header)
- 📱 **Mobile responsive**

## 🚀 Testing

To test if models work:

1. **With Mistral only** (already configured):
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200`, go to chat, and send a message.

2. **With all models** (after adding keys):
   - Switch between models using the dropdown
   - Each model has different response styles
   - Check browser console for any errors

## 🔧 Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- This is normal when calling APIs directly from the browser
- Solution: You may need to set up a backend proxy
- Alternative: Use browser extensions that allow CORS during development

### API Key Invalid
- Double-check the API key is copied correctly
- Ensure no extra spaces
- Verify the API key is activated on the provider's dashboard

## 📝 Code Structure

### Clean & Minimal Architecture

```
src/app/
├── services/
│   ├── chat.service.ts      # Handles all 3 AI providers
│   ├── voice.service.ts     # Voice recognition
│   └── session.service.ts   # Session management
├── constants/
│   └── app.constants.ts     # AI model configurations
└── pages/chat/
    └── chat.component.*     # Chat UI with model selector
```

### Chat Service Methods

- `setProvider(provider)` - Switch AI model
- `getCurrentProvider()` - Get current model name
- `sendMessage()` - Send to selected AI model

Each provider has its own method:
- `sendToMistral()` - Mistral API
- `sendToGemini()` - Google Gemini API  
- `sendToAshish()` - Ashish Pro API

## 💡 Notes

- Default model: **Mistral** (loads on startup)
- Voice recording requires microphone permissions
- Image upload supports JPG and PNG (max 10MB)
- Session expires after 30 minutes of inactivity

Enjoy your multi-model AI chat app! 🎉

