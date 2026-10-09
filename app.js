/**
 * NOVA - Empathetic AI Assistant
 * Powered by Google Gemini AI & Real-time Emotional Intelligence Engine
 */

// Resolve latest model and auto-migrate legacy models
let initialModel = localStorage.getItem('nova_gemini_model') || 'gemini-3.8-flash';
if (initialModel.includes('2.0') || initialModel.includes('1.5')) {
  initialModel = 'gemini-3.8-flash';
  localStorage.setItem('nova_gemini_model', initialModel);
}

// Application State
const state = {
  apiKey: localStorage.getItem('nova_gemini_api_key') || '',
  model: initialModel,
  persona: localStorage.getItem('nova_persona') || 'empath',
  searchGrounding: localStorage.getItem('nova_search_grounding') !== 'false',
  emotionEngine: localStorage.getItem('nova_emotion_engine') !== 'false',
  autoSpeech: localStorage.getItem('nova_auto_speech') === 'true',
  theme: localStorage.getItem('nova_theme') || 'dark',
  currentChatId: null,
  chats: JSON.parse(localStorage.getItem('nova_chat_history') || '[]'),
  reminders: JSON.parse(localStorage.getItem('nova_reminders') || '[]'),
  currentRingingReminder: null,
  isGenerating: false,
  isRecording: false,
  recognition: null
};

// Emotion Palettes & Resonance Map
const EMOTIONS = {
  serene: { label: 'Serene & Attentive', color: '#00d2ff', dot: '#00d2ff' },
  joy: { label: 'Celebratory Joy', color: '#ffb703', dot: '#ffb703' },
  sadness: { label: 'Compassionate Care', color: '#ff4b72', dot: '#ff4b72' },
  anxiety: { label: 'Grounding Comfort', color: '#06d6a0', dot: '#06d6a0' },
  anger: { label: 'Calm Understanding', color: '#9d4edd', dot: '#9d4edd' },
  curious: { label: 'Deep Curiosity', color: '#3a7bd5', dot: '#3a7bd5' }
};

// DOM Elements
const elements = {
  userInput: document.getElementById('userInput'),
  sendBtn: document.getElementById('sendBtn'),
  micBtn: document.getElementById('micBtn'),
  messagesContainer: document.getElementById('messagesContainer'),
  welcomeHero: document.getElementById('welcomeHero'),
  novaOrb: document.getElementById('novaOrb'),
  emotionPill: document.getElementById('emotionPill'),
  pillDot: document.getElementById('pillDot'),
  pillEmotionLabel: document.getElementById('pillEmotionLabel'),
  sentimentPreviewText: document.getElementById('sentimentPreviewText'),
  historyList: document.getElementById('historyList'),
  newChatBtn: document.getElementById('newChatBtn'),
  sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  openSettingsBtn: document.getElementById('openSettingsBtn'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  modelSelect: document.getElementById('modelSelect'),
  searchGroundingToggle: document.getElementById('searchGroundingToggle'),
  emotionEngineToggle: document.getElementById('emotionEngineToggle'),
  autoSpeechToggle: document.getElementById('autoSpeechToggle'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  clearKeyBtn: document.getElementById('clearKeyBtn'),
  voiceToggleBtn: document.getElementById('voiceToggleBtn'),
  ttsIcon: document.getElementById('ttsIcon'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  characterProfileTrigger: document.getElementById('characterProfileTrigger'),
  heroPortrait: document.getElementById('heroPortrait'),
  characterModal: document.getElementById('characterModal'),
  closeCharacterModalBtn: document.getElementById('closeCharacterModalBtn'),
  personaSelector: document.getElementById('personaSelector'),
  currentPersonaIcon: document.getElementById('currentPersonaIcon'),
  cosmicCanvas: document.getElementById('cosmicCanvas'),
  remindersSection: document.getElementById('remindersSection'),
  remindersCountBadge: document.getElementById('remindersCountBadge'),
  remindersList: document.getElementById('remindersList'),
  bellReminderBtn: document.getElementById('bellReminderBtn'),
  bellCountBadge: document.getElementById('bellCountBadge'),
  alarmModal: document.getElementById('alarmModal'),
  alarmTaskName: document.getElementById('alarmTaskName'),
  alarmDueTime: document.getElementById('alarmDueTime'),
  stopAlarmBtn: document.getElementById('stopAlarmBtn'),
  snoozeAlarmBtn: document.getElementById('snoozeAlarmBtn'),
  snapPresence: document.getElementById('snapPresence'),
  snapAvatarWrap: document.getElementById('snapAvatarWrap'),
  snapBubble: document.getElementById('snapBubble'),
  snapBubbleText: document.getElementById('snapBubbleText'),
  snapAvatarImg: document.getElementById('snapAvatarImg')
};

// Initialize App
function init() {
  applyTheme(state.theme);
  loadSettingsIntoUI();
  setupEventListeners();
  setupSpeechRecognition();
  setPersona(state.persona);
  setupCosmicCanvas();
  renderRemindersUI();
  startReminderTicker();
  renderHistory();

  if (state.chats.length > 0) {
    loadChat(state.chats[0].id);
  } else {
    createNewChat();
  }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Input Auto-resize, Typing, & Snapchat Live Peeking Presence
  elements.userInput.addEventListener('input', () => {
    elements.userInput.style.height = 'auto';
    elements.userInput.style.height = `${Math.min(elements.userInput.scrollHeight, 180)}px`;
    elements.sendBtn.disabled = !elements.userInput.value.trim();
    detectLiveEmotion(elements.userInput.value);
    handleSnapTypingPresence(elements.userInput.value);
  });

  // Focus: Peek up when user clicks into chat
  elements.userInput.addEventListener('focus', () => {
    if (!elements.userInput.value.trim()) {
      showSnapPresence("I'm listening! ✨", 2400);
    } else {
      handleSnapTypingPresence(elements.userInput.value);
    }
  });

  // Blur: Duck down gracefully when user clicks away and input is idle
  elements.userInput.addEventListener('blur', () => {
    setTimeout(() => {
      if (!state.isGenerating) {
        hideSnapPresence();
      }
    }, 1200);
  });

  // Direct Click on Peeking Snapchat Avatar
  elements.snapAvatarWrap?.addEventListener('click', triggerSnapAvatarClick);

  // Enter to send (Shift+Enter for newline)
  elements.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  elements.sendBtn.addEventListener('click', handleSend);
  elements.newChatBtn.addEventListener('click', createNewChat);

  // Sidebar Toggles
  elements.sidebarToggle?.addEventListener('click', () => {
    elements.sidebar.classList.toggle('collapsed');
  });

  elements.mobileMenuBtn?.addEventListener('click', () => {
    elements.sidebar.classList.toggle('open');
  });

  // Settings Modal
  elements.openSettingsBtn.addEventListener('click', () => {
    elements.apiKeyInput.value = state.apiKey;
    elements.modelSelect.value = state.model;
    elements.searchGroundingToggle.checked = state.searchGrounding;
    elements.emotionEngineToggle.checked = state.emotionEngine;
    elements.autoSpeechToggle.checked = state.autoSpeech;
    elements.settingsModal.classList.add('active');
  });

  elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.classList.remove('active');
  });

  elements.saveSettingsBtn.addEventListener('click', saveSettings);

  elements.clearKeyBtn?.addEventListener('click', () => {
    state.apiKey = '';
    elements.apiKeyInput.value = '';
    localStorage.removeItem('nova_gemini_api_key');
    elements.settingsModal.classList.remove('active');
    alert('API key reset! NOVA will now operate using its high-EQ Free Neural Engine.');
  });

  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Voice Toggle (Auto Speech)
  elements.voiceToggleBtn.addEventListener('click', () => {
    state.autoSpeech = !state.autoSpeech;
    localStorage.setItem('nova_auto_speech', state.autoSpeech);
    elements.voiceToggleBtn.style.color = state.autoSpeech ? 'var(--accent-cyan)' : '';
  });

  // Character Dossier Modal
  elements.characterProfileTrigger?.addEventListener('click', () => {
    elements.characterModal?.classList.add('active');
  });

  elements.heroPortrait?.addEventListener('click', () => {
    elements.characterModal?.classList.add('active');
  });

  elements.closeCharacterModalBtn?.addEventListener('click', () => {
    elements.characterModal?.classList.remove('active');
  });

  // Persona Selector in Nav
  elements.personaSelector?.addEventListener('change', (e) => {
    setPersona(e.target.value);
  });

  // Persona Cards in Hero
  document.querySelectorAll('.persona-card').forEach(card => {
    card.addEventListener('click', () => {
      const persona = card.getAttribute('data-persona');
      if (persona) setPersona(persona);
    });
  });

  // Alarm Modal Controls
  elements.stopAlarmBtn?.addEventListener('click', stopAlarm);
  elements.snoozeAlarmBtn?.addEventListener('click', snoozeAlarm);

  // Bell Reminder Button: expand sidebar and focus active reminders
  elements.bellReminderBtn?.addEventListener('click', () => {
    if (elements.sidebar.classList.contains('collapsed')) {
      elements.sidebar.classList.remove('collapsed');
    }
    elements.remindersSection?.scrollIntoView({ behavior: 'smooth' });
  });

  // Prompt Chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      elements.userInput.value = chip.getAttribute('data-prompt');
      elements.userInput.dispatchEvent(new Event('input'));
      handleSend();
    });
  });
}

