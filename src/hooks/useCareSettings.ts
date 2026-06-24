import { useState, useEffect } from 'react';
import { Language } from '../utils/translations';
import { getSetting, setSetting, getAllSettings } from '../utils/dbService';
import { initializeDatabase } from '../utils/database';

export interface AppSettings {
  language: Language;
  notificationsEnabled: boolean;
  petReminders: boolean;
  plantReminders: boolean;
  diaryReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderFrequency: 'realtime' | 'daily' | 'custom';
  theme: 'light' | 'dark' | 'system' | 'nature';
  aiEnabled: boolean;
  aiApiKey: string;
  petFeedingTime: string;
  plantWateringTime: string;
  dailyNotificationTime: string;
  diarySystemEnabled: boolean;
  autoSaveNotes: boolean;
  photoUploadsEnabled: boolean;
  autoCompressImages: boolean;
  defaultPlaceholdersEnabled: boolean;
  smartSuggestionsEnabled: boolean;
  healthScoringEnabled: boolean;
  monthlyReportEnabled: boolean;
  habitStreakTrackingEnabled: boolean;
  volume: number;
  successSoundEnabled: boolean;
  familyModeEnabled: boolean;
  householdMembers: string[];
  alarmSoundName: string;
  customAlarmSound?: string;
  voiceRecordingEnabled: boolean;
  voiceRecordings: { id: string; name: string; data: string; duration: number; createdAt: string }[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'tl',
  notificationsEnabled: true,
  petReminders: true,
  plantReminders: true,
  diaryReminders: true,
  soundEnabled: true,
  vibrationEnabled: true,
  reminderFrequency: 'realtime',
  theme: 'light',
  aiEnabled: !!import.meta.env.VITE_OPENAI_API_KEY,
  aiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  petFeedingTime: '08:00',
  plantWateringTime: '09:00',
  dailyNotificationTime: '08:00',
  diarySystemEnabled: true,
  autoSaveNotes: true,
  photoUploadsEnabled: true,
  autoCompressImages: true,
  defaultPlaceholdersEnabled: true,
  smartSuggestionsEnabled: true,
  healthScoringEnabled: true,
  monthlyReportEnabled: true,
  habitStreakTrackingEnabled: true,
  volume: 80,
  successSoundEnabled: true,
  familyModeEnabled: true,
  householdMembers: ['Ako', 'Nanay', 'Tatay', 'Ate', 'Kuya', 'Bunso'],
  alarmSoundName: 'chime',
  voiceRecordingEnabled: false,
  voiceRecordings: [],
};

export const BUILTIN_ALARM_SOUNDS = [
  { id: 'chime', name: 'Gentle Chime', nameTl: 'Mahinang Tunog' },
  { id: 'bell', name: 'Classic Bell', nameTl: 'Kampana' },
  { id: 'alarm', name: 'Wake Up Alarm', nameTl: 'Alarm Paggising' },
  { id: 'digital', name: 'Digital Beep', nameTl: 'Digital na Beep' },
  { id: 'gentle', name: 'Soft Melody', nameTl: 'Malambing na Tunog' },
  { id: 'rooster', name: 'Rooster Call', nameTl: 'Tilaok ng Tandang' },
  { id: 'birds', name: 'Birds Chirping', nameTl: 'Huni ng Ibon' },
  { id: 'morning', name: 'Morning Sunrise', nameTl: 'Buhangin sa Umaga' },
  { id: 'nature', name: 'Nature Flow', nameTl: 'Daloy ng Kalikasan' },
  { id: 'phone', name: 'Phone Ring', nameTl: 'Tunog ng Telepono' },
  { id: 'magic', name: 'Magic Sparkle', nameTl: 'Mahiwagang Sparkle' },
  { id: 'peaceful', name: 'Peaceful Zen', nameTl: 'Payapang Zen' },
  { id: 'energetic', name: 'Energetic Beat', nameTl: 'Enerhetik na Tunog' },
];

const SOUND_PATTERNS: Record<string, { freqs: number[]; type?: OscillatorType }> = {
  chime: { freqs: [523.25, 659.25, 783.99, 1046.50, 1318.51], type: 'sine' },
  bell: { freqs: [440, 880, 440, 880, 440, 880], type: 'sine' },
  alarm: { freqs: [880, 440, 880, 440, 880, 440, 880, 440], type: 'square' },
  digital: { freqs: [1200, 0, 1200, 0, 1200, 0, 1200], type: 'square' },
  gentle: { freqs: [261.63, 329.63, 392, 523.25, 659.25], type: 'sine' },
  rooster: { freqs: [330, 660, 990, 1320, 990, 660, 330], type: 'sawtooth' },
  birds: { freqs: [1760, 2093, 1760, 1318, 1760, 2093, 1760], type: 'sine' },
  morning: { freqs: [392, 523.25, 659.25, 783.99, 880, 1046.50], type: 'triangle' },
  nature: { freqs: [261.63, 293.66, 329.63, 392, 440, 523.25], type: 'sine' },
  phone: { freqs: [440, 440, 0, 440, 440, 0, 440, 440, 0], type: 'sine' },
  magic: { freqs: [523.25, 1046.50, 1567.98, 2093.00, 2637.02], type: 'triangle' },
  peaceful: { freqs: [196, 261.63, 329.63, 392, 523.25], type: 'sine' },
  energetic: { freqs: [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00], type: 'square' },
};

export function useCareSettings(onLangChange: (lang: Language) => void) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Start with default settings, will load from DB async
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from database first
        await initializeDatabase();
        const dbSettings = await getAllSettings();
        if (Object.keys(dbSettings).length > 0) {
          // Parse settings from database
          const parsed: Partial<AppSettings> = {};
          Object.keys(dbSettings).forEach(key => {
            try {
              (parsed as any)[key] = JSON.parse(dbSettings[key]);
            } catch {
              (parsed as any)[key] = dbSettings[key];
            }
          });
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (e) {
        console.error('Failed to load settings from database:', e);
        // Fallback to localStorage
        const saved = localStorage.getItem('care_system_settings');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          } catch (e) {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      // Save to database
      try {
        await initializeDatabase();
        Object.entries(settings).forEach(async ([key, value]) => {
          await setSetting(key, JSON.stringify(value));
        });
      } catch (e) {
        console.error('Failed to save settings to database:', e);
        // Fallback to localStorage
        localStorage.setItem('care_system_settings', JSON.stringify(settings));
      }
    };

    saveSettings();
    onLangChange(settings.language);
    applyTheme(settings.theme);
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system' | 'nature') => {
    const root = document.getElementById('phone-container') || document.body;
    if (!root) return;
    root.classList.remove('theme-light', 'theme-dark', 'theme-nature');
    if (theme === 'dark') {
      root.classList.add('theme-dark');
    } else if (theme === 'nature') {
      root.classList.add('theme-nature');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add('theme-light');
    }
  };

