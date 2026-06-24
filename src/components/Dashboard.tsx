import React, { useState } from 'react';
import { Pet, Plant, Schedule, DiaryEntry, CareLog, CareStatus } from '../types';
import { AppSettings } from '../hooks/useCareSettings';
import { Language, translate } from '../utils/translations';
import {
  Heart,
  Leaf,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  Check,
  ArrowRight,
  ClipboardList,
  Flame,
  UserCheck,
  Search,
  Filter,
  Lightbulb,
  MapPin
} from 'lucide-react';

interface DashboardProps {
  lang: Language;
  pets: Pet[];
  plants: Plant[];
  schedules: Schedule[];
  completeTask: (scheduleId: string, notes?: string) => void;
  onNavigate: (tab: 'home' | 'pets' | 'plants' | 'logs' | 'diary' | 'library' | 'settings') => void;
  onOpenAddPet: () => void;
  onOpenAddPlant: () => void;
  onOpenAddTask: () => void;
  onOpenEditTask: (scheduleId: string) => void;
  onOpenAddNote: () => void;
  settings?: AppSettings;
}

export function Dashboard({
  lang,
  pets,
  plants,
  schedules,
  completeTask,
  onNavigate,
  onOpenAddPet,
  onOpenAddPlant,
  onOpenAddTask,
  onOpenEditTask,
  onOpenAddNote,
  settings,
}: DashboardProps) {
  const [completionNotes, setCompletionNotes] = useState<{ [schedId: string]: string }>({});
  const [activeCompletingId, setActiveCompletingId] = useState<string | null>(null);
  
  // Search & Filter state for Dashboard Tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState<string>('All');
  const [filterMaintenance, setFilterMaintenance] = useState<string>('All');
  const [householdFilter, setHouseholdFilter] = useState<string>('All');

  // Voice assistant states
  const [isVoiceConsoleOpen, setIsVoiceConsoleOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [voiceAlert, setVoiceAlert] = useState<string | null>(null);

  // Calendar selected date (defaults to today)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  const now = new Date();

  // Helper to check if two dates are on the same day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Generate 7 days for the calendar starting from 3 days ago up to 3 days ahead
  const calendarDays: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    calendarDays.push(d);
  }

  // Get Day abbreviation in Tagalog vs English
  const getDayNameAbbreviation = (date: Date) => {
    const dayIndex = date.getDay();
    const tlDays = ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'];
    const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return lang === 'tl' ? tlDays[dayIndex] : enDays[dayIndex];
  };

  // Compute stats for Weekly summary report dynamically based on historical schedules and overdue items
  // Since we run in a sandbox, we fetch mock stats or actual logs from localStorage
  const localLogsStr = localStorage.getItem('care_system_logs') || '[]';
  const parsedLogs: CareLog[] = JSON.parse(localLogsStr);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const plantWateringLogsCount = parsedLogs.filter(log => 
    log.entityType === 'plant' && 
    log.taskType === 'watering' && 
    new Date(log.timestamp) >= oneWeekAgo
  ).length || 3; // fallback to realistic starting values if database is empty

  const petFeedingLogsCount = parsedLogs.filter(log => 
    log.entityType === 'pet' && 
    log.taskType === 'feeding' && 
    new Date(log.timestamp) >= oneWeekAgo
  ).length || 5; // fallback to realistic starting values

  // Active schedules are those scheduled for selected date
  const filteredTasksByDate = schedules.filter(s => {
    const dueDate = new Date(s.nextDue);
    // If selectedDate is today, show anything overdue + due today
    if (isSameDay(selectedCalendarDate, now)) {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      return dueDate <= endOfToday;
    } else {
      // Show tasks scheduled on this calendar day
      return isSameDay(dueDate, selectedCalendarDate);
    }
  });

  // Apply Search and Filters to Tasks List
  const displayTasks = filteredTasksByDate.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.entityName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check Location/Area
    let matchesArea = true;
    if (filterArea !== 'All') {
      if (s.entityType === 'plant') {
        const pl = plants.find(p => p.id === s.entityId);
        matchesArea = pl?.locationArea === filterArea;
      } else {
        const pt = pets.find(p => p.id === s.entityId);
        matchesArea = pt?.locationArea === filterArea;
      }
    }

    // Check Maintenance
    let matchesMaint = true;
    if (filterMaintenance !== 'All') {
      if (s.entityType === 'plant') {
        const pl = plants.find(p => p.id === s.entityId);
        matchesMaint = pl?.maintenance === filterMaintenance;
      } else {
        const pt = pets.find(p => p.id === s.entityId);
        matchesMaint = pt?.maintenance === filterMaintenance;
      }
    }

    // Check Caregiver Assignment (Shared Household Mode)
    let matchesHousehold = true;
    if (householdFilter !== 'All') {
      matchesHousehold = s.assignedTo === householdFilter;
    }

    return matchesSearch && matchesArea && matchesMaint && matchesHousehold;
  });

  // Calculate Overdue Alerts Count
  const overdueTasksCount = schedules.filter(s => new Date(s.nextDue) < now).length;

  // 1. Dynamic Rule-Based Smart Assistant Mode Advice
  const getSmartAssistantAdvice = () => {
    const adviceList: { id: string; text: string; icon: string; type: 'warning' | 'tip' | 'photo' }[] = [];

    // Check overdue tasks
    schedules.forEach(s => {
      const isOverdue = new Date(s.nextDue) < now;
      if (isOverdue) {
        const hoursOverdue = Math.max(1, Math.round((now.getTime() - new Date(s.nextDue).getTime()) / (1000 * 60 * 60)));
        if (lang === 'tl') {
          adviceList.push({
            id: `overdue-${s.id}`,
            text: `Napansin ko na ang "${s.name}" para kay ${s.entityName} ay lampas na ng ${hoursOverdue} oras. Pakisagutan na ito upang mapanatiling malusog ang iyong alaga/halaman!`,
            icon: '⚠️',
            type: 'warning'
          });
        } else {
          adviceList.push({
            id: `overdue-${s.id}`,
            text: `Notice: "${s.name}" for ${s.entityName} is overdue by ${hoursOverdue} hour(s). Complete this soon to preserve their health score!`,
            icon: '⚠️',
            type: 'warning'
          });
        }
      }
    });

    // Check critical health
    pets.forEach(p => {
      if ((p.healthScore ?? 100) < 65) {
        if (lang === 'tl') {
          adviceList.push({
            id: `health-pet-${p.id}`,
            text: `Nangangailangan ng pansin si ${p.name} (HP: ${p.healthScore}). I-double check ang kanyang mga pagkain, laro, at gamot!`,
            icon: '🐾',
            type: 'warning'
          });
        } else {
          adviceList.push({
            id: `health-pet-${p.id}`,
            text: `Attention: ${p.name}'s health is low (HP: ${p.healthScore}). Double check feeding, play, or medicine schedule!`,
            icon: '🐾',
            type: 'warning'
          });
        }
      }
    });

    plants.forEach(p => {
      if ((p.healthScore ?? 100) < 65) {
        if (lang === 'tl') {
          adviceList.push({
            id: `health-plant-${p.id}`,
            text: `Medyo lantang-lanta si ${p.name} (HP: ${p.healthScore}). Paki-asikaso ang pagdidilig o sikat ng araw!`,
            icon: '🌿',
            type: 'warning'
          });
        } else {
          adviceList.push({
            id: `health-plant-${p.id}`,
            text: `Attention: ${p.name} is looking droopy (HP: ${p.healthScore}). Please check watering and sunlight exposure!`,
            icon: '🌿',
            type: 'warning'
          });
        }
      }
    });

    // Growth Photo Reminder (Auto Photo Reminder)
    const entityList = [
      ...pets.map(p => ({ id: p.id, name: p.name, photoTimeline: p.photoTimeline, type: 'pet' })),
      ...plants.map(p => ({ id: p.id, name: p.name, photoTimeline: p.photoTimeline, type: 'plant' }))
    ];

    entityList.forEach(e => {
      const lastPhoto = e.photoTimeline?.[e.photoTimeline.length - 1];
      let needsPhoto = false;
      if (!lastPhoto) {
        needsPhoto = true;
      } else {
        const daysSinceLastPhoto = (now.getTime() - new Date(lastPhoto.date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastPhoto >= 5) {
          needsPhoto = true;
        }
      }

      if (needsPhoto) {
        if (lang === 'tl') {
          adviceList.push({
            id: `photo-${e.id}`,
            text: `📷 Alerto sa Paglaki: Kumuha ng bagong larawan ni ${e.name} ngayon upang maitala ang kanyang pag-unlad!`,
            icon: '📷',
            type: 'photo'
          });
        } else {
          adviceList.push({
            id: `photo-${e.id}`,
            text: `📷 Growth Alert: Take a new photo of ${e.name} today to capture their care timeline!`,
            icon: '📷',
            type: 'photo'
          });
        }
      }
    });

    // Friendly Advice tip
    if (adviceList.length === 0) {
      if (lang === 'tl') {
        adviceList.push({
          id: 'tip-ok',
          text: 'Maganda ang takbo ng lahat! Panatilihin ang ganitong galing sa pag-aalaga. ✨',
          icon: '🌟',
          type: 'tip'
        });
      } else {
        adviceList.push({
          id: 'tip-ok',
          text: 'Everything is running smoothly! Keep up this phenomenal caregiving. ✨',
          icon: '🌟',
          type: 'tip'
        });
      }
    }

    return adviceList;
  };

  // Compute dynamic streaks and maximum streak
  const maxStreak = Math.max(
    ...pets.map(p => p.streakCount || 0),
    ...plants.map(pl => pl.streakCount || 0),
    0
  );

  const adviceItems = getSmartAssistantAdvice();

  // 2. Dynamic Achievements (Gamification System)
  const localDiaryStr = localStorage.getItem('care_system_diary') || '[]';
  const parsedDiary: DiaryEntry[] = JSON.parse(localDiaryStr);

  const totalPhotosCount = [
    ...pets.map(p => p.photoTimeline?.length || 0),
    ...plants.map(p => p.photoTimeline?.length || 0)
  ].reduce((a, b) => a + b, 0);

  const totalWateringLogsCount = parsedLogs.filter(l => l.taskType === 'watering').length;

  const achievementsList = [
    {
      id: 'badge-newbie',
      title: lang === 'tl' ? 'Bagong Tagapag-alaga' : 'New Caregiver',
      desc: lang === 'tl' ? 'Magkaroon ng kahit isang alaga at isang halaman.' : 'Register at least one pet and one plant.',
      isUnlocked: pets.length >= 1 && plants.length >= 1,
      progress: `${Math.min(pets.length, 1) + Math.min(plants.length, 1)} / 2`,
      icon: '🏡'
    },
    {
      id: 'badge-water',
      title: lang === 'tl' ? 'Hari ng Dilig' : 'Water Master',
      desc: lang === 'tl' ? 'Kumpletuhin ang pagdidilig ng halaman ng 3 beses.' : 'Successfully water your plants 3 times.',
      isUnlocked: totalWateringLogsCount >= 3,
      progress: `${Math.min(totalWateringLogsCount, 3)} / 3`,
      icon: '💧'
    },
    {
      id: 'badge-streak',
      title: lang === 'tl' ? 'Tapat na Alagad' : 'Loyal Guardian',
      desc: lang === 'tl' ? 'Maabot ang 3 araw na sunod-sunod na pag-aalaga.' : 'Reach a continuous care streak of 3 days.',
      isUnlocked: maxStreak >= 3,
      progress: `${Math.min(maxStreak, 3)} / 3`,
      icon: '🔥'
    },
    {
      id: 'badge-diary',
      title: lang === 'tl' ? 'Masinop na Kwentista' : 'Diligent Scribe',
      desc: lang === 'tl' ? 'Mag-log ng hindi bababa sa 2 tala sa diary.' : 'Log at least 2 entries in your notes diary.',
      isUnlocked: parsedDiary.length >= 2,
      progress: `${Math.min(parsedDiary.length, 2)} / 2`,
      icon: '📝'
    },
    {
      id: 'badge-photos',
      title: lang === 'tl' ? 'Matiyagang Photographer' : 'Growth Archivist',
      desc: lang === 'tl' ? 'Kumuha ng 2 o higit pang larawan ng paglaki.' : 'Save 2 or more growth tracker photos.',
      isUnlocked: totalPhotosCount >= 2,
      progress: `${Math.min(totalPhotosCount, 2)} / 2`,
      icon: '📷'
    }
  ];

  // 3. Dynamic Monthly Report & Expense totals
  const totalPetExpenses = pets.reduce((sum, pet) => {
    return sum + (pet.expenses || []).reduce((s, e) => s + e.amount, 0);
  }, 0);

  const petExpensesByCategory = pets.reduce((acc, pet) => {
    (pet.expenses || []).forEach(exp => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    });
    return acc;
  }, { food: 0, vet: 0, supplies: 0, other: 0 } as Record<'food' | 'vet' | 'supplies' | 'other', number>);

  const careConsistencyScore = Math.max(0, 100 - (overdueTasksCount * 6));

  const mostActivePetName = (() => {
    const petLogs = parsedLogs.filter(l => l.entityType === 'pet');
    if (petLogs.length === 0) return pets[0]?.name || 'N/A';
    const counts: Record<string, number> = {};
    petLogs.forEach(l => {
      counts[l.entityName] = (counts[l.entityName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  })();

  const mostCaredPlantName = (() => {
    const plantLogs = parsedLogs.filter(l => l.entityType === 'plant');
    if (plantLogs.length === 0) return plants[0]?.name || 'N/A';
    const counts: Record<string, number> = {};
    plantLogs.forEach(l => {
      counts[l.entityName] = (counts[l.entityName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  })();

  // 4. Voice Input Handlers
  const handleVoiceCommand = (commandText: string) => {
    const clean = commandText.toLowerCase().trim();
    setTranscriptionText(commandText);

    if (clean.includes('dilig') || clean.includes('water') || clean.includes('nadilig')) {
      // Find the first pending plant watering schedule
      const wateringTask = schedules.find(s => s.entityType === 'plant' && s.taskType === 'watering');
      if (wateringTask) {
        completeTask(wateringTask.id, lang === 'tl' ? 'Kinumpuni gamit ang boses' : 'Completed via voice command');
        setVoiceAlert(lang === 'tl' 
          ? `Naintindihan! Gawaing natapos: Diligan si ${wateringTask.entityName} 💧` 
          : `Understood! Completed watering task for ${wateringTask.entityName} 💧`
        );
      } else {
        setVoiceAlert(lang === 'tl' ? 'Walang nakitang kailangang diligin sa ngayon.' : 'No pending watering schedules found.');
      }
    } else if (clean.includes('pakain') || clean.includes('feed') || clean.includes('pinakain')) {
      // Find first pending pet feeding task
      const feedingTask = schedules.find(s => s.entityType === 'pet' && s.taskType === 'feeding');
      if (feedingTask) {
        completeTask(feedingTask.id, lang === 'tl' ? 'Kinumpuni gamit ang boses' : 'Completed via voice command');
        setVoiceAlert(lang === 'tl'
          ? `Naintindihan! Gawaing natapos: Pakainin si ${feedingTask.entityName} 🍖`
          : `Understood! Completed feeding task for ${feedingTask.entityName} 🍖`
        );
      } else {
        setVoiceAlert(lang === 'tl' ? 'Walang nakitang kailangang pakainin sa ngayon.' : 'No pending feeding schedules found.');
      }
    } else if (clean.includes('halaman') || clean.includes('plant') || clean.includes('magdagdag ng halaman')) {
      onOpenAddPlant();
      setVoiceAlert(lang === 'tl' ? 'Binubuksan ang form para magdagdag ng halaman...' : 'Opening Add Plant form...');
      setIsVoiceConsoleOpen(false);
    } else if (clean.includes('alaga') || clean.includes('pet') || clean.includes('magdagdag ng alaga')) {
      onOpenAddPet();
      setVoiceAlert(lang === 'tl' ? 'Binubuksan ang form para magdagdag ng alaga...' : 'Opening Add Pet form...');
      setIsVoiceConsoleOpen(false);
    } else if (clean.includes('gawain') || clean.includes('tasks')) {
      setVoiceAlert(lang === 'tl' ? 'Ipinapakita ang iyong mga gawain ngayon.' : 'Showing today\'s tasks list.');
    } else {
      setVoiceAlert(lang === 'tl' 
        ? `Hindi naintindihan ang: "${commandText}". Subukan ang "Dilig" o "Pakain"!` 
        : `Could not process command: "${commandText}". Try saying "Water" or "Feed"!`
      );
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'tl' ? 'Ang iyong browser ay hindi sumusuporta sa speech recognition.' : 'Microphone input is not supported in your browser.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'tl' ? 'fil-PH' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsSpeaking(true);
        setTranscriptionText(lang === 'tl' ? 'Nakikinig sa iyong boses...' : 'Listening to your voice...');
        setVoiceAlert(null);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        handleVoiceCommand(resultText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error', event);
        setIsSpeaking(false);
        setTranscriptionText(lang === 'tl' ? 'Hindi nagawang makinig' : 'Unable to capture speech');
      };

      recognition.onend = () => {
        setIsSpeaking(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const handleQuickComplete = (scheduleId: string) => {
    completeTask(scheduleId, completionNotes[scheduleId] || '');
    // Reset state
    setCompletionNotes(prev => {
      const copy = { ...prev };
      delete copy[scheduleId];
      return copy;
    });
    setActiveCompletingId(null);
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'feeding': return '🍖';
      case 'walking': return '🐕';
      case 'medicine': return '💊';
      case 'vet': return '🩺';
      case 'watering': return '💧';
      case 'fertilizer': return '🧪';
      case 'sunlight': return '☀️';
      default: return '🧼';
    }
  };

  // Helper to retrieve and format overdue/remaining duration
  const getDueDateString = (dateStr: string) => {
    const dueDate = new Date(dateStr);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) {
      const hoursAgo = Math.abs(diffHours);
      if (hoursAgo >= 24) {
        const daysAgo = Math.round(hoursAgo / 24);
        return lang === 'tl'
          ? `Huli na ng ${daysAgo} araw`
          : `Overdue by ${daysAgo} day${daysAgo > 1 ? 's' : ''}`;
      }
      return lang === 'tl'
        ? `Huli na ng ${hoursAgo} oras`
        : `Overdue by ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''}`;
    } else if (diffHours === 0) {
      return lang === 'tl' ? 'Kailangan na ngayon' : 'Due now';
    } else if (diffHours < 24) {
      return lang === 'tl'
        ? `Kailangan sa loob ng ${diffHours} oras`
        : `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      const daysLeft = Math.round(diffHours / 24);
      return lang === 'tl'
        ? `Kailangan sa loob ng ${daysLeft} araw`
        : `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
    }
  };

  // Dynamic status scoring logic
  const getOverallHealthScore = () => {
    if (pets.length === 0 && plants.length === 0) return 100;
    const totalScore = [
      ...pets.map(p => p.healthScore !== undefined ? p.healthScore : 90),
      ...plants.map(p => p.healthScore !== undefined ? p.healthScore : 85)
    ].reduce((acc, score) => acc + score, 0);
    return Math.round(totalScore / (pets.length + plants.length));
  };

  const overallHealth = getOverallHealthScore();

  // Helper to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  const getScoreStatusLabel = (score: number) => {
    if (score >= 80) return translate('statusHealthy', lang);
    if (score >= 50) return translate('statusWarning', lang);
    return translate('statusCritical', lang);
  };

  // Plant health statistics
  const healthyPlants = plants.filter(p => (p.healthScore ?? 100) >= 80).length;
  const warningPlants = plants.filter(p => (p.healthScore ?? 100) >= 50 && (p.healthScore ?? 100) < 80).length;
  const criticalPlants = plants.filter(p => (p.healthScore ?? 100) < 50).length;

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-10">
      
      {/* 1. Dashboard Welcome Card & Overall Health Score */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              {translate("welcomeBack", lang)}!
            </span>
            <h2 className="font-display font-black text-2xl tracking-tight mt-0.5">
              {translate("appName", lang)}
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 flex items-center gap-1">
              <CalendarIcon size={12} className="text-teal-400" />
              {now.toLocaleDateString(lang === 'tl' ? 'fil-PH' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Core Health Score Panel */}
          {(!settings || settings.healthScoringEnabled !== false) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                {translate("scoreIndicator", lang)}
              </span>
              <span className="font-black text-2xl text-teal-400 font-mono mt-0.5">{overallHealth}%</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white mt-1">
                {getScoreStatusLabel(overallHealth)}
              </span>
            </div>
          )}
        </div>

        {/* Quantities indicator */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
            <span className="text-xl">🐕</span>
            <div>
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider leading-none">
                {translate("petsLogged", lang)}
              </p>
              <p className="font-black text-base mt-1 leading-none">{pets.length}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider leading-none">
                {translate("plantsManaged", lang)}
              </p>
              <p className="font-black text-base mt-1 leading-none">{plants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Habit Streaks Block */}
      {(!settings || settings.habitStreakTrackingEnabled !== false) && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
              <Flame size={24} className="fill-orange-500 text-orange-500 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {translate("streakTitle", lang)}
              </span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                {maxStreak} {translate("streakDays", lang)}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {maxStreak === 0 
                  ? translate("streakMotto0", lang)
                  : maxStreak > 3 
                    ? translate("streakMotto2", lang)
                    : translate("streakMotto1", lang)}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-orange-500 flex items-center justify-center font-mono font-bold text-orange-600 text-xs shrink-0">
            {maxStreak}d
          </div>
        </div>
      )}

      {/* 🧠 SMART ASSISTANT MODE ADVISOR PANEL */}
      {(!settings || settings.smartSuggestionsEnabled !== false) && (
        <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-1 border-b border-slate-50">
            <h3 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs">🧠</span>
              {lang === 'tl' ? 'Matalinong Gabay (Smart Assistant)' : 'Smart Assistant Advisor'}
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'tl' ? 'Aktibo' : 'Active'}
            </span>
          </div>

          {/* Rolling list of smart items */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
            {adviceItems.map((item, idx) => (
              <div
                 key={idx}
                 className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                   item.type === 'warning'
                     ? 'bg-rose-50/70 border-rose-100/80 text-rose-800'
                     : item.type === 'photo'
                       ? 'bg-amber-50/60 border-amber-100 text-amber-800'
                       : 'bg-emerald-50/60 border-emerald-100 text-emerald-800'
                 }`}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="leading-relaxed font-semibold text-slate-800">{item.text}</p>
                  <span className="text-[8.5px] uppercase tracking-wider font-extrabold block mt-1.5 opacity-80 text-slate-500">
                    {item.type === 'warning'
                      ? (lang === 'tl' ? 'Aksyon: Unahin Ito' : 'Action Required')
                      : item.type === 'photo'
                        ? (lang === 'tl' ? 'Aksyon: Mag-larawan' : 'Action: Growth Tracker')
                        : (lang === 'tl' ? 'Tala: Maayos ang Lahat' : 'Status: Optimal')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Daily / Weekly Summary Report */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50/60 border border-slate-150 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {translate("weeklyReportTitle", lang)}
          </h3>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-teal-600 font-bold font-mono">✓</span>
            <p>{translate("reportDilig", lang, { count: plantWateringLogsCount })}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-indigo-600 font-bold font-mono">✓</span>
            <p>{translate("reportFeed", lang, { count: petFeedingLogsCount })}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className={`${overdueTasksCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400 font-semibold'}`}>
              ⚠️
            </span>
            <p>{translate("reportMissed", lang, { count: overdueTasksCount })}</p>
          </div>
        </div>
        <p className="text-xs italic text-slate-500 mt-2.5 px-1">
          {overdueTasksCount === 0 ? translate("reportStatusGood", lang) : translate("reportStatusBad", lang)}
        </p>
      </div>

      {/* 4. Quick Circular Action Hub */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          {translate("quickActions", lang)}
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={onOpenAddPet}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-50 hover:bg-orange-100/80 group transition"
          >
            <span className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm shadow-sm transition group-hover:scale-110">
              <Plus size={15} />
            </span>
            <span className="text-xs font-bold text-orange-700 mt-1.5 truncate w-full">
              {translate("addPet", lang)}
            </span>
          </button>

          <button
            onClick={onOpenAddPlant}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 group transition"
          >
            <span className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow-sm transition group-hover:scale-110">
              <Plus size={15} />
            </span>
            <span className="text-xs font-bold text-emerald-700 mt-1.5 truncate w-full">
              {translate("addPlant", lang)}
            </span>
          </button>

          <button
            onClick={onOpenAddTask}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 group transition"
          >
            <span className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm shadow-sm transition group-hover:scale-110">
              <Plus size={15} />
            </span>
            <span className="text-xs font-bold text-indigo-700 mt-1.5 truncate w-full">
              {translate("addTask", lang)}
            </span>
          </button>

          <button
            onClick={onOpenAddNote}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 group transition"
          >
            <span className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm shadow-sm transition group-hover:scale-110">
              <Plus size={15} />
            </span>
            <span className="text-xs font-bold text-teal-700 mt-1.5 truncate w-full">
              {translate("addNote", lang)}
            </span>
          </button>
        </div>
      </div>

      {/* 🏆 GAMIFICATION ACHIEVEMENT BADGES */}
      {(!settings || settings.habitStreakTrackingEnabled !== false) && (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-5 border border-indigo-950 shadow-md space-y-4">
          <div>
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
              <span>🏆</span>
              {lang === 'tl' ? 'Mga Gantimpala at Medalya' : 'Achievements & Care Badges'}
            </h3>
            <p className="text-xs text-indigo-300 mt-1">
              {lang === 'tl' ? 'Makamit ang mga medalya sa pamamagitan ng pag-aalaga!' : 'Unlock special badges by successfully attending to your pets & plants.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {achievementsList.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  badge.isUnlocked
                    ? 'bg-white/10 border-white/15 text-white shadow-xs'
                    : 'bg-white/5 border-white/5 text-slate-400 opacity-60'
                }`}
              >
                <span className={`text-2xl p-2 rounded-xl shrink-0 ${badge.isUnlocked ? 'bg-indigo-500/30' : 'bg-slate-800'}`}>
                  {badge.icon}
                </span>
                <div className="min-w-0 flex-grow">
                  <div className="flex justify-between items-center gap-1.5">
                    <h4 className="font-bold text-sm truncate">{badge.title}</h4>
                    {badge.isUnlocked && (
                      <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-black uppercase font-mono tracking-wider">
                        {lang === 'tl' ? 'Nakuha' : 'Unlocked'}
                      </span>
                    )}
                  </div>
                  <p className="text-[9.5px] opacity-80 leading-normal mt-0.5">{badge.desc}</p>
                  <span className="text-[8.5px] font-mono mt-1 block font-bold opacity-90">
                    {lang === 'tl' ? 'Katayuan' : 'Progress'}: {badge.progress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📊 MONTHLY ANALYTICS & EXPENSE SUMMARY */}
      {(!settings || settings.monthlyReportEnabled !== false) && (
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <span className="p-1 bg-teal-50 text-teal-600 rounded-lg text-xs">📊</span>
              {lang === 'tl' ? 'Bulanang Ulat at Pagsusuri' : 'Monthly Analytics & Report'}
            </h3>
            <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              {now.toLocaleString(lang === 'tl' ? 'fil-PH' : 'en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Grid stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">{lang === 'tl' ? 'KONSISTENSYA' : 'CONSISTENCY'}</span>
              <p className="font-black text-lg text-teal-600 font-mono mt-0.5">{careConsistencyScore}%</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-teal-500 h-full transition-all" style={{ width: `${careConsistencyScore}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">{lang === 'tl' ? 'GASTOS SA ALAGA' : 'PET EXPENSES'}</span>
              <p className="font-black text-lg text-indigo-600 font-mono mt-0.5">₱{totalPetExpenses.toLocaleString()}</p>
              <span className="text-xs text-slate-400 block mt-1 leading-none">{lang === 'tl' ? 'Kabuuang gastos sa buwang ito' : 'Total spent this billing month'}</span>
            </div>
          </div>

          {/* Most cared and most active summary */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold flex items-center gap-1">🐕 {lang === 'tl' ? 'Pinaka-aktibong Alaga:' : 'Most Active Pet:'}</span>
              <strong className="text-slate-800 font-display font-bold">{mostActivePetName}</strong>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
              <span className="text-slate-500 font-semibold flex items-center gap-1">🌿 {lang === 'tl' ? 'Pinaka-maalagang Halaman:' : 'Most Cared Plant:'}</span>
              <strong className="text-slate-800 font-display font-bold">{mostCaredPlantName}</strong>
            </div>
          </div>

          {/* Expenses Category breakdown */}
          {totalPetExpenses > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === 'tl' ? 'PAGHAHATI NG GASTOS' : 'EXPENSES CATEGORY BREAKDOWN'}</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-orange-50/80 border border-orange-100">
                  <span className="font-bold text-orange-800 font-mono block">₱{petExpensesByCategory.food}</span>
                  <span className="text-[8px] text-slate-400 uppercase block mt-0.5">{lang === 'tl' ? 'Kain' : 'Food'}</span>
                </div>
                <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-100">
                  <span className="font-bold text-rose-800 font-mono block">₱{petExpensesByCategory.vet}</span>
                  <span className="text-[8px] text-slate-400 uppercase block mt-0.5">Vet</span>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100">
                  <span className="font-bold text-blue-800 font-mono block">₱{petExpensesByCategory.supplies}</span>
                  <span className="text-[8px] text-slate-400 uppercase block mt-0.5">{lang === 'tl' ? 'Gamit' : 'Gear'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="font-bold text-slate-700 font-mono block">₱{petExpensesByCategory.other}</span>
                  <span className="text-[8px] text-slate-400 uppercase block mt-0.5">{lang === 'tl' ? 'Iba' : 'Other'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Interactive 7-Day Calendar Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
            <CalendarIcon size={12} className="text-indigo-500" />
            {translate("calendarTitle", lang)}
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
            {translate("calendarMonth", lang)}
          </span>
        </div>
        
        {/* Calendar Day strip */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, idx) => {
            const isToday = isSameDay(day, now);
            const isSelected = isSameDay(day, selectedCalendarDate);
            
            // Check if there are tasks on this day
            const hasTasksOnDay = schedules.some(s => isSameDay(new Date(s.nextDue), day));

            return (
              <button
                key={idx}
                onClick={() => setSelectedCalendarDate(day)}
                className={`py-2 rounded-xl flex flex-col items-center transition relative ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-md font-bold' 
                    : isToday 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                      : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-xs uppercase font-semibold opacity-85">
                  {getDayNameAbbreviation(day)}
                </span>
                <span className="text-xs font-bold mt-1 font-mono">
                  {day.getDate()}
                </span>
                
                {/* Task dot indicator */}
                {hasTasksOnDay && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                    isSelected ? 'bg-white' : 'bg-indigo-500'
                  }`}></span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 text-center mt-2.5 italic">
          {translate("viewSchedulesFor", lang, { 
            date: selectedCalendarDate.toLocaleDateString(lang === 'tl' ? 'fil-PH' : 'en-US', { month: 'short', day: 'numeric' })
          })}
        </p>
      </div>

      {/* 6. Smart Care Tips System */}
      <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-900 shadow-3xs">
        <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
            {translate("careTipsTitle", lang)}
          </h4>
          <div className="text-xs text-amber-700 mt-1 space-y-1.5 leading-relaxed">
            <p>• {translate("plantCareTip1", lang)}</p>
            <p>• {translate("petCareTip1", lang)}</p>
          </div>
        </div>
      </div>

      {/* 7. Search & Filtering Bar for Tasks */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={translate("searchPlaceholder", lang)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition bg-slate-50"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {translate("locationLabel", lang)}
            </label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 focus:outline-none text-slate-700"
            >
              <option value="All">{lang === 'tl' ? 'Lahat ng Lugar' : 'All Areas'}</option>
              <option value="Loob ng Bahay">{lang === 'tl' ? 'Loob ng Bahay' : 'Loob ng Bahay (Indoor)'}</option>
              <option value="Balkonahe">{lang === 'tl' ? 'Balkonahe' : 'Balkonahe (Balcony)'}</option>
              <option value="Hardin">{lang === 'tl' ? 'Hardin' : 'Hardin (Garden)'}</option>
              <option value="Likod-bahay (Outdoor)">{lang === 'tl' ? 'Likod-bahay' : 'Likod-bahay (Outdoor)'}</option>
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {translate("filterMaintenance", lang)}
            </label>
            <select
              value={filterMaintenance}
              onChange={(e) => setFilterMaintenance(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 focus:outline-none text-slate-700"
            >
              <option value="All">{lang === 'tl' ? 'Lahat ng Antas' : 'All Levels'}</option>
              <option value="low">{lang === 'tl' ? 'Mababa (Low)' : 'Low Maintenance'}</option>
              <option value="high">{lang === 'tl' ? 'Mataas (High)' : 'High Maintenance'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8. Overdue Alerts Banner */}
      {overdueTasksCount > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-rose-800">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800">
              {translate("urgentAttention", lang)}
            </h4>
            <p className="text-xs text-rose-600 mt-0.5">
              {translate("overdueTasksDesc", lang, { count: overdueTasksCount })}
            </p>
          </div>
        </div>
      )}

      {/* 9. Today's Tasks Combined List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-1.5">
            <ClipboardList className="text-indigo-500" size={16} />
            {translate("todaysTasks", lang)}
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">
              {displayTasks.length}
            </span>
            {/* 🎤 Voice Assistant Console Trigger */}
            <button
              onClick={() => {
                setTranscriptionText('');
                setVoiceAlert(null);
                setIsVoiceConsoleOpen(true);
              }}
              className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition shrink-0 shadow-3xs flex items-center justify-center cursor-pointer ml-1 animate-pulse"
              title={lang === 'tl' ? 'Boses Katulong' : 'Voice Assistant input'}
            >
              <span className="text-xs">🎤</span>
            </button>
          </h3>
          <button
            onClick={() => onNavigate('logs')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            {translate("viewLogs", lang)}
            <ArrowRight size={12} />
          </button>
        </div>

        {/* 👥 Caregiver selector filter row (Shared Household Mode) */}
        <div className="px-1 py-0.5">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            👥 {lang === 'tl' ? 'Tagapangalaga ng Tahanan' : 'Household Caregiver View'}
          </span>
          <div className="flex gap-1 overflow-x-auto pb-1 max-w-full text-xs font-bold">
            {['All', 'Ako', 'Nanay', 'Tatay', 'Ate', 'Kuya', 'Bunso'].map(member => (
              <button
                key={member}
                onClick={() => setHouseholdFilter(member)}
                className={`px-2.5 py-1 rounded-full border transition shrink-0 cursor-pointer ${
                  householdFilter === member
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {member === 'All' 
                  ? (lang === 'tl' ? 'Lahat ng Gawain' : 'All Tasks') 
                  : (lang === 'tl' && translate(`family${member}`, lang) ? translate(`family${member}`, lang) : member)}
              </button>
            ))}
          </div>
        </div>

        {displayTasks.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center text-slate-500 shadow-xs">
            <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">
              {translate("allCaughtUp", lang)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {translate("allCaughtUpDesc", lang)}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayTasks.map((sched) => {
              const isOverdue = new Date(sched.nextDue) < now;
              const isCompleting = activeCompletingId === sched.id;

              // Find current score of the companion
              let scoreValue = 90;
              let areaTag = '';
              let assignedTo = '';
              if (sched.entityType === 'plant') {
                const pl = plants.find(p => p.id === sched.entityId);
                scoreValue = pl?.healthScore ?? (pl?.status === 'Healthy' ? 90 : pl?.status === 'Needs Attention' ? 65 : 35);
                areaTag = pl?.locationArea || '';
                assignedTo = pl?.assignedTo || '';
              } else {
                const pt = pets.find(p => p.id === sched.entityId);
                scoreValue = pt?.healthScore ?? 90;
                areaTag = pt?.locationArea || '';
                assignedTo = pt?.assignedTo || '';
              }

              return (
                <div
                  key={sched.id}
                  className={`bg-white rounded-2xl border transition-all shadow-xs ${
                    isOverdue
                      ? 'border-rose-100 hover:border-rose-200 bg-rose-50/5'
                      : 'border-slate-100 hover:border-indigo-150'
                  }`}
                >
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0 ${
                        isOverdue ? 'bg-rose-50' : ''
                      }`}>
                        {getTaskIcon(sched.taskType)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            sched.entityType === 'pet'
                              ? 'bg-orange-50 text-orange-700 border border-orange-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {sched.entityName}
                          </span>
                          
                          {/* Location Tag */}
                          {areaTag && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <MapPin size={8} />
                              {areaTag}
                            </span>
                          )}

                          {/* Companion Health Score Badge */}
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded font-mono ${getScoreColor(scoreValue)}`}>
                            {scoreValue} HP
                          </span>

                          {isOverdue && (
                            <span className="text-[8px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded font-mono uppercase">
                              {lang === 'tl' ? 'HULI' : 'OVERDUE'}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-800 text-xs mt-1 truncate">{sched.name}</h4>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs text-slate-400 flex items-center gap-0.5 font-mono">
                            <Clock size={10} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
                            {getDueDateString(sched.nextDue)}
                          </p>

                          {/* 9. Family task assignment label */}
                          {assignedTo && (
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                              <UserCheck size={8} />
                              {translate(`family${assignedTo}`, lang) || assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onOpenEditTask(sched.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-100"
                        title="Edit task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => setActiveCompletingId(isCompleting ? null : sched.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleting
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : isOverdue
                              ? 'bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white'
                              : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-500'
                        }`}
                        title="Kumpunihin/Log completed"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Completing Notes Form Slide-out */}
                  {isCompleting && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl">
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'tl' ? 'Idagdag ang Tala / Obserbasyon (Opsyonal)' : 'Add Quick Observation Notes (Optional)'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={lang === 'tl' ? 'hal., Busog na, tuyo ang lupa' : 'e.g., Ate all food, soil was super dry.'}
                          value={completionNotes[sched.id] || ''}
                          onChange={(e) => setCompletionNotes(prev => ({ ...prev, [sched.id]: e.target.value }))}
                          className="flex-grow px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-slate-800 transition"
                        />
                        <button
                          onClick={() => handleQuickComplete(sched.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-lg shadow-xs transition flex items-center gap-1 shrink-0"
                        >
                          {translate("confirm", lang)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 10. Status Index of Plants */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {translate("plantCareIndex", lang)}
          </span>
          <h4 className="font-display font-semibold text-xs text-slate-800 mt-1 flex items-center gap-1.5">
            <Leaf size={14} className="text-emerald-500" />
            {translate("gardenHealth", lang)}
          </h4>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
                {translate("statusHealthy", lang)} (80-100)
              </span>
              <span className="font-mono font-bold text-slate-700">{healthyPlants}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 
                {translate("statusWarning", lang)} (50-79)
              </span>
              <span className="font-mono font-bold text-slate-700">{warningPlants}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 
                {translate("statusCritical", lang)} (0-49)
              </span>
              <span className="font-mono font-bold text-slate-700">{criticalPlants}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('plants')}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 text-left mt-3.5 flex items-center gap-0.5"
        >
          {translate("managePlants", lang)} <ArrowRight size={10} />
        </button>
      </div>

      {/* 🎤 VOICE INPUT DRAWER MODAL SHEET */}
      {isVoiceConsoleOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsVoiceConsoleOpen(false)}
          />
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-5 shadow-2xl relative z-50 border-t border-slate-150 flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎤</span>
                <div>
                  <h3 className="font-display font-black text-slate-800 text-xs">
                    {lang === 'tl' ? 'Katulong sa Boses' : 'Care Voice Assistant'}
                  </h3>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                    {lang === 'tl' ? 'Kausapin ang sistema' : 'Speak or tap simulated commands'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsVoiceConsoleOpen(false)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Dynamic voice waveform if listening */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              {isSpeaking ? (
                <div className="flex items-center gap-1 justify-center h-8 mb-4">
                  <div className="w-1 bg-indigo-500 h-6 rounded animate-pulse" />
                  <div className="w-1 bg-indigo-500 h-3 rounded animate-pulse delay-75" />
                  <div className="w-1 bg-indigo-500 h-8 rounded animate-pulse delay-150" />
                  <div className="w-1 bg-indigo-500 h-4 rounded animate-pulse delay-200" />
                  <div className="w-1 bg-indigo-500 h-6 rounded animate-pulse delay-300" />
                </div>
              ) : (
                <span className="text-3xl mb-4">🎙️</span>
              )}

              <button
                onClick={startListening}
                disabled={isSpeaking}
                className={`px-5 py-2.5 rounded-full font-bold text-xs text-white transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  isSpeaking ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 animate-pulse'
                }`}
              >
                {isSpeaking ? (lang === 'tl' ? 'Nakikinig...' : 'Listening...') : (lang === 'tl' ? 'Magsalita Ngayon / Speak Now' : 'Tap to Speak')}
              </button>

              {transcriptionText && (
                <p className="mt-4 text-xs font-mono font-bold text-center text-slate-700 max-w-xs px-4">
                  &ldquo;{transcriptionText}&rdquo;
                 </p>
               )}

              {voiceAlert && (
                <div className="mt-3 mx-4 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs text-center font-bold">
                  {voiceAlert}
                </div>
              )}
            </div>

            {/* Simulated Voice Command Chips for bulletproof sandboxed access */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'tl' ? 'Mabilisang Utos (Simulated Commands)' : 'Quick Simulated Voice Prompts'}
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => handleVoiceCommand(lang === 'tl' ? 'Nadiligan ko na ang cactus' : 'Water cactus plant')}
                  className="p-2 bg-slate-50 border border-slate-150 hover:bg-indigo-50 hover:border-indigo-150 rounded-xl transition text-left cursor-pointer"
                >
                  💧 &ldquo;{lang === 'tl' ? 'Nadiligan ko na' : 'Water plant'}&rdquo;
                </button>
                <button
                  onClick={() => handleVoiceCommand(lang === 'tl' ? 'Pinakain ko na ang aso' : 'Fed dog')}
                  className="p-2 bg-slate-50 border border-slate-150 hover:bg-indigo-50 hover:border-indigo-150 rounded-xl transition text-left cursor-pointer"
                >
                  🍖 &ldquo;{lang === 'tl' ? 'Pinakain ko na' : 'Fed pet'}&rdquo;
                </button>
                <button
                  onClick={() => handleVoiceCommand(lang === 'tl' ? 'Magdagdag ng halaman' : 'Add plant')}
                  className="p-2 bg-slate-50 border border-slate-150 hover:bg-indigo-50 hover:border-indigo-150 rounded-xl transition text-left cursor-pointer"
                >
                  🌱 &ldquo;{lang === 'tl' ? 'Magdagdag ng halaman' : 'Add new plant'}&rdquo;
                </button>
                <button
                  onClick={() => handleVoiceCommand(lang === 'tl' ? 'Magdagdag ng alaga' : 'Add pet')}
                  className="p-2 bg-slate-50 border border-slate-150 hover:bg-indigo-50 hover:border-indigo-150 rounded-xl transition text-left cursor-pointer"
                >
                  🐶 &ldquo;{lang === 'tl' ? 'Magdagdag ng alaga' : 'Add new pet'}&rdquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
