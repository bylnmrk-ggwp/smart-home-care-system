import React, { useState, useRef } from 'react';
import { AppSettings } from '../hooks/useCareSettings';
import { translate, Language } from '../utils/translations';
import { getPinStatus, clearPin, setPin } from './PINLock';
import { 
  Globe, Bell, Shield, Palette, Clock, HardDrive, 
  BookOpen, Image as ImageIcon, Sparkles, Volume2, 
  Users, Info, RefreshCw, Download, Upload, AlertTriangle, Check
} from 'lucide-react';

interface SettingsSectionProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  triggerSound: (type: 'success' | 'alert') => void;
  playAlarmSound: (soundName?: string) => Promise<void>;
  petsCount: number;
  plantsCount: number;
  schedulesCount: number;
  diaryCount: number;
  logsCount: number;
  onResetAllData: () => void;
  onResetPetsAndPlants: () => void;
  onRestoreData: (imported: any) => boolean;
  onOpenEmergency: () => void;
}

export function SettingsSection({
  lang,
  onLangChange,
  settings,
  updateSetting,
  triggerSound,
  playAlarmSound,
  petsCount,
  plantsCount,
  schedulesCount,
  diaryCount,
  logsCount,
  onResetAllData,
  onResetPetsAndPlants,
  onRestoreData,
  onOpenEmergency,
}: SettingsSectionProps) {
  const [newMember, setNewMember] = useState('');
  const [resetConfirmType, setResetConfirmType] = useState<'all' | 'pets' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    triggerSound('success');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    triggerSound('alert');
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handleAddMember = () => {
    if (!newMember.trim()) return;
    if (settings.householdMembers.includes(newMember.trim())) {
      showError(lang === 'tl' ? 'Nasa listahan na ang pangalang ito!' : 'This name is already in the list!');
      return;
    }
    const updated = [...settings.householdMembers, newMember.trim()];
    updateSetting('householdMembers', updated);
    setNewMember('');
    showSuccess(lang === 'tl' ? 'Idinagdag ang miyembro!' : 'Member added successfully!');
  };

  const handleRemoveMember = (name: string) => {
    const updated = settings.householdMembers.filter(m => m !== name);
    updateSetting('householdMembers', updated);
    showSuccess(lang === 'tl' ? 'Tinanggal ang miyembro!' : 'Member removed successfully!');
  };

  // 📥 Backup / Export JSON
  const handleBackupData = () => {
    try {
      const backupObj = {
        care_system_pets: localStorage.getItem('care_system_pets'),
        care_system_plants: localStorage.getItem('care_system_plants'),
        care_system_schedules: localStorage.getItem('care_system_schedules'),
        care_system_diary: localStorage.getItem('care_system_diary'),
        care_system_logs: localStorage.getItem('care_system_logs'),
        care_system_settings: localStorage.getItem('care_system_settings'),
        export_meta: {
          app: 'Smart Home Care System',
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `smart_home_care_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showSuccess(lang === 'tl' ? 'Matagumpay na na-download ang backup file!' : 'Backup file downloaded successfully!');
    } catch (e) {
      showError(lang === 'tl' ? 'Nagkaproblema sa paggawa ng backup!' : 'Failed to create backup!');
    }
  };

  // 📤 Restore / Import JSON
  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.care_system_pets && !parsed.care_system_plants) {
          showError(lang === 'tl' ? 'Maling format ng backup file!' : 'Invalid backup file format!');
          return;
        }

        const success = onRestoreData(parsed);
        if (success) {
          showSuccess(lang === 'tl' ? 'Matagumpay na naibalik ang mga data!' : 'Data restored successfully!');
        } else {
          showError(lang === 'tl' ? 'Hindi ma-restore ang data!' : 'Failed to restore data!');
        }
      } catch (err) {
        showError(lang === 'tl' ? 'Nabigong basahin ang JSON file!' : 'Failed to read JSON file!');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    if (resetConfirmType === 'all') {
      onResetAllData();
      showSuccess(lang === 'tl' ? 'Na-reset na ang lahat ng data!' : 'All data reset successfully!');
    } else if (resetConfirmType === 'pets') {
      onResetPetsAndPlants();
      showSuccess(lang === 'tl' ? 'Na-reset ang mga halaman at hayop!' : 'Pets and plants reset successfully!');
    }
    setResetConfirmType(null);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Visual Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-5 shadow-sm">
        <h2 className="font-display font-black text-lg tracking-tight">
          ⚙️ {lang === 'tl' ? 'Mga Setting' : 'Application Settings'}
        </h2>
        <p className="text-sm text-indigo-100 mt-1 leading-normal">
          {lang === 'tl' 
            ? 'I-personalize ang gawi ng iyong app, paalala, wika, at pamahalaan ang lokal na data.' 
            : 'Customize app behavior, notifications, language, themes, and manage offline data.'}
        </p>
      </div>

      {/* Alert toast inside container */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-pulse">
          <span className="p-1 bg-emerald-500 text-white rounded-full text-xs">✓</span>
          <span className="flex-1">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-pulse">
          <span className="p-1 bg-rose-500 text-white rounded-full text-xs">✕</span>
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* 🇵🇭 1. LANGUAGE SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">🇵🇭</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Wika ng Sistema' : 'System Language'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              updateSetting('language', 'tl');
              onLangChange('tl');
            }}
            className={`p-3 rounded-2xl border transition text-left cursor-pointer font-bold flex flex-col justify-between h-20 ${
              settings.language === 'tl'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="text-xl">🇵🇭</span>
            <div>
              <span className="block font-black">Filipino</span>
              <span className={`text-xs block ${settings.language === 'tl' ? 'text-indigo-200' : 'text-slate-400'}`}>Default (Tagalog)</span>
            </div>
          </button>

          <button
            onClick={() => {
              updateSetting('language', 'en');
              onLangChange('en');
            }}
            className={`p-3 rounded-2xl border transition text-left cursor-pointer font-bold flex flex-col justify-between h-20 ${
              settings.language === 'en'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="text-xl">🇬🇧</span>
            <div>
              <span className="block font-black">English</span>
              <span className={`text-xs block ${settings.language === 'en' ? 'text-indigo-200' : 'text-slate-400'}`}>Bilingual Support</span>
            </div>
          </button>
        </div>
      </div>

      {/* 🚨 EMERGENCY FIRST AID */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs">🚨</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Saklolo / Unang Lunas' : 'Emergency First Aid'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {lang === 'tl'
            ? 'Mabilisang gabay para sa mga emergency ng iyong alaga o halaman.'
            : 'Quick-access first aid manual for pets and plants.'}
        </p>
        <button
          onClick={onOpenEmergency}
          className="w-full p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border border-rose-100 transition cursor-pointer"
        >
          <span>🚨</span>
          <span>{lang === 'tl' ? 'Buksan ang Saklolo' : 'Open Emergency Guide'}</span>
        </button>
      </div>

      {/* 🔒 PIN LOCK SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">🔒</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Seguridad ng App' : 'App Security'}
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-600">
              {lang === 'tl' ? 'Lock ng PIN (6-digit)' : '6-digit PIN Lock'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {getPinStatus().hasPin
                ? (lang === 'tl' ? 'Naka-set ang PIN' : 'PIN is set')
                : (lang === 'tl' ? 'Wala pang PIN' : 'No PIN configured')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={getPinStatus().hasPin}
              onChange={(e) => {
                if (e.target.checked) {
                  const newPin = prompt(lang === 'tl' ? 'Maglagay ng 6-digit PIN:' : 'Enter a 6-digit PIN:');
                  if (newPin && /^\d{6}$/.test(newPin)) {
                    const confirmPin = prompt(lang === 'tl' ? 'Kumpirmahin ang PIN:' : 'Confirm PIN:');
                    if (confirmPin === newPin) {
                      setPin(newPin);
                      showSuccess(lang === 'tl' ? 'Naka-set na ang PIN!' : 'PIN has been set!');
                    } else {
                      showError(lang === 'tl' ? 'Hindi tugma ang PIN!' : 'PIN does not match!');
                    }
                  } else if (newPin) {
                    showError(lang === 'tl' ? 'Dapat 6 na numero ang PIN!' : 'PIN must be 6 digits!');
                  }
                } else {
                  if (confirm(lang === 'tl' ? 'Sigurado ka bang gusto mong tanggalin ang PIN lock?' : 'Are you sure you want to remove the PIN lock?')) {
                    clearPin();
                    showSuccess(lang === 'tl' ? 'Tinanggal ang PIN!' : 'PIN removed!');
                  }
                }
              }}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* 🌙 3. THEME SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs">🎨</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Tema ng Anyo' : 'App Appearance Theme'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          {[
            { id: 'light', emoji: '☀️', label_tl: 'Light Mode', label_en: 'Light Mode' },
            { id: 'dark', emoji: '🌙', label_tl: 'Dark Mode', label_en: 'Dark Mode' },
            { id: 'system', emoji: '⚙️', label_tl: 'System Default', label_en: 'System Default' },
            { id: 'nature', emoji: '🌿', label_tl: 'Nature Green', label_en: 'Nature Green' },
          ].map(themeItem => (
            <button
              key={themeItem.id}
              onClick={() => updateSetting('theme', themeItem.id as any)}
              className={`p-2.5 rounded-2xl border transition-all text-left flex items-center gap-2.5 cursor-pointer ${
                settings.theme === themeItem.id
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className="text-sm shrink-0">{themeItem.emoji}</span>
              <span className="text-xs truncate">{lang === 'tl' ? themeItem.label_tl : themeItem.label_en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🔔 2. NOTIFICATION REMINDERS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50 justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs">🔔</span>
            <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
              {lang === 'tl' ? 'Mga Alerto at Paalala' : 'Reminders & Notifications'}
            </h3>
          </div>
          {/* Master Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {settings.notificationsEnabled ? (
          <div className="space-y-3.5 text-xs font-semibold">
            {/* Options */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{lang === 'tl' ? 'Paalala sa Alagang Hayop' : 'Pet Care Reminders'}</span>
              <input
                type="checkbox"
                checked={settings.petReminders}
                onChange={(e) => updateSetting('petReminders', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <span className="text-slate-600">{lang === 'tl' ? 'Paalala sa mga Halaman' : 'Plant Care Reminders'}</span>
              <input
                type="checkbox"
                checked={settings.plantReminders}
                onChange={(e) => updateSetting('plantReminders', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <span className="text-slate-600">{lang === 'tl' ? 'Paalala sa Talaarawan' : 'Diary Note Reminders'}</span>
              <input
                type="checkbox"
                checked={settings.diaryReminders}
                onChange={(e) => updateSetting('diaryReminders', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <span className="text-slate-600">{lang === 'tl' ? 'Tugtog ng Abiso (Sound ON)' : 'Notification Sound FX'}</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <span className="text-slate-600">{lang === 'tl' ? 'Pangangatog (Vibrate ON)' : 'Reminders Vibration'}</span>
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => updateSetting('vibrationEnabled', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            {/* Frequency options */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
                {lang === 'tl' ? 'Dalas ng Paalala' : 'Notification Frequency'}
              </span>
              <div className="grid grid-cols-3 gap-1 text-xs font-bold">
                {[
                  { id: 'realtime', label: lang === 'tl' ? 'Real-Time' : 'Real-time' },
                  { id: 'daily', label: lang === 'tl' ? 'Buod Lamang' : 'Daily Summary' },
                  { id: 'custom', label: lang === 'tl' ? 'Espesyal' : 'Custom Schedule' },
                ].map(freq => (
                  <button
                    key={freq.id}
                    onClick={() => updateSetting('reminderFrequency', freq.id as any)}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      settings.reminderFrequency === freq.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-center leading-normal">
            ⚠️ {lang === 'tl' ? 'Naka-patay ang lahat ng alerto at paalala.' : 'All system reminders and push banners are turned off.'}
          </p>
        )}
      </div>

      {/* ⏰ 4. REMINDER TIME SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs">⏰</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Oras ng mga Paalala' : 'Preferred Notification Times'}
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-600">🍖 {lang === 'tl' ? 'Pagpapakain sa Alaga (Umaga / Gabi)' : 'Pet Feeding reminder time'}</span>
            <input
              type="time"
              value={settings.petFeedingTime}
              onChange={(e) => updateSetting('petFeedingTime', e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold"
            />
          </div>

          <div className="flex justify-between items-center border-t border-slate-50 pt-3">
            <span className="font-semibold text-slate-600">💧 {lang === 'tl' ? 'Pagdidilig ng Halaman' : 'Plant Watering reminder time'}</span>
            <input
              type="time"
              value={settings.plantWateringTime}
              onChange={(e) => updateSetting('plantWateringTime', e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold"
            />
          </div>

          <div className="flex justify-between items-center border-t border-slate-50 pt-3">
            <span className="font-semibold text-slate-600">📊 {lang === 'tl' ? 'Araw-araw na Buod (8:00 AM summary)' : 'Daily Notification Summary time'}</span>
            <input
              type="time"
              value={settings.dailyNotificationTime}
              onChange={(e) => updateSetting('dailyNotificationTime', e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* 📝 6. DIARY SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50 justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg text-xs">📝</span>
            <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
              {lang === 'tl' ? 'Talaarawan ng Paglaki' : 'Growth Diary Settings'}
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.diarySystemEnabled}
              onChange={(e) => updateSetting('diarySystemEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {settings.diarySystemEnabled ? (
          <div className="space-y-3 text-xs font-semibold">
            <div className="p-2.5 bg-sky-50 text-sky-800 text-xs rounded-xl leading-normal border border-sky-100 flex items-start gap-2">
              <span className="text-xs">💡</span>
              <span>
                {lang === 'tl' 
                  ? 'Paalala: “Gumawa ng entry ngayon para sa talaan.”' 
                  : 'Diary active notification: "Write a diary entry today to record progress!"'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <span className="text-slate-600">{lang === 'tl' ? 'Awtomatikong I-save ang Tala' : 'Auto-save note drafts ON/OFF'}</span>
              <input
                type="checkbox"
                checked={settings.autoSaveNotes}
                onChange={(e) => updateSetting('autoSaveNotes', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center leading-normal">
            {lang === 'tl' ? 'Naka-disable ang tampok na Talaarawan.' : 'The personal growth diary module is disabled.'}
          </p>
        )}
      </div>

      {/* 📷 7. PHOTO SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs">📷</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Mga Setting ng Larawan' : 'Photo & Capture Settings'}
          </h3>
        </div>

        <div className="space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">{lang === 'tl' ? 'Payagan ang Pag-upload ng Larawan' : 'Enable image uploads'}</span>
            <input
              type="checkbox"
              checked={settings.photoUploadsEnabled}
              onChange={(e) => updateSetting('photoUploadsEnabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="text-slate-600">{lang === 'tl' ? 'Awtomatikong I-compress (I-save ang space)' : 'Auto compress uploads (save local memory)'}</span>
            <input
              type="checkbox"
              disabled={!settings.photoUploadsEnabled}
              checked={settings.autoCompressImages}
              onChange={(e) => updateSetting('autoCompressImages', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded disabled:opacity-40"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="text-slate-600">{lang === 'tl' ? 'Gumamit ng Placeholder na Larawan' : 'Default placeholder avatars ON/OFF'}</span>
            <input
              type="checkbox"
              checked={settings.defaultPlaceholdersEnabled}
              onChange={(e) => updateSetting('defaultPlaceholdersEnabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* 🧠 8. SMART FEATURES TOGGLE */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">🧠</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Matalinong Gabay at Pagsusuri' : 'Smart Assistant & Insights'}
          </h3>
        </div>

        <div className="space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">{lang === 'tl' ? 'Matalinong Suhestiyon' : 'Smart Assistant care suggestions'}</span>
            <input
              type="checkbox"
              checked={settings.smartSuggestionsEnabled}
              onChange={(e) => updateSetting('smartSuggestionsEnabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="text-slate-600">{lang === 'tl' ? 'Sistema ng Marka sa Kalusugan (Health Scoring)' : 'Calculate companion health score'}</span>
            <input
              type="checkbox"
              checked={settings.healthScoringEnabled}
              onChange={(e) => updateSetting('healthScoringEnabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="text-slate-600">{lang === 'tl' ? 'Bulanang Ulat (Monthly summary)' : 'Enable monthly analytics summaries'}</span>
            <input
              type="checkbox"
              checked={settings.monthlyReportEnabled}
              onChange={(e) => updateSetting('monthlyReportEnabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
            <span className="text-slate-600">{lang === 'tl' ? 'Subaybayan ang Habit Streak' : 'Track routine habit streaks'}</span>
            <input
              type="checkbox"
              checked={settings.habitStreakTrackingEnabled}
              onChange={(e) => updateSetting('habitStreakTrackingEnabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* 🤖 9. AI ASSISTANT SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50 justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs">🤖</span>
            <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
              {lang === 'tl' ? 'AI Katulong sa Pag-aalaga' : 'AI Care Assistant'}
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.aiEnabled}
              onChange={(e) => updateSetting('aiEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {translate('aiAssistantDesc', lang)}
        </p>

        {settings.aiEnabled && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                {translate('aiApiKey', lang)}
              </label>
              <input
                type="password"
                value={settings.aiApiKey}
                onChange={(e) => updateSetting('aiApiKey', e.target.value)}
                placeholder={translate('aiApiKeyPlaceholder', lang)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                {translate('aiApiKeyDesc', lang)}
              </p>
              {/* Show env var badge if key is from environment */}
              {settings.aiApiKey && !settings.aiApiKey.startsWith('**') && (
                <p className="text-[8px] text-emerald-600 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  {lang === 'tl'
                    ? 'Naka-configure mula sa environment'
                    : 'Pre-configured from environment'}
                </p>
              )}
            </div>

            <div className="p-2.5 bg-indigo-50 text-indigo-800 text-xs rounded-xl border border-indigo-100 leading-normal flex items-start gap-2">
              <span className="text-xs shrink-0">💡</span>
              <span>
                {lang === 'tl'
                  ? 'Kapag naka-on ito, may lalabas na floating AI button sa Home screen. Makakapagtanong ka tungkol sa pag-aalaga ng hayop o halaman gamit ang Tagalog o English.'
                  : 'When enabled, a floating AI button will appear on the Home screen. You can ask questions about pet or plant care in Tagalog or English.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 🔊 11. SOUND SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs">🔊</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Mga Tunog at Abiso' : 'Audio Sound Settings'}
          </h3>
        </div>

        <div className="space-y-3.5 text-xs font-semibold">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">{lang === 'tl' ? 'Tunog kapag nakatapos ng Gawain' : 'Chime on task completion'}</span>
            <input
              type="checkbox"
              checked={settings.successSoundEnabled}
              onChange={(e) => updateSetting('successSoundEnabled', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
            />
          </div>

          <div className="space-y-1.5 border-t border-slate-50 pt-3">
            <div className="flex justify-between text-slate-600 text-xs font-semibold">
              <span>{lang === 'tl' ? 'Lakas ng Tunog' : 'System Alert Volume'}</span>
              <span className="font-mono text-indigo-600 font-bold">{settings.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Alarm Sound Selection */}
          <div className="space-y-2 border-t border-slate-50 pt-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
              {lang === 'tl' ? 'Tunog ng Alarm' : 'Task Alarm Sound'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'chime', label: lang === 'tl' ? 'Mahinang Tunog' : 'Gentle Chime' },
                { id: 'bell', label: lang === 'tl' ? 'Kampana' : 'Classic Bell' },
                { id: 'alarm', label: lang === 'tl' ? 'Alarm Paggising' : 'Wake Up Alarm' },
                { id: 'digital', label: lang === 'tl' ? 'Digital Beep' : 'Digital Beep' },
                { id: 'gentle', label: lang === 'tl' ? 'Malambing' : 'Soft Melody' },
                { id: 'rooster', label: lang === 'tl' ? 'Tandang' : 'Rooster Call' },
                { id: 'birds', label: lang === 'tl' ? 'Ibon' : 'Birds Chirping' },
                { id: 'morning', label: lang === 'tl' ? 'Umaga' : 'Morning Sunrise' },
                { id: 'nature', label: lang === 'tl' ? 'Kalikasan' : 'Nature Flow' },
                { id: 'phone', label: lang === 'tl' ? 'Telepono' : 'Phone Ring' },
                { id: 'magic', label: lang === 'tl' ? 'Magic' : 'Magic Sparkle' },
                { id: 'peaceful', label: lang === 'tl' ? 'Zen' : 'Peaceful Zen' },
                { id: 'energetic', label: lang === 'tl' ? 'Enerhetik' : 'Energetic Beat' },
              ].map(sound => (
                <button
                  key={sound.id}
                  onClick={() => {
                    updateSetting('alarmSoundName', sound.id);
                    updateSetting('customAlarmSound', undefined);
                    playAlarmSound(sound.id);
                  }}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                    settings.alarmSoundName === sound.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            {/* Custom Sound Upload */}
            <div className="pt-2">
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">
                {lang === 'tl' ? 'O mag-upload ng sariling tunog:' : 'Or upload custom sound:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        updateSetting('customAlarmSound', dataUrl);
                        updateSetting('alarmSoundName', 'custom');
                        showSuccess(lang === 'tl' ? 'Na-upload ang custom tunog!' : 'Custom sound uploaded!');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="flex-1 text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {settings.customAlarmSound && (
                  <button
                    onClick={() => {
                      updateSetting('customAlarmSound', undefined);
                      updateSetting('alarmSoundName', 'chime');
                      showSuccess(lang === 'tl' ? 'Tinanggal ang custom tunog' : 'Custom sound removed');
                    }}
                    className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {lang === 'tl' ? 'Tanggalin' : 'Remove'}
                  </button>
                )}
              </div>
              {settings.customAlarmSound && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                  {lang === 'tl' ? 'Custom tunog ang aktibo' : 'Custom sound is active'}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => triggerSound('success')}
            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl font-bold text-xs tracking-wide uppercase transition cursor-pointer"
          >
            🎵 {lang === 'tl' ? 'Subukan ang Tunog' : 'Test Sound Effect'}
          </button>
        </div>
      </div>

      {/* 👨👩👧 10. FAMILY / HOUSEHOLD MODE SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50 justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs">👥</span>
            <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
              {lang === 'tl' ? 'Tagapangalaga ng Tahanan' : 'Household & Family Members'}
            </h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.familyModeEnabled}
              onChange={(e) => updateSetting('familyModeEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {settings.familyModeEnabled ? (
          <div className="space-y-4 text-xs">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 leading-normal">
              💡 <strong>{lang === 'tl' ? 'Naka-atas Kay' : 'Assigned Caregiver Mode'}:</strong> {lang === 'tl' ? 'Pinapayagan ang pamamahagi ng gawain sa pamilya nang walang login.' : 'Allows task assignment to members without any authorization account required.'}
            </div>

            {/* Household Member Lists */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
                {lang === 'tl' ? 'Listahan ng mga Tagapangalaga' : 'List of Caregivers'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {settings.householdMembers.map(member => (
                  <span 
                    key={member}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs border border-slate-200"
                  >
                    {member}
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="text-slate-400 hover:text-rose-500 font-black cursor-pointer ml-0.5 text-[8.5px]"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Add member input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={lang === 'tl' ? 'Pangalan ng Miyembro...' : 'Caregiver name...'}
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <button
                onClick={handleAddMember}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shrink-0"
              >
                + {lang === 'tl' ? 'Idagdag' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center leading-normal">
            {lang === 'tl' ? 'Naka-disable ang Household Mode.' : 'Household member features are disabled.'}
          </p>
        )}
      </div>

      {/* 📊 5. DATA & STORAGE SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">🗄️</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Pamamahala ng Offline Data' : 'Storage & Offline Database'}
          </h3>
        </div>

        {/* Current status info */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold text-slate-500">
          <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
            <span className="text-slate-400 text-[8.5px] block uppercase">{lang === 'tl' ? 'MGA COMPANION' : 'COMPANIONS'}</span>
            <span className="text-slate-800 font-black text-sm block mt-0.5">{petsCount + plantsCount}</span>
          </div>
          <div className="bg-slate-50 p-2 border border-slate-100 rounded-xl">
            <span className="text-slate-400 text-[8.5px] block uppercase">{lang === 'tl' ? 'MGA GAWAIN' : 'CARE CHORES'}</span>
            <span className="text-slate-800 font-black text-sm block mt-0.5">{schedulesCount}</span>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleBackupData}
            className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border border-indigo-100 transition cursor-pointer"
          >
            <Download size={14} />
            <span>{lang === 'tl' ? 'I-backup ang Data (Export File)' : 'Backup Local Data (Export JSON)'}</span>
          </button>

          <button
            onClick={handleRestoreClick}
            className="w-full p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border border-teal-100 transition cursor-pointer"
          >
            <Upload size={14} />
            <span>{lang === 'tl' ? 'I-restore ang Data (Import File)' : 'Restore Saved Data (Import JSON)'}</span>
          </button>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <div className="border-t border-slate-50 pt-3 space-y-2">
            <button
              onClick={() => {
                setResetConfirmType('pets');
                triggerSound('alert');
              }}
              className="w-full p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border border-orange-100 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>{lang === 'tl' ? 'I-reset ang mga Halaman at Hayop' : 'Reset Pets and Plants Only'}</span>
            </button>

            <button
              onClick={() => {
                setResetConfirmType('all');
                triggerSound('alert');
              }}
              className="w-full p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border border-rose-100 transition cursor-pointer"
            >
              <AlertTriangle size={14} />
              <span>{lang === 'tl' ? 'Burahin Lahat ng Data at Isara' : 'Wipe All Local Storage Cache'}</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal overlay for safety */}
        {resetConfirmType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setResetConfirmType(null)} />
            <div className="bg-white rounded-[32px] p-5 w-full max-w-sm relative z-50 border border-slate-150 shadow-2xl text-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertTriangle size={20} className="shrink-0" />
                <h4 className="font-display font-black text-xs uppercase tracking-wider">
                  {lang === 'tl' ? 'Kumpirmahin ang Pagbura!' : 'Confirm System Wipe!'}
                </h4>
              </div>
              
              <p className="text-xs text-slate-600 leading-normal">
                {resetConfirmType === 'all'
                  ? (lang === 'tl' 
                     ? 'Sigurado ka bang gusto mong burahin lahat ng data, ulat, history, at i-reset ang app settings sa default?' 
                     : 'Are you absolutely sure you want to erase all pets, plants, notes, logs, and reset settings to standard defaults?')
                  : (lang === 'tl'
                     ? 'Sigurado ka bang gusto mong burahin ang lahat ng nakatalang hayop, halaman, at iskedyul? Maiiwan ang mga custom settings mo.'
                     : 'Are you sure you want to reset and clear all registered pets, plants, and their logs? Your custom preferences will remain untouched.')
                }
              </p>

              <div className="flex gap-2 text-xs font-bold pt-1">
                <button
                  onClick={() => setResetConfirmType(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  {lang === 'tl' ? 'I-cancel' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer"
                >
                  {lang === 'tl' ? 'Oo, Burahin' : 'Yes, Delete All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ℹ️ 11. ABOUT APP SECTION */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/80">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">ℹ️</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Tungkol sa Kalingang Tahanan' : 'About Kalingang Tahanan'}
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between font-semibold">
            <span className="text-slate-400">{lang === 'tl' ? 'Pangalan ng App:' : 'App Name:'}</span>
            <span className="text-slate-700 font-bold">Kalingang Tahanan (Smart Home Care)</span>
          </div>

          <div className="flex justify-between border-t border-slate-200/60 pt-2 font-semibold">
            <span className="text-slate-400">{lang === 'tl' ? 'Bersyon:' : 'App Version:'}</span>
            <span className="text-slate-700 font-mono font-bold">1.2.0-Production</span>
          </div>

          <div className="flex justify-between border-t border-slate-200/60 pt-2 font-semibold">
            <span className="text-slate-400">{lang === 'tl' ? 'Developer:' : 'Developer Info:'}</span>
            <span className="text-slate-700 font-bold">Shinderu IT Girl</span>
          </div>

          <p className="text-xs text-slate-500 italic leading-relaxed pt-2 border-t border-slate-200/60 text-center">
            &ldquo;{lang === 'tl' 
              ? 'Isang offline-first na matalinong app para sa masusing pag-aalaga ng mga halaman at alagang hayop.' 
              : 'An offline-first smart assistant application designed to guide and track household pet diets and healthy plant hydration.'}&rdquo;
          </p>
        </div>
      </div>

    </div>
  );
}