  const playAlarmSound = async (soundName?: string) => {
    const name = soundName || settings.alarmSoundName || 'chime';
    if (!settings.soundEnabled) return;

    try {
      if (name === 'custom' && settings.customAlarmSound) {
        const audio = new Audio(settings.customAlarmSound);
        audio.volume = settings.volume / 100;
        await audio.play();
        return;
      }

      const pattern = SOUND_PATTERNS[name];
      if (!pattern) return;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const vol = settings.volume / 100;
      gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);

      if (pattern.type) osc.type = pattern.type;
      pattern.freqs.forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      });
      osc.start();
      osc.stop(ctx.currentTime + pattern.freqs.length * 0.12 + 0.1);
    } catch (e) {
      console.warn('playAlarmSound failed', e);
    }
  };

  const triggerSound = (type: 'success' | 'alert') => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const vol = settings.volume / 100;
      gain.gain.setValueAtTime(vol * 0.1, ctx.currentTime);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.setValueAtTime(110, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }

      if (settings.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(type === 'success' ? [100, 50, 100] : [200, 100, 200]);
      }
    } catch (e) {
      console.warn('triggerSound failed', e);
    }
  };

  return {
    settings,
    updateSetting,
    triggerSound,
    playAlarmSound,
    applyTheme,
  };
}