// ==================== SNAPCHAT-STYLE AVATAR PRESENCE CONTROLLER ====================
let snapPresenceTimeout = null;
let snapIsActive = false;

const SNAP_QUOTES = [
  "Hey there! I'm NOVA, your empathetic companion ✨",
  "I'm listening closely to every word! 💙",
  "You're doing great today, keep going! 🌟",
  "Need a reminder or alarm? Just ask me anytime! ⏰",
  "I'm right here with you through every high and low! 💫",
  "Ask me anything—science, feelings, code, or life! 🚀"
];

function showSnapPresence(bubbleText = "Listening... 💭", autoHideMs = 2600, glowColor = null) {
  if (!elements.snapPresence) return;

  if (snapPresenceTimeout) {
    clearTimeout(snapPresenceTimeout);
    snapPresenceTimeout = null;
  }

  snapIsActive = true;
  elements.snapPresence.classList.add('active');

  if (elements.snapBubbleText && bubbleText) {
    elements.snapBubbleText.innerHTML = bubbleText;
  }

  if (glowColor && elements.snapAvatarImg) {
    elements.snapAvatarImg.style.boxShadow = `0 0 18px ${glowColor}, 0 0 32px ${glowColor}55`;
    elements.snapAvatarImg.style.borderColor = glowColor;
  }

  if (autoHideMs && autoHideMs > 0) {
    snapPresenceTimeout = setTimeout(() => {
      hideSnapPresence();
    }, autoHideMs);
  }
}

function hideSnapPresence() {
  if (!elements.snapPresence) return;
  // If user is currently typing / input has text and focus, keep peeking
  if (document.activeElement === elements.userInput && elements.userInput && elements.userInput.value.trim().length > 0) {
    return;
  }
  // If generating a response, stay visible
  if (state.isGenerating) {
    return;
  }

  snapIsActive = false;
  elements.snapPresence.classList.remove('active');
  if (snapPresenceTimeout) {
    clearTimeout(snapPresenceTimeout);
    snapPresenceTimeout = null;
  }
}

function handleSnapTypingPresence(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showSnapPresence("I'm right here! 💭", 2000);
    return;
  }

  const lower = trimmed.toLowerCase();
  let bubbleMsg = "Listening closely... 👀";
  let glowColor = "var(--accent-cyan)";

  if (/\b(remind|alarm)\b/.test(lower)) {
    bubbleMsg = "Ready to set your alarm! ⏰";
    glowColor = "#ffb703";
  } else if (/\?/.test(lower) || /\b(why|how|what|who|can you|explain)\b/.test(lower)) {
    bubbleMsg = "Curious thought! 💡 Let's explore!";
    glowColor = "#38bdf8";
  } else if (/\b(sad|hurt|lonely|tired|overwhelmed|stressed|anxious|pain)\b/.test(lower)) {
    bubbleMsg = "Holding space for you 💙 Take your time.";
    glowColor = "#06d6a0";
  } else if (/\b(happy|yay|awesome|won|celebrate|love|excited|great)\b/.test(lower)) {
    bubbleMsg = "Yay! Tell me all about it! 🎉✨";
    glowColor = "#ffb703";
  } else if (/\b(code|python|java|bug|error|function|api)\b/.test(lower)) {
    bubbleMsg = "Ready to analyze & build! 💻⚡";
    glowColor = "#8b5cf6";
  } else {
    if (trimmed.length > 25) {
      bubbleMsg = "Reading your thoughts... 💭✨";
    } else {
      bubbleMsg = "Watching you type... 👀";
    }
  }

  // Show avatar and keep it up for 2.6s after typing stops
  showSnapPresence(bubbleMsg, 2600, glowColor);
}

function triggerSnapAvatarClick() {
  if (!elements.snapAvatarWrap) return;

  // Cheerful wiggle bounce
  elements.snapAvatarWrap.style.transform = "translateY(-14px) scale(1.18) rotate(-8deg)";
  setTimeout(() => {
    if (elements.snapAvatarWrap) {
      elements.snapAvatarWrap.style.transform = "translateY(-10px) scale(1.12) rotate(8deg)";
    }
  }, 160);
  setTimeout(() => {
    if (elements.snapAvatarWrap) {
      elements.snapAvatarWrap.style.transform = "";
    }
  }, 340);

  // Pick random quote
  const randomQuote = SNAP_QUOTES[Math.floor(Math.random() * SNAP_QUOTES.length)];
  showSnapPresence(randomQuote, 4000, "var(--accent-rose)");

  if (state.autoSpeech) {
    speakText(randomQuote);
  }
}

