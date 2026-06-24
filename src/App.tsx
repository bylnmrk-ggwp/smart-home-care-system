/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useCareSystem } from './hooks/useCareSystem';
import { useCareSettings } from './hooks/useCareSettings';
import { Dashboard } from './components/Dashboard';
import { PetSection } from './components/PetSection';
import { PlantSection } from './components/PlantSection';
import { LogsSection } from './components/LogsSection';
import { NotesSection } from './components/NotesSection';
import { LibrarySection } from './components/LibrarySection';
import { SettingsSection } from './components/SettingsSection';
import { TasksSection } from './components/TasksSection';
import { ArchiveSection } from './components/ArchiveSection';
import { AchievementsSection } from './components/AchievementsSection';
import { PetDialog, PlantDialog, ScheduleDialog, DiaryDialog } from './components/Dialogs';
import { EmergencyDialog } from './components/EmergencyDialog';
import { AIAssistant } from './components/AIAssistant';
import { PINLock, clearPin } from './components/PINLock';
import { Home, Heart, Leaf, ClipboardList, BookOpen, Book, Menu, X, Settings, Sparkles, CheckSquare, Archive, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translate } from './utils/translations';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'pets' | 'plants' | 'logs' | 'diary' | 'library' | 'settings' | 'ai' | 'tasks' | 'archive' | 'achievements'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('care_system_lang');
    return (saved as Language) || 'tl';
  });

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('care_system_lang', newLang);
  };

  // Dialog open triggers
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<string | null>(null);

  // Pre-selected fields when adding a task/schedule from detail profiles
  const [preselectedEntityId, setPreselectedEntityId] = useState<string | undefined>(undefined);
  const [preselectedEntityType, setPreselectedEntityType] = useState<'pet' | 'plant' | undefined>(undefined);

  // Load custom care system state & methods
  const care = useCareSystem();
  
  // Load settings configuration
  const careSettings = useCareSettings((newLang) => changeLang(newLang));

  // Alarm checker for task reminders
  useEffect(() => {
    const checkedTasks = new Set<string>();

    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      care.activeSchedules.forEach(task => {
        if (!task.reminderTime || checkedTasks.has(task.id)) return;
        if (task.reminderTime === currentTime && task.status !== 'completed') {
          checkedTasks.add(task.id);

          // Use the selected alarm sound from settings
          careSettings.playAlarmSound();

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📋 Task Reminder', {
              body: `"${task.name}" for ${task.entityName} is due now!`,
              silent: true,
            });
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 30000);
    checkAlarms();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [care.activeSchedules, careSettings]);

  const handleOpenAddTask = (entityId?: string, entityType?: 'pet' | 'plant') => {
    setPreselectedEntityId(entityId);
    setPreselectedEntityType(entityType);
    setEditScheduleId(null);
    setIsAddTaskOpen(true);
  };

  const handleOpenEditTask = (scheduleId: string) => {
    setEditScheduleId(scheduleId);
    setPreselectedEntityId(undefined);
    setPreselectedEntityType(undefined);
    setIsAddTaskOpen(true);
  };

  const handleOpenAddNote = (entityId?: string, entityType?: 'pet' | 'plant') => {
    setPreselectedEntityId(entityId);
    setPreselectedEntityType(entityType);
    setIsAddNoteOpen(true);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            lang={lang}
            pets={care.pets}
            plants={care.plants}
            schedules={care.schedules}
            completeTask={care.completeTask}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddPet={() => setIsAddPetOpen(true)}
            onOpenAddPlant={() => setIsAddPlantOpen(true)}
            onOpenAddTask={() => handleOpenAddTask()}
            onOpenEditTask={(id) => handleOpenEditTask(id)}
            onOpenAddNote={() => handleOpenAddNote()}
            settings={careSettings.settings}
          />
        );
      case 'pets':
        return (
          <PetSection
            lang={lang}
            pets={care.pets}
            schedules={care.schedules}
            diary={care.diary}
            logs={care.logs}
            addPet={care.addPet}
            updatePet={care.updatePet}
            deletePet={care.deletePet}
            addSchedule={care.addSchedule}
            deleteSchedule={care.deleteSchedule}
            addDiaryEntry={care.addDiaryEntry}
            deleteDiaryEntry={care.deleteDiaryEntry}
            addPhotoToTimeline={care.addPhotoToTimeline}
            deletePhotoFromTimeline={care.deletePhotoFromTimeline}
            updatePhotoInTimeline={care.updatePhotoInTimeline}
            onOpenAddPet={() => setIsAddPetOpen(true)}
            onOpenAddTask={(id, type) => handleOpenAddTask(id, type)}
            onOpenEditTask={(id) => handleOpenEditTask(id)}
          />
        );
      case 'plants':
        return (
          <PlantSection
            lang={lang}
            plants={care.plants}
            schedules={care.schedules}
            diary={care.diary}
            logs={care.logs}
            addPlant={care.addPlant}
            updatePlant={care.updatePlant}
            deletePlant={care.deletePlant}
            addSchedule={care.addSchedule}
            deleteSchedule={care.deleteSchedule}
            addDiaryEntry={care.addDiaryEntry}
            deleteDiaryEntry={care.deleteDiaryEntry}
            addPhotoToTimeline={care.addPhotoToTimeline}
            deletePhotoFromTimeline={care.deletePhotoFromTimeline}
            updatePhotoInTimeline={care.updatePhotoInTimeline}
            onOpenAddPlant={() => setIsAddPlantOpen(true)}
            onOpenAddTask={(id, type) => handleOpenAddTask(id, type)}
            onOpenEditTask={(id) => handleOpenEditTask(id)}
          />
        );
      case 'logs':
        return <LogsSection lang={lang} logs={care.logs} deleteLog={care.deleteLog} />;
      case 'diary':
        return (
          <NotesSection
            lang={lang}
            diary={care.diary}
            deleteDiaryEntry={care.deleteDiaryEntry}
            onOpenAddDiary={() => handleOpenAddNote()}
          />
        );
      case 'library':
        return <LibrarySection lang={lang} />;
      case 'tasks':
        return (
          <TasksSection
            lang={lang}
            schedules={care.schedules}
            onCompleteTask={care.completeTask}
            onArchiveTask={care.archiveTask}
            onUpdateStatus={care.updateTaskStatus}
            onOpenEditTask={(id) => handleOpenEditTask(id)}
            onOpenAddTask={() => handleOpenAddTask()}
          />
        );
      case 'archive':
        return (
          <ArchiveSection
            lang={lang}
            schedules={care.schedules}
            onRestoreTask={care.restoreTask}
            onDeleteTask={care.deleteSchedule}
          />
        );
      case 'achievements':
        return (
          <AchievementsSection
            lang={lang}
            petCount={care.pets.length}
            plantCount={care.plants.length}
            totalTasksCompleted={care.logs.filter(l => l.entityType === 'pet' || l.entityType === 'plant').length}
            totalWateringCompleted={care.logs.filter(l => l.taskType === 'watering').length}
            totalFeedingCompleted={care.logs.filter(l => l.taskType === 'feeding').length}
            totalWalkingCompleted={care.logs.filter(l => l.taskType === 'walking').length}
            totalMedicineCompleted={care.logs.filter(l => l.taskType === 'medicine').length}
            totalDiaryEntries={care.diary.length}
            totalPhotosUploaded={care.pets.reduce((acc, p) => acc + (p.photoTimeline?.length || 0), 0) + care.plants.reduce((acc, p) => acc + (p.photoTimeline?.length || 0), 0)}
            currentStreak={0}
            maxStreak={Math.max(...care.pets.map(p => p.streakCount || 0), ...care.plants.map(p => p.streakCount || 0), 0)}
            healthyPetCount={care.pets.filter(p => (p.healthScore || 0) >= 80).length}
            healthyPlantCount={care.plants.filter(p => p.status === 'Healthy').length}
            householdMemberCount={careSettings.settings.householdMembers.length}
            libraryEntryCount={0}
          />
        );
      case 'ai':
        return (
          <AIAssistant
            lang={lang}
            apiKey={careSettings.settings.aiApiKey}
            enabled={true}
            theme={careSettings.settings.theme}
            isOpen={true}
            onOpenChange={() => {}}
            onUpdateApiKey={(key) => careSettings.updateSetting('aiApiKey', key)}
            onUpdateVoiceRecordings={(recordings) => careSettings.updateSetting('voiceRecordings', recordings)}
            voiceRecordings={careSettings.settings.voiceRecordings}
            variant="inline"
          />
        );
      case 'settings':
        return (
          <SettingsSection
            lang={lang}
            onLangChange={(l) => changeLang(l)}
            settings={careSettings.settings}
            updateSetting={careSettings.updateSetting}
            triggerSound={careSettings.triggerSound}
            playAlarmSound={careSettings.playAlarmSound}
            petsCount={care.pets.length}
            plantsCount={care.plants.length}
            schedulesCount={care.schedules.length}
            diaryCount={care.diary.length}
            logsCount={care.logs.length}
            onResetAllData={care.resetAllData}
            onResetPetsAndPlants={care.resetPetsAndPlants}
            onRestoreData={care.restoreData}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        );
    }
  };

  if (!isUnlocked) {
    return <PINLock lang={lang} onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:py-6 items-center">
      {/* Smartphone frame container */}
      <div id="phone-container" className="w-full md:max-w-md bg-slate-50 min-h-screen md:min-h-[840px] md:max-h-[900px] md:rounded-[40px] md:shadow-2xl border-x md:border-y border-slate-200 flex flex-col overflow-hidden relative">
        
        {/* Top Status Bar with Language Toggle */}
        <header className="px-5 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏡</span>
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight text-slate-800 leading-tight">
                {translate("appName", lang)}
              </h1>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider flex items-center gap-1 leading-none mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Local Offline Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition text-slate-600 flex items-center justify-center border border-slate-100 shadow-xs"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Screen View Scroll Area */}
        <main className="flex-1 overflow-y-auto px-5 py-6">
          {renderActiveScreen()}
        </main>

        {/* Burger Menu Drawer Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="absolute inset-0 bg-black z-50 cursor-pointer"
              />
              
              {/* Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute top-0 right-0 h-full w-4/5 max-w-xs drawer-bg bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center drawer-header-bg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏡</span>
                    <div>
                      <h2 className="font-display font-bold text-xs text-slate-800 leading-none">
                        {translate("appName", lang)}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                        {translate("navigationMenu", lang)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-200 active:bg-slate-300 rounded-lg text-slate-500 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Navigation Links with Translations */}
                <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
                  {[
                    { id: 'home', label: translate('home', lang), desc: lang === 'en' ? 'Main control center & alerts' : 'Pangunahing kontrol at babala', icon: Home, color: 'text-indigo-600 bg-indigo-50' },
                    { id: 'tasks', label: lang === 'tl' ? 'Mga Gawain' : 'Tasks', desc: lang === 'en' ? 'Manage all your care tasks' : 'Pamahalaan ang mga gawain', icon: CheckSquare, color: 'text-indigo-600 bg-indigo-50', badge: care.activeSchedules.length },
                    { id: 'pets', label: translate('pets', lang), desc: lang === 'en' ? 'Manage pet diets & tracking' : 'Pagkain at talamuhay ng alaga', icon: Heart, color: 'text-orange-500 bg-orange-50' },
                    { id: 'plants', label: translate('plants', lang), desc: lang === 'en' ? 'Water schedules & sunlight' : 'Dilig at sikat ng araw', icon: Leaf, color: 'text-emerald-600 bg-emerald-50' },
                    { id: 'achievements', label: lang === 'tl' ? 'Achievements' : 'Achievements', desc: lang === 'en' ? 'Badges & milestones' : 'Mga badge at milestone', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
                    { id: 'library', label: translate('library', lang), desc: lang === 'en' ? 'Species guide & care rules' : 'Gabay sa pag-aalaga', icon: Book, color: 'text-indigo-600 bg-indigo-50' },
                    { id: 'archive', label: lang === 'tl' ? 'Archive' : 'Archive', desc: lang === 'en' ? 'Completed & archived tasks' : 'Natapos at naka-archive', icon: Archive, color: 'text-slate-600 bg-slate-100', badge: care.archivedSchedules.length },
                    { id: 'logs', label: translate('logs', lang), desc: lang === 'en' ? 'Full history of completed care' : 'Kasaysayan ng pag-aalaga', icon: ClipboardList, color: 'text-indigo-600 bg-indigo-50' },
                    { id: 'diary', label: translate('diary', lang), desc: lang === 'en' ? 'Your care observations' : 'Mga personal na obserbasyon', icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
                    { id: 'ai', label: lang === 'tl' ? 'AI Chat' : 'AI Chat', desc: lang === 'en' ? 'Chat with AI — ask anything' : 'Makipag-chat sa AI — magtanong kahit ano', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
                    { id: 'settings', label: translate('settings', lang), desc: lang === 'en' ? 'App behavior & preferences' : 'Ayusin ang abiso at hitsura', icon: Settings, color: 'text-slate-600 bg-slate-100' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition ${
                          isActive 
                            ? 'drawer-nav-active bg-slate-100 border border-slate-200/60' 
                            : 'drawer-nav-hover border border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-bold ${isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-700'}`}>
                              {item.label}
                            </p>
                            {'badge' in item && (item as any).badge > 0 && (
                              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full leading-none">
                                {(item as any).badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                {/* Drawer Footer Info */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{translate("activeScreen", lang)}:</span>
                    <span className="font-bold text-indigo-600 uppercase tracking-wide">
                      {activeTab === 'tasks'
                        ? (lang === 'tl' ? 'Mga Gawain' : 'Tasks')
                        : activeTab === 'archive'
                        ? (lang === 'tl' ? 'Archive' : 'Archive')
                        : translate(activeTab, lang)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{translate("environment", lang)}:</span>
                    <span className="font-medium text-slate-600">{translate("localCache", lang)}</span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODAL DIALOGS WITH LOCALIZATION SUPPORT --- */}
      <PetDialog
        isOpen={isAddPetOpen}
        onClose={() => setIsAddPetOpen(false)}
        onAdd={care.addPet}
        lang={lang}
      />

      <PlantDialog
        isOpen={isAddPlantOpen}
        onClose={() => setIsAddPlantOpen(false)}
        onAdd={care.addPlant}
        lang={lang}
      />

      <ScheduleDialog
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setPreselectedEntityId(undefined);
          setPreselectedEntityType(undefined);
          setEditScheduleId(null);
        }}
        pets={care.pets}
        plants={care.plants}
        onAdd={care.addSchedule}
        onUpdate={care.updateSchedule}
        editSchedule={editScheduleId ? care.schedules.find(s => s.id === editScheduleId) : null}
        preselectedEntityId={preselectedEntityId}
        preselectedEntityType={preselectedEntityType}
        lang={lang}
      />

      <DiaryDialog
        isOpen={isAddNoteOpen}
        onClose={() => {
          setIsAddNoteOpen(false);
          setPreselectedEntityId(undefined);
          setPreselectedEntityType(undefined);
        }}
        pets={care.pets}
        plants={care.plants}
        onAdd={care.addDiaryEntry}
        preselectedEntityId={preselectedEntityId}
        preselectedEntityType={preselectedEntityType}
        lang={lang}
      />

      <EmergencyDialog
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        lang={lang}
      />

      {/* Floating AI button (overlay mode) — always available when enabled */}
      {careSettings.settings.aiEnabled && (
        <AIAssistant
          lang={lang}
          apiKey={careSettings.settings.aiApiKey}
          enabled={true}
          theme={careSettings.settings.theme}
          isOpen={isAIOpen}
          onOpenChange={(open) => setIsAIOpen(open)}
          onUpdateApiKey={(key) => careSettings.updateSetting('aiApiKey', key)}
          onUpdateVoiceRecordings={(recordings) => careSettings.updateSetting('voiceRecordings', recordings)}
          voiceRecordings={careSettings.settings.voiceRecordings}
          variant="floating"
        />
      )}
    </div>
  );
}
