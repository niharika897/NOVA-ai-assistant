# ✨ NOVA — Empathetic AI Assistant (Powered by Google Services)

NOVA (**Neural Omni-empathic Virtual Assistant**) is a state-of-the-art conversational AI interface designed after ChatGPT, integrated with **Google's Gemini AI** and engineered with a dedicated **Human Emotion Understanding & Resonance Engine**.

---

## 🌟 Key Capabilities

### 1. 🧠 Understands Every Question (Google Services Integration)
- **Google Gemini AI Models**: Powered by `gemini-3.8-flash` (latest generation), `gemini-2.5-flash`, and `gemini-2.5-pro`.
- **Google Search Grounding**: Toggleable real-time web search integration so NOVA can answer up-to-the-minute questions about world events, research, stocks, coding, and history.
- **Markdown & Code Highlighting**: Full code rendering with syntax highlighting and instant one-click copy.

### 2. 💖 Deep Human Emotion Intelligence (High EQ)
- **Real-Time Sentiment Awareness**: As you type or speak, NOVA analyzes the underlying emotional state (Stress, Sorrow, Joy, Curiosity, Anger, or Calm).
- **Dynamic Empathy Resonance Orb**: An interactive visual core that morphs its aura in response to your emotions:
  - 🌿 **Grounding Emerald** (`#06d6a0`): Senses anxiety, stress, or burnout; provides comforting space and gentle reassurance.
  - 💛 **Celebratory Gold** (`#ffb703`): Radiates joy and celebrates triumphs and milestones with genuine warmth.
  - 🤍 **Compassionate Rose** (`#ff4b72`): Listens empathetically during grief, loneliness, or sorrow without dismissive clichés.
  - 💡 **Inquisitive Azure** (`#00d2ff`): Sharp, clear, and energized for intellectual exploration and learning.
- **Emotion Perception Badges**: Each response from NOVA displays an empathy insight tag highlighting how NOVA understood your mood.

### 3. ⏰ Smart Reminders & Celestial Alarms
- **Natural Language Scheduling**: Type messages like `"Remind me to study Java in 2 minutes"`, `"Remind me to submit my assignment at 6 PM"`, or `"Remind me to drink water in 30 minutes"`.
- **Live Countdown & Active Reminders Manager**: Sidebar section with real-time countdown badges and quick cancel buttons.
- **Synthesizer Alarm Chime**: Gentle, looping Web Audio chime that rings when due (zero external audio files needed).
- **Alarm Modal & Snooze**: Full on-screen overlay modal with **Stop Alarm** and **Snooze (5m)** buttons.
- **Web Notifications**: Triggers native desktop notifications when granted, with an on-screen fail-safe.

### 4. 🎙️ Voice & Accessibility
- **Speech-to-Text**: Click the microphone icon to talk naturally.
- **Text-to-Speech (TTS)**: Optional warm voice read-aloud with pitch and pacing modulated to the emotional context.

### 5. 💬 ChatGPT-Style Experience
- Sidebar with conversation history and persistent multi-chat sessions.
- Dark mode and Light mode toggles.
- Zero-installation needed: runs directly in your web browser.

---

## 🚀 How to Run NOVA

You have two instant ways to launch NOVA:

### Option A: Double-Click (Zero Install)
1. Open the folder: `c:\Users\Niharika\OneDrive\Desktop\BEST`
2. Double-click **`index.html`** in any browser (Google Chrome, Microsoft Edge, Firefox, Brave).
3. NOVA is immediately ready!

### Option B: Local Node.js or Python Server
Run either built-in server:
```bash
node server.js
# or
python server.py
# or double-click START_NOVA.bat
```
This automatically opens `http://localhost:8080` in your default browser.

---

## 🔑 Connecting Your Google Gemini API Key

NOVA includes a built-in **Empathy Demonstration Engine** that works immediately without any setup.

To connect live to Google Gemini and enable real-time Google Search grounding:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a **free API key**.
2. In the NOVA interface, click **Settings & API Key** in the bottom-left sidebar.
3. Paste your key and click **Save & Apply**.
4. NOVA is now directly connected to Google's supercomputing intelligence!

---

## 👻 Snapchat-Style Live Peeking Avatar
- Dynamic animated presence where NOVA peeks out above the input bar when you type or focus.
- Real-time reaction speech and thought bubbles matching typed sentiment and intent.
- Smoothly ducks down below the horizon when idle.
- Interactive click: wiggle bounce animation with encouraging spoken quotes.

---

## 📁 Project Structure

```
BEST/
├── index.html       # ChatGPT-style web interface & layout
├── style.css        # Celestial blue theme, glowing orb, Snapchat peeking avatar
├── app.js           # Gemini AI connector, emotion classifier, reminders & presence logic
├── nova_avatar.jpg  # NOVA character portrait asset
├── server.js        # Built-in Node.js local server
├── server.py        # Built-in Python local server
├── START_NOVA.bat   # 1-Click Windows launcher
└── README.md        # Documentation and guide
```