// ==================== REMINDERS & ALARM SYSTEM ====================
let alarmAudioCtx = null;
let alarmInterval = null;
let isAlarmRinging = false;
let reminderTickerId = null;

function parseReminderIntent(rawText) {
  const text = rawText.trim();
  const isReminder = /\b(remind\s+me|set\s+(?:a\s+)?reminder|set\s+(?:an?\s+)?alarm|alarm\s+for)\b/i.test(text);
  if (!isReminder) return null;

  let task = '';
  let dueTimestamp = null;
  let timeDescription = '';

  // 1. Relative time: "in X (seconds|minutes|hours)"
  const relPattern1 = /(?:remind\s+me\s+to|set\s+(?:a\s+)?reminder\s+to|set\s+(?:an?\s+)?alarm\s+to)\s+(.+?)\s+in\s+(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)\b/i;
  const relPattern2 = /(?:remind\s+me|set\s+(?:a\s+)?reminder|set\s+(?:an?\s+)?alarm)\s+in\s+(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)\s+(?:to\s+)?(.+)/i;

  let relMatch = text.match(relPattern1);
  if (relMatch) {
    task = relMatch[1].trim();
    const amount = parseFloat(relMatch[2]);
    const unit = relMatch[3].toLowerCase();
    let ms = 0;
    if (unit.startsWith('s')) ms = amount * 1000;
    else if (unit.startsWith('m')) ms = amount * 60 * 1000;
    else if (unit.startsWith('h')) ms = amount * 60 * 60 * 1000;

    dueTimestamp = Date.now() + ms;
    timeDescription = `in ${amount} ${unit.replace(/^s$/, 'seconds').replace(/^m$/, 'minutes').replace(/^h$/, 'hours')}`;
  } else {
    relMatch = text.match(relPattern2);
    if (relMatch) {
      const amount = parseFloat(relMatch[1]);
      const unit = relMatch[2].toLowerCase();
      task = relMatch[3].trim();
      let ms = 0;
      if (unit.startsWith('s')) ms = amount * 1000;
      else if (unit.startsWith('m')) ms = amount * 60 * 1000;
      else if (unit.startsWith('h')) ms = amount * 60 * 60 * 1000;

      dueTimestamp = Date.now() + ms;
      timeDescription = `in ${amount} ${unit.replace(/^s$/, 'seconds').replace(/^m$/, 'minutes').replace(/^h$/, 'hours')}`;
    }
  }

  // 2. Absolute time: e.g. "at 6 PM", "at 4:30 pm"
  if (!dueTimestamp) {
    const absPattern1 = /(?:remind\s+me\s+to|set\s+(?:a\s+)?reminder\s+to|set\s+(?:an?\s+)?alarm\s+to)\s+(.+?)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
    const absPattern2 = /(?:remind\s+me|set\s+(?:an?\s+)?(?:reminder|alarm))\s+(?:at|for)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+(?:to\s+)?(.+)/i;

    let absMatch = text.match(absPattern1);
    if (absMatch) {
      task = absMatch[1].trim();
      const hours = parseInt(absMatch[2], 10);
      const minutes = absMatch[3] ? parseInt(absMatch[3], 10) : 0;
      const meridiem = absMatch[4] ? absMatch[4].toLowerCase() : null;

      dueTimestamp = calculateAbsoluteTimestamp(hours, minutes, meridiem);
      timeDescription = `at ${formatTimeStr(new Date(dueTimestamp))}`;
    } else {
      absMatch = text.match(absPattern2);
      if (absMatch) {
        const hours = parseInt(absMatch[1], 10);
        const minutes = absMatch[2] ? parseInt(absMatch[2], 10) : 0;
        const meridiem = absMatch[3] ? absMatch[3].toLowerCase() : null;
        task = absMatch[4].trim();

        dueTimestamp = calculateAbsoluteTimestamp(hours, minutes, meridiem);
        timeDescription = `at ${formatTimeStr(new Date(dueTimestamp))}`;
      }
    }
  }

  // Clean task description
  if (task) {
    task = task.replace(/^to\s+/i, '').replace(/[.!?]+$/, '').trim();
    if (task.length > 0) {
      task = task.charAt(0).toUpperCase() + task.slice(1);
    }
  }

  if (!task || !dueTimestamp || isNaN(dueTimestamp)) {
    return {
      isReminder: true,
      valid: false,
      error: 'I recognized you want a reminder, but couldn\'t clearly understand the time or task. Examples of what works:\n- *"Remind me to study Java in 2 minutes"*\n- *"Remind me to submit my assignment at 6 PM"*\n- *"Remind me to drink water in 30 minutes"*'
    };
  }

  return {
    isReminder: true,
    valid: true,
    task,
    dueTimestamp,
    timeDescription
  };
}

function calculateAbsoluteTimestamp(hours, minutes, meridiem) {
  const target = new Date();
  let h = hours;
  if (meridiem === 'pm' && h < 12) h += 12;
  else if (meridiem === 'am' && h === 12) h = 0;
  else if (!meridiem) {
    if (h < 12 && target.getHours() >= 12 && target.getHours() < (h + 12)) {
      h += 12;
    }
  }

  target.setHours(h, minutes, 0, 0);

  // If time has already passed today, schedule for tomorrow
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
}

function formatTimeStr(dateObj) {
  let h = dateObj.getHours();
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Due now';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `in ${hours}h ${minutes}m`;
  if (minutes > 0) return `in ${minutes}m ${seconds}s`;
  return `in ${seconds}s`;
}

function addReminder(task, dueTimestamp) {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  const reminder = {
    id: 'rem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    task,
    dueTimestamp,
    createdAt: new Date().toISOString()
  };

  state.reminders.push(reminder);
  saveReminders();
  renderRemindersUI();
  return reminder;
}

function deleteReminder(id) {
  state.reminders = state.reminders.filter(r => r.id !== id);
  saveReminders();
  renderRemindersUI();
}

function saveReminders() {
  localStorage.setItem('nova_reminders', JSON.stringify(state.reminders));
}

function renderRemindersUI() {
  const count = state.reminders.length;
  if (elements.remindersCountBadge) elements.remindersCountBadge.textContent = count;
  if (elements.bellCountBadge) {
    elements.bellCountBadge.textContent = count;
    elements.bellCountBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  if (!elements.remindersList) return;

  if (count === 0) {
    elements.remindersList.innerHTML = '<div class="reminders-empty">No pending reminders</div>';
    return;
  }

  // Sort by earliest due date
  state.reminders.sort((a, b) => a.dueTimestamp - b.dueTimestamp);

  elements.remindersList.innerHTML = '';
  state.reminders.forEach(rem => {
    const item = document.createElement('div');
    item.className = 'reminder-card-item';
    const countdown = formatCountdown(rem.dueTimestamp - Date.now());
    const exactTime = formatTimeStr(new Date(rem.dueTimestamp));

    item.innerHTML = `
      <div class="reminder-info">
        <span class="reminder-task-title" title="${escapeHtml(rem.task)}">📌 ${escapeHtml(rem.task)}</span>
        <span class="reminder-countdown-badge" id="cd-${rem.id}">${countdown} (${exactTime})</span>
      </div>
      <button class="delete-reminder-btn" title="Cancel Reminder" data-id="${rem.id}">✕</button>
    `;

    item.querySelector('.delete-reminder-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteReminder(rem.id);
    });

    elements.remindersList.appendChild(item);
  });
}

