# ElevenLabs Voice Integration Setup

## Overview
SymptomSense now uses **ElevenLabs** for realistic, high-quality AI voice output instead of the browser's built-in text-to-speech.

## Features
✅ **Realistic AI voices** - Natural-sounding speech synthesis  
✅ **Word-by-word highlighting** - Follow along as the AI speaks  
✅ **Pause/Resume** - Full playback control  
✅ **Click-to-play from word** - Start from any word  
✅ **Multiple voice options** - Choose from various AI voices  

---

## Quick Setup

### 1. Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for a free account (10,000 characters/month free)
3. Navigate to your [Profile Settings](https://elevenlabs.io/app/settings)
4. Copy your API key

### 2. Add API Key to Your App

**Option A: Browser Console (Easiest)**
1. Open your app in the browser
2. Open Developer Console (F12 or Cmd+Option+I on Mac)
3. Run this command:
```javascript
localStorage.setItem('elevenlabs_api_key', 'YOUR_API_KEY_HERE');
```
4. Refresh the page

**Option B: Direct Code Update**
1. Open `src/app/services/eleven-labs.service.ts`
2. Find line 10:
```typescript
private apiKey: string = ''; // Add your ElevenLabs API key here
```
3. Add your key:
```typescript
private apiKey: string = 'sk_your_api_key_here';
```

### 3. Test It Out
1. Start a conversation
2. Wait for an AI response
3. Click the **Play** button ▶️
4. Watch the words highlight as the AI speaks!

---

## Voice Customization

### Change the Voice

The default voice is **Rachel** (friendly female voice). To change it:

1. Open `src/app/services/eleven-labs.service.ts`
2. Find line 11:
```typescript
private voiceId: string = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
```
3. Replace with your preferred voice ID

### Available Voice IDs (Popular Choices)

| Voice Name | ID | Description |
|------------|----|----|
| Rachel | `21m00Tcm4TlvDq8ikWAM` | Young female, clear |
| Domi | `AZnzlk1XvdvUeBnXmlld` | Young female, strong |
| Bella | `EXAVITQu4vr4xnSDxMaL` | Soft female |
| Antoni | `ErXwobaYiN019PkySvjV` | Young male, deep |
| Josh | `TxGEqnHWrfWFTfGW9XjX` | Young male, casual |
| Arnold | `VR6AewLTigWG4xSOukaG` | Male, narration |
| Adam | `pNInz6obpgDQGcFmaJgB` | Deep male |
| Sam | `yoZ06aMxZJJ28mfd3POQ` | Young male |

### Get All Available Voices

Run this in your browser console (after setting API key):
```javascript
fetch('https://api.elevenlabs.io/v1/voices', {
  headers: { 'xi-api-key': localStorage.getItem('elevenlabs_api_key') }
})
.then(r => r.json())
.then(data => console.table(data.voices.map(v => ({
  name: v.name,
  id: v.voice_id,
  category: v.category
}))));
```

---

## Voice Settings

### Adjust Voice Parameters

In `eleven-labs.service.ts`, modify the `voice_settings`:

```typescript
voice_settings: {
  stability: 0.5,           // 0-1: Lower = more expressive, Higher = more stable
  similarity_boost: 0.75,   // 0-1: How closely to match the original voice
  style: 0.0,              // 0-1: Exaggeration of speaker style
  use_speaker_boost: true   // Enhance similarity to original speaker
}
```

**Recommended Settings:**
- **Storytelling**: `stability: 0.3, similarity_boost: 0.8`
- **Professional**: `stability: 0.7, similarity_boost: 0.6`
- **Conversational**: `stability: 0.5, similarity_boost: 0.75` (default)

---

## API Usage & Limits

### Free Tier
- 10,000 characters per month
- Commercial use allowed
- All voices available

### Paid Tiers
- **Starter ($5/mo)**: 30,000 characters
- **Creator ($22/mo)**: 100,000 characters
- **Pro ($99/mo)**: 500,000 characters
- **Scale ($330/mo)**: 2M characters

### Checking Usage
```javascript
fetch('https://api.elevenlabs.io/v1/user/subscription', {
  headers: { 'xi-api-key': localStorage.getItem('elevenlabs_api_key') }
})
.then(r => r.json())
.then(data => console.log('Characters used:', data.character_count, '/', data.character_limit));
```

---

## Troubleshooting

### Error: "ElevenLabs API key not set"
**Solution:** Set your API key using one of the methods above.

### Error: "Invalid API key"
**Solution:** 
1. Verify your API key is correct
2. Check it hasn't expired
3. Ensure you copied the full key (starts with `sk_`)

### Error: "API rate limit exceeded"
**Solution:** 
1. You've reached your monthly character limit
2. Wait until next month or upgrade your plan
3. Consider caching audio for repeated messages

### Audio Not Playing
**Solution:**
1. Check browser console for errors
2. Ensure your browser supports HTML5 Audio
3. Try a different browser (Chrome/Firefox recommended)

### Word Highlighting Out of Sync
**Note:** The highlighting is estimated based on audio duration and word count. For perfect sync, ElevenLabs would need to provide word-level timestamps (not currently available).

---

## Fallback Behavior

If ElevenLabs fails (no API key, network error, quota exceeded), the app will:
1. Show an error alert with details
2. The play button will remain functional
3. No audio will play (silent mode)

**Future Enhancement:** Add browser Speech Synthesis as fallback.

---

## Cost Optimization Tips

1. **Cache responses**: Store generated audio for common phrases
2. **Lazy generation**: Only generate audio when play button is clicked
3. **Monitor usage**: Check your character count regularly
4. **Shorter responses**: Configure AI to be concise

---

## Advanced: Custom Voice Cloning

ElevenLabs allows voice cloning (Pro tier):
1. Upload 1-2 minutes of clear audio samples
2. Wait for processing
3. Get a custom voice ID
4. Update `voiceId` in the service

---

## Support

- **ElevenLabs Docs**: https://docs.elevenlabs.io/
- **API Reference**: https://docs.elevenlabs.io/api-reference
- **Discord Community**: https://discord.gg/elevenlabs

---

**🎉 Enjoy realistic AI voices in SymptomSense!**