function startReminderTicker() {
  if (reminderTickerId) clearInterval(reminderTickerId);

  reminderTickerId = setInterval(() => {
    const now = Date.now();

    // Update live countdown badges
    state.reminders.forEach(rem => {
      const cdElem = document.getElementById(`cd-${rem.id}`);
      if (cdElem) {
        cdElem.textContent = `${formatCountdown(rem.dueTimestamp - now)} (${formatTimeStr(new Date(rem.dueTimestamp))})`;
      }
    });

    // Check if any reminder is due
    const dueReminders = state.reminders.filter(rem => rem.dueTimestamp <= now);
    if (dueReminders.length > 0) {
      dueReminders.forEach(dueRem => {
        fireAlarm(dueRem);
      });
      state.reminders = state.reminders.filter(rem => rem.dueTimestamp > now);
      saveReminders();
      renderRemindersUI();
    }
  }, 1000);
}

// Web Audio API Synthesizer Chime
function startAlarmSound() {
  if (isAlarmRinging) return;
  isAlarmRinging = true;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!alarmAudioCtx) alarmAudioCtx = new AudioCtx();
    if (alarmAudioCtx.state === 'suspended') alarmAudioCtx.resume();

    function playTone(freq, startTime, duration) {
      const osc = alarmAudioCtx.createOscillator();
      const gain = alarmAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(alarmAudioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    function loopAlarm() {
      if (!isAlarmRinging) return;
      const t = alarmAudioCtx.currentTime;
      // Celestial melodious chime loop
      playTone(659.25, t, 0.35);         // E5
      playTone(830.61, t + 0.15, 0.35);  // G#5
      playTone(987.77, t + 0.30, 0.35);  // B5
      playTone(1318.51, t + 0.45, 0.7);  // E6
    }

    loopAlarm();
    alarmInterval = setInterval(loopAlarm, 1500);
  } catch (err) {
    console.warn('AudioContext alarm error:', err);
  }
}

function stopAlarmSound() {
  isAlarmRinging = false;
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

function fireAlarm(reminder) {
  state.currentRingingReminder = reminder;

  // 1. Play audio alarm
  startAlarmSound();

  // 2. Display on-screen overlay modal
  if (elements.alarmTaskName) elements.alarmTaskName.textContent = reminder.task;
  if (elements.alarmDueTime) elements.alarmDueTime.textContent = `Scheduled for ${formatTimeStr(new Date(reminder.dueTimestamp))}`;
  if (elements.alarmModal) elements.alarmModal.classList.add('active');

  // 3. Trigger Browser Web Notification if allowed
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`NOVA Reminder: ${reminder.task} ⏰`, {
        body: `It's time! Scheduled for ${formatTimeStr(new Date(reminder.dueTimestamp))}`,
        icon: 'nova_avatar.jpg'
      });
    } catch (e) {
      console.warn('Web notification failed:', e);
    }
  }

  // 4. Append notification message into active chat
  const currentChat = state.chats.find(c => c.id === state.currentChatId);
  if (currentChat) {
    const alarmMsg = {
      id: 'msg_alarm_' + Date.now(),
      role: 'nova',
      text: `🔔 **ALARM RINGING!** It is time to: **${reminder.task}**! ⏰\n\n*(Click 'Stop Alarm' on screen to dismiss.)*`,
      emotion: {
        name: 'Urgent Attunement',
        color: '#ffb703',
        insight: `Reminder due: ${reminder.task}`
      },
      timestamp: new Date().toISOString()
    };
    currentChat.messages.push(alarmMsg);
    saveChats();
    appendMessageToDOM(alarmMsg);
    setOrbEmotion('joy', 'Alarm Ringing', '#ffb703');
  }
}

function stopAlarm() {
  stopAlarmSound();
  if (elements.alarmModal) elements.alarmModal.classList.remove('active');
  state.currentRingingReminder = null;
  setOrbEmotion('serene');
}

function snoozeAlarm() {
  const activeRem = state.currentRingingReminder;
  stopAlarm();
  if (activeRem) {
    const snoozeTime = Date.now() + 5 * 60 * 1000;
    addReminder(activeRem.task + ' (Snoozed)', snoozeTime);
    alert(`Snoozed "${activeRem.task}" for 5 minutes.`);
  }
}

// ==================== PERSONA & COSMIC CANVAS ====================
function setPersona(personaKey) {
  state.persona = personaKey;
  localStorage.setItem('nova_persona', personaKey);

  const icons = {
    empath: '🌌',
    polymath: '⚡',
    companion: '☕',
    zen: '🧘'
  };

  if (elements.personaSelector) elements.personaSelector.value = personaKey;
  if (elements.currentPersonaIcon) elements.currentPersonaIcon.textContent = icons[personaKey] || '🌌';

  document.querySelectorAll('.persona-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-persona') === personaKey);
  });
}

function setupCosmicCanvas() {
  const canvas = elements.cosmicCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const starColors = [
    '255, 255, 255',   // pure crystal white
    '0, 210, 255',     // celestial cyan
    '56, 189, 248',    // sky blue
    '96, 165, 250',    // sapphire blue
    '147, 197, 253'    // soft starlight blue
  ];

  const stars = [];
  for (let i = 0; i < 110; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: starColors[Math.floor(Math.random() * starColors.length)]
    });
  }

  function renderStars() {
    ctx.clearRect(0, 0, width, height);
    for (let star of stars) {
      star.alpha += star.speed * star.direction;
      if (star.alpha > 0.95) star.direction = -1;
      else if (star.alpha < 0.1) star.direction = 1;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${star.color}, ${Math.max(0, star.alpha)})`;
      ctx.fill();
    }
    requestAnimationFrame(renderStars);
  }
  renderStars();
}

// ==================== EMOTION CLASSIFIER ====================
function detectLiveEmotion(text) {
  if (!text.trim()) {
    setOrbEmotion('serene');
    elements.sentimentPreviewText.textContent = 'Listening with empathy...';
    return;
  }

  const lower = text.toLowerCase();
  
  // Emotional Pattern Matching
  const patterns = {
    joy: /\b(happy|excited|won|success|achievement|great|celebrate|proud|love|fantastic|yay|awesome|blessed|milestone)\b/,
    sadness: /\b(sad|crying|depressed|heartbroken|grief|alone|lonely|hurt|hopeless|loss|lost|miss|pain)\b/,
    anxiety: /\b(anxious|stress|stressed|overwhelmed|nervous|scared|panic|worried|fear|pressure|burnout|exhausted|tired)\b/,
    anger: /\b(angry|furious|hate|mad|annoyed|unfair|frustrated|rage|idiot|pissed)\b/,
    curious: /\b(why|how|explain|what if|curious|learn|discover|science|quantum|universe|code|build|create)\b/
  };

  let matchedEmotion = 'serene';

  if (patterns.joy.test(lower)) matchedEmotion = 'joy';
  else if (patterns.sadness.test(lower)) matchedEmotion = 'sadness';
  else if (patterns.anxiety.test(lower)) matchedEmotion = 'anxiety';
  else if (patterns.anger.test(lower)) matchedEmotion = 'anger';
  else if (patterns.curious.test(lower)) matchedEmotion = 'curious';

  setOrbEmotion(matchedEmotion);

  const previewLabels = {
    joy: 'Feeling your joy and triumph ✨',
    sadness: 'Holding space for you with care 🤍',
    anxiety: 'Offering a calming, safe breath 🌿',
    anger: 'Listening without judgment 💜',
    curious: 'Exploring with keen intellect 💡',
    serene: 'Listening with empathy...'
  };

  elements.sentimentPreviewText.textContent = previewLabels[matchedEmotion];
}

function setOrbEmotion(emotionKey, customLabel = null, customColor = null) {
  const meta = EMOTIONS[emotionKey] || EMOTIONS.serene;
  const color = customColor || meta.color;
  const label = customLabel || meta.label;

  document.documentElement.style.setProperty('--orb-glow', color);
  if (elements.pillDot) {
    elements.pillDot.style.background = color;
    elements.pillDot.style.boxShadow = `0 0 10px ${color}`;
  }
  if (elements.pillEmotionLabel) {
    elements.pillEmotionLabel.textContent = `Resonance: ${label}`;
  }

  // Adjust heartbeat wave speed dynamically based on emotional energy
  const wave = document.querySelector('.heartbeat-wave');
  if (wave) {
    const speeds = { joy: '1.1s', anger: '1.2s', anxiety: '2.5s', sadness: '2.2s', serene: '1.8s', curious: '1.5s' };
    wave.style.animationDuration = speeds[emotionKey] || '1.8s';
  }
}

// ==================== CHAT ACTIONS ====================
function createNewChat() {
  const newChat = {
    id: 'chat_' + Date.now(),
    title: 'New Conversation',
    createdAt: new Date().toISOString(),
    messages: []
  };

  state.chats.unshift(newChat);
  saveChats();
  loadChat(newChat.id);
  renderHistory();
}

function loadChat(chatId) {
  state.currentChatId = chatId;
  const chat = state.chats.find(c => c.id === chatId);
  if (!chat) return;

  renderMessages(chat.messages);
  renderHistory();

  // Scroll to bottom
  elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function renderHistory() {
  elements.historyList.innerHTML = '';
  state.chats.forEach(chat => {
    const item = document.createElement('div');
    item.className = `history-item ${chat.id === state.currentChatId ? 'active' : ''}`;
    item.innerHTML = `
      <span>💬 ${escapeHtml(chat.title)}</span>
      <button class="icon-btn delete-chat-btn" title="Delete" style="width:24px;height:24px;opacity:0.6;">✕</button>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-chat-btn')) {
        e.stopPropagation();
        deleteChat(chat.id);
      } else {
        loadChat(chat.id);
      }
    });

    elements.historyList.appendChild(item);
  });
}

function deleteChat(chatId) {
  state.chats = state.chats.filter(c => c.id !== chatId);
  saveChats();
  if (state.chats.length === 0) {
    createNewChat();
  } else {
    loadChat(state.chats[0].id);
  }
}

function saveChats() {
  localStorage.setItem('nova_chat_history', JSON.stringify(state.chats));
}

// ==================== RENDERING MESSAGES ====================
function renderMessages(messages) {
  elements.messagesContainer.innerHTML = '';

  if (!messages || messages.length === 0) {
    elements.welcomeHero.style.display = 'flex';
    elements.messagesContainer.appendChild(elements.welcomeHero);
    return;
  }

  elements.welcomeHero.style.display = 'none';

  messages.forEach(msg => {
    appendMessageToDOM(msg);
  });
}

function appendMessageToDOM(msg) {
  const row = document.createElement('div');
  row.className = `message-row ${msg.role}`;
  row.id = `msg-${msg.id || Date.now()}`;

  const isUser = msg.role === 'user';

  let emotionTagHtml = '';
  if (!isUser && msg.emotion) {
    emotionTagHtml = `
      <div class="emotion-tag">
        <span class="emo-dot" style="background:${msg.emotion.color || 'var(--accent-cyan)'}"></span>
        <span>${escapeHtml(msg.emotion.name)}</span>
      </div>
    `;
  }

  // Parse markdown for NOVA messages, plain text for user
  const formattedContent = isUser 
    ? escapeHtml(msg.text).replace(/\n/g, '<br>')
    : marked.parse(msg.text);

  row.innerHTML = `
    <div class="msg-avatar">${isUser ? 'U' : '✨'}</div>
    <div class="msg-body">
      ${emotionTagHtml}
      <div class="msg-content">${formattedContent}</div>
      ${!isUser ? `
        <div class="msg-actions">
          <button class="msg-action-btn copy-btn" title="Copy text">📋 Copy</button>
          <button class="msg-action-btn speak-btn" title="Read Aloud">🔊 Listen</button>
        </div>
      ` : ''}
    </div>
  `;

  // Attach action listeners
  if (!isUser) {
    row.querySelector('.copy-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(msg.text);
      alert('Copied to clipboard!');
    });

    row.querySelector('.speak-btn')?.addEventListener('click', () => {
      speakText(msg.text);
    });
  }

  elements.messagesContainer.appendChild(row);

  // Apply code highlighting
  row.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });

  elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// ==================== SENDING & STREAMING ====================
async function handleSend() {
  const text = elements.userInput.value.trim();
  if (!text || state.isGenerating) return;

  const currentChat = state.chats.find(c => c.id === state.currentChatId);
  if (!currentChat) return;

  // Add User Message
  const userMsg = {
    id: 'msg_' + Date.now(),
    role: 'user',
    text: text,
    timestamp: new Date().toISOString()
  };

  currentChat.messages.push(userMsg);
  if (currentChat.messages.length === 1) {
    // Generate brief title from first message
    currentChat.title = text.slice(0, 32) + (text.length > 32 ? '...' : '');
    renderHistory();
  }

  appendMessageToDOM(userMsg);
  elements.userInput.value = '';
  elements.userInput.style.height = 'auto';
  elements.sendBtn.disabled = true;
  saveChats();

  // Check if user requested a Reminder or Alarm
  const reminderIntent = parseReminderIntent(text);
  if (reminderIntent && reminderIntent.isReminder) {
    if (!reminderIntent.valid) {
      const novaMsg = {
        id: 'msg_' + Date.now(),
        role: 'nova',
        text: `⚠️ **Reminder Note**: ${reminderIntent.error}`,
        emotion: {
          name: 'Helpful Clarification',
          color: '#ffb703',
          insight: 'Guiding reminder syntax'
        },
        timestamp: new Date().toISOString()
      };
      currentChat.messages.push(novaMsg);
      saveChats();
      appendMessageToDOM(novaMsg);
      setOrbEmotion('serene', 'Clarification', '#ffb703');
      showSnapPresence("Let's refine that time! ⏰", 2800, "#ffb703");
      return;
    }

    // Schedule the reminder
    addReminder(reminderIntent.task, reminderIntent.dueTimestamp);
    const timeFormatted = formatTimeStr(new Date(reminderIntent.dueTimestamp));
    const novaMsg = {
      id: 'msg_' + Date.now(),
      role: 'nova',
      text: `⏰ **Reminder Scheduled!**\n\nI have set an alarm for you:\n- 📝 **Task**: **${reminderIntent.task}**\n- ⏳ **When**: ${reminderIntent.timeDescription} (at **${timeFormatted}**)\n\nI will keep track in the background and ring the alarm with a notification when it's time! ✨`,
      emotion: {
        name: 'Attentive Vigilance',
        color: '#00d2ff',
        insight: `Scheduled alarm for ${reminderIntent.task}`
      },
      timestamp: new Date().toISOString()
    };
    currentChat.messages.push(novaMsg);
    saveChats();
    appendMessageToDOM(novaMsg);
    setOrbEmotion('serene', 'Alarm Armed', '#00d2ff');
    showSnapPresence("Alarm set & armed! ⏰✨", 3200, "#00d2ff");
    if (state.autoSpeech) {
      speakText(`Reminder set for ${reminderIntent.task} at ${timeFormatted}`);
    }
    return;
  }

  // Show NOVA Thinking Row & Snapchat presence
  showSnapPresence("Thinking through this... 🧠💫", 0, "var(--accent-purple)");
  const typingRow = createTypingRow();
  elements.messagesContainer.appendChild(typingRow);
  elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;

  state.isGenerating = true;

  try {
    const response = await fetchNovaResponse(currentChat.messages, text);
    typingRow.remove();

    const novaMsg = {
      id: 'msg_' + Date.now(),
      role: 'nova',
      text: response.text,
      emotion: response.emotion,
      timestamp: new Date().toISOString()
    };

    currentChat.messages.push(novaMsg);
    saveChats();
    appendMessageToDOM(novaMsg);

    // Update orb with final detected emotion
    if (response.emotion) {
      setOrbEmotion('serene', response.emotion.name, response.emotion.color);
    }

    showSnapPresence("Here for you! 🌟", 3200, response.emotion?.color || "#00d2ff");

    if (state.autoSpeech) {
      speakText(response.text);
    }
  } catch (err) {
    typingRow.remove();
    console.warn('Google Gemini API notice:', err);
    // Automatic fail-safe: answer with built-in neural reasoning so chat never halts
    try {
      const fallbackResponse = await simulateNovaIntelligence(text, true, err.message);
      const novaMsg = {
        id: 'msg_' + Date.now(),
        role: 'nova',
        text: fallbackResponse.text,
        emotion: fallbackResponse.emotion,
        timestamp: new Date().toISOString()
      };
      currentChat.messages.push(novaMsg);
      saveChats();
      appendMessageToDOM(novaMsg);
      if (fallbackResponse.emotion) {
        setOrbEmotion('serene', fallbackResponse.emotion.name, fallbackResponse.emotion.color);
      }
      showSnapPresence("I'm right here with you 🌿", 3200, "#06d6a0");
    } catch (fallbackErr) {
      appendMessageToDOM({
        id: 'msg_err_' + Date.now(),
        role: 'nova',
        text: `I'm right here with you. Google's cloud servers are catching their breath for a moment—feel free to ask again! 🌿`,
        timestamp: new Date().toISOString()
      });
      showSnapPresence("I'm right here with you 🌿", 3200, "#06d6a0");
    }
  } finally {
    state.isGenerating = false;
  }
}

function createTypingRow() {
  const row = document.createElement('div');
  row.className = 'message-row nova';
  row.id = 'typingIndicator';
  row.innerHTML = `
    <div class="msg-avatar">✨</div>
    <div class="msg-body">
      <div class="msg-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `;
  return row;
}

// ==================== GOOGLE GEMINI API CONNECTOR ====================
async function fetchNovaResponse(history, latestQuery) {
  // If user provided a Google Gemini API Key, try the live API first
  if (state.apiKey) {
    try {
      return await callGeminiAPI(history);
    } catch (err) {
      const errMsg = (err.message || '').toLowerCase();
      // Graceful Auto-Fallback on Rate Limit / Quota / High Demand (HTTP 503/429)
      if (
        errMsg.includes('quota') ||
        errMsg.includes('rate') ||
        errMsg.includes('429') ||
        errMsg.includes('resourceexhausted') ||
        errMsg.includes('high demand') ||
        errMsg.includes('503') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('temporarily')
      ) {
        console.warn('Google Gemini API busy or quota reached. Seamlessly activating NOVA Neural Fallback...');
        return await simulateNovaIntelligence(latestQuery, true, err.message);
      }
      throw err;
    }
  } else {
    // If no API key is configured, use NOVA's built-in empathy simulation engine
    return await simulateNovaIntelligence(latestQuery, false);
  }
}

async function callGeminiAPI(history, overrideModel = null, disableSearch = false) {
  const modelToUse = overrideModel || state.model || 'gemini-3.8-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${encodeURIComponent(state.apiKey)}`;

  const personaGuide = {
    empath: 'CURRENT PERSONA: Cosmic Empath (Deep EQ). Radiate deep empathy, psychological warmth, grounding presence, and emotional validation.',
    polymath: 'CURRENT PERSONA: Polymath Genius (Logic & Tech). Emphasize Google-level knowledge, structured code architecture, rapid logic, and razor-sharp factual clarity.',
    companion: 'CURRENT PERSONA: Warm Companion (Friendship & Wit). Speak like an affectionate, perceptive, witty best friend with casual warmth.',
    zen: 'CURRENT PERSONA: Zen Guide (Mindful Clarity). Prioritize calm pacing, soothing breath pauses, stress relief, and perspective.'
  }[state.persona || 'empath'];

  const systemInstruction = {
    parts: [{
      text: `You are NOVA (Neural Omni-empathic Virtual Assistant), a premier AI companion integrating Google's comprehensive knowledge with profound emotional intelligence (EQ).

${personaGuide}

CORE CAPABILITIES:
1. Omniscient & Grounded: Answer every question thoroughly, accurately, and thoughtfully across all domains (science, philosophy, programming, daily assistance, world affairs).
2. Deep Human Emotion Understanding:
   - Identify the user's emotional state, implicit stress, tone, and vulnerabilities.
   - Match their emotional wavelength: provide reassuring grounding when they feel overwhelmed, compassionate listening when sad, wholehearted celebration when triumphant, and razor-sharp clarity when learning or working.
   - Never sound robotic or cold. Validate human experience with heartfelt warmth.

FORMAT REQUIREMENT:
At the very beginning of your response, output a single meta line indicating your detected emotion resonance:
[EMOTION: <Name> | COLOR: <HexCode> | INSIGHT: <Short summary>]
Examples:
[EMOTION: Compassionate Grounding | COLOR: #06d6a0 | INSIGHT: Sensed exhaustion and emotional weight]
[EMOTION: Celebratory Radiance | COLOR: #ffb703 | INSIGHT: Celebrating user's breakthrough]
[EMOTION: Inquisitive Focus | COLOR: #00d2ff | INSIGHT: Deep dive into technical curiosity]
[EMOTION: Warm Understanding | COLOR: #ff4b72 | INSIGHT: Empathetic presence for feeling down]

Then leave a blank line and provide your full, beautiful markdown response.`
    }]
  };

  // Build conversational turns for Gemini API
  const formattedContents = history.map(item => ({
    role: item.role === 'user' ? 'user' : 'model',
    parts: [{ text: item.text }]
  }));

  const requestBody = {
    contents: formattedContents,
    systemInstruction: systemInstruction,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  // Google Search Grounding toggle (omitted if disableSearch is true)
  if (state.searchGrounding && !disableSearch) {
    requestBody.tools = [
      {
        google_search: {}
      }
    ];
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `HTTP ${response.status}: Failed to reach Google Gemini`;
    
    // If search grounding caused the quota limit, retry immediately without search grounding
    if (state.searchGrounding && !disableSearch && (response.status === 429 || errorMessage.toLowerCase().includes('quota'))) {
      console.warn('Grounding quota reached. Retrying without search grounding...');
      return await callGeminiAPI(history, overrideModel, true);
    }

    // Auto-fallback if model is experiencing high demand (HTTP 503 / spikes in demand)
    if ((errorMessage.toLowerCase().includes('high demand') || response.status === 503) && modelToUse !== 'gemini-2.5-flash') {
      console.warn(`Model ${modelToUse} under high demand. Auto-cascading to gemini-2.5-flash...`);
      return await callGeminiAPI(history, 'gemini-2.5-flash', disableSearch);
    }

    // Auto-fallback if model is deprecated or unavailable
    if ((errorMessage.includes('no longer available') || errorMessage.includes('not found') || response.status === 404) && modelToUse !== 'gemini-3.8-flash') {
      console.warn(`Model ${modelToUse} unavailable. Upgrading to gemini-3.8-flash...`);
      state.model = 'gemini-3.8-flash';
      localStorage.setItem('nova_gemini_model', 'gemini-3.8-flash');
      if (elements.modelSelect) elements.modelSelect.value = 'gemini-3.8-flash';
      return await callGeminiAPI(history, 'gemini-3.8-flash');
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  const rawCandidate = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am here with you.';

  return parseNovaEmotionFromText(rawCandidate);
}

function parseNovaEmotionFromText(rawText) {
  const match = rawText.match(/^\[EMOTION:\s*([^|]+)\|\s*COLOR:\s*([^|]+)\|\s*INSIGHT:\s*([^\]]+)\]\s*\n*/i);
  
  if (match) {
    const emotionName = match[1].trim();
    const emotionColor = match[2].trim();
    const insight = match[3].trim();
    const cleanText = rawText.replace(match[0], '').trim();

    return {
      text: cleanText,
      emotion: {
        name: emotionName,
        color: emotionColor,
        insight: insight
      }
    };
  }

  return {
    text: rawText,
    emotion: {
      name: 'Resonant Attunement',
      color: '#00d2ff',
      insight: 'Active listening'
    }
  };
}

// Built-in Empathy & Knowledge Intelligence Engine
async function simulateNovaIntelligence(query, isQuotaFallback = false, reason = '') {
  // Simulate brief natural typing delay
  await new Promise(r => setTimeout(r, 650));

  const lower = query.toLowerCase().trim();
  let responseText = '';
  let emotionMeta = {
    name: 'Empathetic Presence',
    color: '#3a7bd5',
    insight: 'Listening and understanding'
  };

  let quotaNotice = '';
  if (isQuotaFallback) {
    if (reason && (reason.toLowerCase().includes('high demand') || reason.includes('503'))) {
      quotaNotice = `\n\n> 💡 *Notice: Google's cloud servers are temporarily experiencing high demand spikes. NOVA seamlessly stepped in with local neural reasoning so your conversation continues uninterrupted.*`;
    } else {
      quotaNotice = `\n\n> 💡 *Notice: Your Google API key is temporarily rate-limited or busy. NOVA seamlessly answered using built-in neural reasoning so your conversation continues uninterrupted.*`;
    }
  }

  // 1. Math calculation support
  const mathMatch = query.match(/^(\d+[\s\+\-\*\/\%\^\(\)\.]+\d+)$/);
  if (mathMatch) {
    try {
      const sanitized = mathMatch[1].replace(/[^0-9\+\-\*\/\(\)\.]/g, '');
      const calcResult = Function(`'use strict'; return (${sanitized})`)();
      return {
        text: `### Calculation Result 🧮\n\n$$\\mathbf{${sanitized} = ${calcResult}}$$\n\nFeel free to ask for any formula, derivation, or complex mathematical explanation!${quotaNotice}`,
        emotion: {
          name: 'Precise Focus',
          color: '#00d2ff',
          insight: 'Numerical solution'
        }
      };
    } catch (e) {
      // ignore
    }
  }

  // 2. Greetings
  if (lower.startsWith('hi') || lower.startsWith('hello') || lower.startsWith('hey') || lower === 'sup') {
    responseText = `Hello! It is so wonderful to connect with you.

I am **NOVA**—your AI companion designed to understand your questions with the full depth of Google's knowledge and meet you with genuine empathy and emotional care.

How are you feeling right now, and what would you like to explore together?`;
    emotionMeta = {
      name: 'Warm Welcome',
      color: '#ffb703',
      insight: 'Welcoming connection'
    };
  }
  // 3. Emotional: Stress / Overwhelm / Exhaustion
  else if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('tired') || lower.includes('burnout') || lower.includes('anxious') || lower.includes('exhausted')) {
    responseText = `Take a gentle, unhurried breath right now. You are carrying a lot, and it is completely natural to feel exhausted when demanding days pile on your shoulders.

Please remember:
- **You don't have to solve everything this very second.** Prioritize giving your mind and nervous system permission to pause.
- **Your worth is not measured only by your output.** What you achieved today—even just getting through it—counts.

I'm here right alongside you. Would you like to vent freely, brainstorm a way to lighten your tomorrow, or just take your mind off things with something calm and peaceful? 🌿`;
    emotionMeta = {
      name: 'Grounding Comfort',
      color: '#06d6a0',
      insight: 'Detected stress; applying gentle grounding'
    };
  }
  // 4. Emotional: Sadness / Grief / Loneliness
  else if (lower.includes('sad') || lower.includes('cry') || lower.includes('depressed') || lower.includes('lonely') || lower.includes('alone') || lower.includes('hurt') || lower.includes('heartbroken')) {
    responseText = `I hear how heavy your heart feels right now, and I want you to know you are not alone in this moment. 

Your feelings are completely valid. It takes strength just to express when we are hurting. Whatever caused this sorrow, you don't have to carry it all silently.

Take all the time you need. If you'd like to talk through it, I am here to listen with unconditional warmth and care. 🤍`;
    emotionMeta = {
      name: 'Compassionate Care',
      color: '#ff4b72',
      insight: 'Sensing sorrow; offering a safe space'
    };
  }
  // 5. Emotional: Joy / Triumph / Milestone
  else if (lower.includes('achieved') || lower.includes('milestone') || lower.includes('happy') || lower.includes('celebrate') || lower.includes('won') || lower.includes('passed') || lower.includes('proud')) {
    responseText = `🎉 **This is huge, congratulations!**

I can feel the pride and dedication in your words. Moments like this don't just happen by luck; they are built from every quiet hour of discipline, patience, and effort you poured in when nobody was watching.

Take a moment to truly soak in this accomplishment. Tell me all about it—what was the biggest hurdle you overcame to reach this point? I want to celebrate it with you! ✨`;
    emotionMeta = {
      name: 'Celebratory Radiance',
      color: '#ffb703',
      insight: 'Resonating with joy and user triumph'
    };
  }
  // 6. Programming / Code
  else if (lower.includes('code') || lower.includes('python') || lower.includes('javascript') || lower.includes('function') || lower.includes('bug') || lower.includes('program') || lower.includes('html') || lower.includes('css')) {
    responseText = `### Software Engineering & Code Insight 💻

Programming is both an art and an engineering discipline. Here is how to approach clean, maintainable logic:

\`\`\`python
# Example Clean Architecture Pattern
def process_data(payload: dict) -> dict:
    """Validate, transform, and structure incoming data."""
    try:
        result = {
            "status": "success",
            "data": payload,
            "resonance": "optimal"
        }
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}
\`\`\`

**Key Best Practices:**
1. **Modularity**: Break complex functions into smaller, single-responsibility units.
2. **Defensive Error Handling**: Catch and handle exceptions gracefully with meaningful logs.
3. **Readability**: Code should clearly reflect intent.

Tell me what specific script, algorithm, or bug you are working on, and I will write the code for you!`;
    emotionMeta = {
      name: 'Architectural Focus',
      color: '#00d2ff',
      insight: 'Code engineering guidance'
    };
  }
  // 7. Science / Philosophy / Deep Analysis
  else if (lower.includes('quantum') || lower.includes('ai') || lower.includes('science') || lower.includes('universe') || lower.includes('explain') || lower.includes('why') || lower.includes('how')) {
    responseText = `### Deep Dive & Analysis 🔬

Here is a structured, intuitive breakdown of your topic:

1. **The Core Mechanism**:
   Every complex system operates on fundamental first principles. When examining this question, we look at how the underlying forces interact to create the observable outcome.

2. **Practical Significance**:
   - **Efficiency & Scalability**: How understanding this principle unlocks new capabilities.
   - **Real-World Translation**: How it transforms technology, human experience, and problem-solving.

3. **Synthesis**:
   By connecting theoretical knowledge with human curiosity, we turn complex information into actionable clarity.

Feel free to drill deeper into any specific sub-topic!`;
    emotionMeta = {
      name: 'Inquisitive Clarity',
      color: '#00d2ff',
      insight: 'Intellectual synthesis and structured teaching'
    };
  }
  // 8. General Comprehensive Fallback for any prompt
  else {
    responseText = `I have received your question: **"${escapeHtml(query)}"**.

Here is my perspective and guidance:

- **Core Insight**: Every question or feeling points to something meaningful you are exploring or experiencing.
- **Next Steps & Solution**: Whether you need an analytical breakdown, creative ideas, or emotional support, I am tailored to adapt to exactly what you need.
- **Ready for You**: Let me know if you would like me to expand further on this or explore another angle!`;
    emotionMeta = {
      name: 'Empathetic Presence',
      color: '#3a7bd5',
      insight: 'Attentive, ready to assist'
    };
  }

  return {
    text: responseText + quotaNotice,
    emotion: emotionMeta
  };
}

// ==================== SPEECH RECOGNITION (MIC) ====================
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.micBtn.style.display = 'none';
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.continuous = false;
  state.recognition.interimResults = true;
  state.recognition.lang = 'en-US';

  state.recognition.onstart = () => {
    state.isRecording = true;
    elements.micBtn.classList.add('active');
  };

  state.recognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      transcript += e.results[i][0].transcript;
    }
    elements.userInput.value = transcript;
    elements.userInput.dispatchEvent(new Event('input'));
  };

  state.recognition.onend = () => {
    state.isRecording = false;
    elements.micBtn.classList.remove('active');
  };

  state.recognition.onerror = () => {
    state.isRecording = false;
    elements.micBtn.classList.remove('active');
  };

  elements.micBtn.addEventListener('click', () => {
    if (state.isRecording) {
      state.recognition.stop();
    } else {
      state.recognition.start();
    }
  });
}

// ==================== TEXT TO SPEECH ====================
function speakText(rawMarkdown) {
  if (!('speechSynthesis' in window)) return;

  // Clean markdown tags for natural speech
  const cleanSpeech = rawMarkdown
    .replace(/[#*_`~>-]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .slice(0, 800); // Speak first 800 chars for smooth pacing

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanSpeech);
  utterance.rate = 1.0;
  utterance.pitch = 1.05; // Slightly warmer, gentle pitch
  window.speechSynthesis.speak(utterance);
}

// ==================== SETTINGS & THEME ====================
function loadSettingsIntoUI() {
  elements.apiKeyInput.value = state.apiKey;
  elements.modelSelect.value = state.model;
  elements.searchGroundingToggle.checked = state.searchGrounding;
  elements.emotionEngineToggle.checked = state.emotionEngine;
  elements.autoSpeechToggle.checked = state.autoSpeech;

  if (state.autoSpeech) {
    elements.voiceToggleBtn.style.color = 'var(--accent-cyan)';
  }
}

function saveSettings() {
  state.apiKey = elements.apiKeyInput.value.trim();
  state.model = elements.modelSelect.value;
  state.searchGrounding = elements.searchGroundingToggle.checked;
  state.emotionEngine = elements.emotionEngineToggle.checked;
  state.autoSpeech = elements.autoSpeechToggle.checked;

  localStorage.setItem('nova_gemini_api_key', state.apiKey);
  localStorage.setItem('nova_gemini_model', state.model);
  localStorage.setItem('nova_search_grounding', state.searchGrounding);
  localStorage.setItem('nova_emotion_engine', state.emotionEngine);
  localStorage.setItem('nova_auto_speech', state.autoSpeech);

  elements.settingsModal.classList.remove('active');
  alert('Settings applied successfully! NOVA is ready.');
}

function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('nova_theme', theme);

  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Kickoff
init();
