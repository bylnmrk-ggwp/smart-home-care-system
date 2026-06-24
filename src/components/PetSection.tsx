import React, { useState } from 'react';
import { Pet, Schedule, DiaryEntry, CareLog, NoteCategory } from '../types';
import { Language, translate } from '../utils/translations';
import { PhotoGallery } from './PhotoGallery';
import {
  Heart,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Clock,
  ArrowLeft,
  Activity,
  User,
  PlusCircle,
  Smile,
  CheckCircle2,
  Camera,
  Search,
  Filter,
  MapPin,
  Flame,
  Info
} from 'lucide-react';

interface PetSectionProps {
  lang: Language;
  pets: Pet[];
  schedules: Schedule[];
  diary: DiaryEntry[];
  logs: CareLog[];
  addPet: (pet: Omit<Pet, 'id'>) => void;
  updatePet: (pet: Pet) => void;
  deletePet: (id: string) => void;
  addSchedule: (sched: Omit<Schedule, 'id'>) => void;
  deleteSchedule: (id: string) => void;
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'timestamp'>) => void;
  deleteDiaryEntry: (id: string) => void;
  addPhotoToTimeline: (entityId: string, entityType: 'pet' | 'plant', photoUrl: string, label: string) => void;
  deletePhotoFromTimeline: (entityId: string, entityType: 'pet' | 'plant', photoId: string) => void;
  updatePhotoInTimeline: (entityId: string, entityType: 'pet' | 'plant', photoId: string, updates: { label?: string; notes?: string }) => void;
  onOpenAddPet: () => void;
  onOpenAddTask: (entityId: string, entityType: 'pet') => void;
  onOpenEditTask: (scheduleId: string) => void;
}

export function PetSection({
  lang,
  pets,
  schedules,
  diary,
  addPet,
  updatePet,
  deletePet,
  addSchedule,
  deleteSchedule,
  addDiaryEntry,
  deleteDiaryEntry,
  addPhotoToTimeline,
  deletePhotoFromTimeline,
  updatePhotoInTimeline,
  onOpenAddPet,
  onOpenAddTask,
  onOpenEditTask,
}: PetSectionProps) {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterMaint, setFilterMaint] = useState('All');
  const [filterArea, setFilterArea] = useState('All');

  // In-line diary entry form state
  const [newDiaryText, setNewDiaryText] = useState('');
  const [newDiaryCategory, setNewDiaryCategory] = useState<NoteCategory>('behavior');
  const [newDiaryMood, setNewDiaryMood] = useState('Happy');
  const [newDiaryTags, setNewDiaryTags] = useState('');

  // In-line expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'food' | 'vet' | 'supplies' | 'other'>('food');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Find currently selected pet
  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const petSchedules = schedules.filter((s) => s.entityId === selectedPetId);
  const petDiary = diary.filter((d) => d.entityId === selectedPetId);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !expenseAmount || isNaN(Number(expenseAmount))) return;

    const newExpense = {
      id: `exp-${Date.now()}`,
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: new Date().toISOString().split('T')[0],
      notes: expenseNotes.trim()
    };

    const updatedPet = {
      ...selectedPet,
      expenses: [...(selectedPet.expenses || []), newExpense]
    };

    updatePet(updatedPet);
    setExpenseAmount('');
    setExpenseNotes('');
  };

  const handleRemoveExpense = (expenseId: string) => {
    if (!selectedPet) return;
    const updatedExpenses = (selectedPet.expenses || []).filter(e => e.id !== expenseId);
    const updatedPet = {
      ...selectedPet,
      expenses: updatedExpenses
    };
    updatePet(updatedPet);
  };

  // Filter Pets list
  const filteredPets = pets.filter((pet) => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (pet.breed && pet.breed.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'All' || pet.type === filterType;
    const matchesMaint = filterMaint === 'All' || pet.maintenance === filterMaint;
    const matchesArea = filterArea === 'All' || pet.locationArea === filterArea;

    return matchesSearch && matchesType && matchesMaint && matchesArea;
  });

  const handleAddDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !selectedPet || !newDiaryText.trim()) return;

    const tags = newDiaryTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    addDiaryEntry({
      entityId: selectedPetId,
      entityType: 'pet',
      entityName: selectedPet.name,
      text: newDiaryText.trim(),
      category: newDiaryCategory,
      tags: tags.length > 0 ? tags : [newDiaryCategory],
      mood: newDiaryMood,
    });

    setNewDiaryText('');
    setNewDiaryTags('');
    setNewDiaryCategory('behavior');
    setNewDiaryMood('Happy');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'health': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'behavior': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'mood': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'observation': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'Happy': return '😊';
      case 'Energetic': return '⚡';
      case 'Calm': return '😌';
      case 'Tired': return '🥱';
      case 'Sick': return '🤒';
      case 'Anxious': return '😰';
      default: return '🐾';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'feeding': return '🍖';
      case 'walking': return '🏃';
      case 'medicine': return '💊';
      case 'vet': return '🩺';
      default: return '🧼';
    }
  };

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

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10">
      
      {/* 1. PETS LIST / SEARCH & FILTER VIEW */}
      {!selectedPetId ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
              <Heart className="text-orange-500" size={18} />
              {translate('pets', lang)}
            </h3>
            <button
              onClick={onOpenAddPet}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white px-3 py-1.5 rounded-xl transition shadow-md"
            >
              <Plus size={14} /> {translate('addPet', lang)}
            </button>
          </div>

          {/* Search and Advanced filter triggers */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={translate('searchPlaceholder', lang)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition bg-slate-50"
              />
            </div>

            {/* Selector Grid filters */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {translate('typeLabel', lang)}
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 focus:outline-none text-slate-700"
                >
                  <option value="All">{lang === 'tl' ? 'Lahat ng Uri' : 'All Types'}</option>
                  <option value="Dog">Dog 🐕</option>
                  <option value="Cat">Cat 🐈</option>
                  <option value="Bird">Bird 🦜</option>
                  <option value="Rabbit">Rabbit 🐇</option>
                  <option value="Fish">Fish 🐠</option>
                  <option value="Other">Other 🐾</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {translate('filterMaintenance', lang)}
                </label>
                <select
                  value={filterMaint}
                  onChange={(e) => setFilterMaint(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 focus:outline-none text-slate-700"
                >
                  <option value="All">{lang === 'tl' ? 'Antas' : 'Maintenance'}</option>
                  <option value="low">{lang === 'tl' ? 'Mababa' : 'Low'}</option>
                  <option value="high">{lang === 'tl' ? 'Mataas' : 'High'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {translate('locationLabel', lang)}
                </label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 focus:outline-none text-slate-700"
                >
                  <option value="All">{lang === 'tl' ? 'Lugar' : 'Area'}</option>
                  <option value="Loob ng Bahay">{lang === 'tl' ? 'Indoor' : 'Indoor'}</option>
                  <option value="Balkonahe">{lang === 'tl' ? 'Balkonahe' : 'Balcony'}</option>
                  <option value="Hardin">{lang === 'tl' ? 'Hardin' : 'Garden'}</option>
                  <option value="Likod-bahay (Outdoor)">{lang === 'tl' ? 'Outdoor' : 'Outdoor'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* List display */}
          {filteredPets.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500">
              <span className="text-4xl">🐕</span>
              <h4 className="font-semibold text-slate-800 text-base mt-3">
                {lang === 'tl' ? 'Walang nahanap na alaga' : 'No Pets Found'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {lang === 'tl' ? 'Subukang magbago ng filter o magdagdag ng bagong profile ng alaga.' : 'Try changing filters or register a new pet profile.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredPets.map((pet) => {
                const relatedSchedules = schedules.filter((s) => s.entityId === pet.id);
                const score = pet.healthScore ?? 100;

                return (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-orange-200 transition-all cursor-pointer shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pet.avatarColor} flex items-center justify-center text-3xl shadow-md shrink-0`}>
                        {pet.avatarEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-display font-bold text-slate-800 text-base leading-none">{pet.name}</h4>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(score)} border font-mono`}>
                            {score} HP
                          </span>
                          {/* Live Mood Indicator */}
                          {(() => {
                            const hasOverdue = relatedSchedules.some(s => new Date(s.nextDue) < new Date());
                            const emoji = (score < 50 || hasOverdue) ? '😟' : (score < 80) ? '😐' : '😊';
                            return (
                              <span className="text-xs" title={lang === 'tl' ? 'Pakiramdam' : 'Mood'}>
                                {emoji}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{pet.breed} &bull; {pet.age}</p>
                        <div className="flex gap-2 items-center mt-1.5 flex-wrap">
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-0.5">
                            <Activity size={9} />
                            {relatedSchedules.length} schedules
                          </span>
                          {pet.locationArea && (
                            <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                              <MapPin size={8} />
                              {pet.locationArea}
                            </span>
                          )}
                          {pet.assignedTo && (
                            <span className="text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">
                              {translate(`family${pet.assignedTo}`, lang) || pet.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 2. PET DETAIL EXPANDED VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPetId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition px-1"
          >
            <ArrowLeft size={14} /> {translate('backToList', lang)}
          </button>

          {selectedPet && (
            <div className="space-y-5">
              {/* Profile Card Header */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className={`h-24 bg-gradient-to-br ${selectedPet.avatarColor} relative`}>
                  <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-white p-1 shadow-md">
                    <div className={`w-full h-full bg-gradient-to-br ${selectedPet.avatarColor} rounded-xl flex items-center justify-center text-3xl`}>
                      {selectedPet.avatarEmoji}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-4 flex gap-1.5">
                    <button
                      onClick={() => {
                        if (confirm(`Burahin si ${selectedPet.name}? Lahat ng tala at iskedyul ay mawawala.`)) {
                          deletePet(selectedPet.id);
                          setSelectedPetId(null);
                        }
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition"
                      title="Burahin"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-8 px-6 pb-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-display font-bold text-xl text-slate-800 leading-none">{selectedPet.name}</h3>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {translate('typeLabel', lang)}: <strong className="text-slate-700">{selectedPet.type}</strong> &bull; {translate('breedLabel', lang)}: <strong className="text-slate-700">{selectedPet.breed || 'N/A'}</strong> &bull; {translate('ageLabel', lang)}: <strong className="text-slate-700">{selectedPet.age || 'N/A'}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(selectedPet.healthScore ?? 100)}`}>
                        {selectedPet.healthScore ?? 100} HP
                      </span>
                      <span className="text-xs text-slate-400 mt-1">{getScoreStatusLabel(selectedPet.healthScore ?? 100)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 text-xs">
                    {selectedPet.locationArea && (
                      <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                        <MapPin size={9} />
                        {translate('locationLabel', lang)}: {selectedPet.locationArea}
                      </span>
                    )}
                    {selectedPet.maintenance && (
                      <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                        {translate('filterMaintenance', lang)}: {selectedPet.maintenance === 'low' ? (lang === 'tl' ? 'Madali' : 'Low') : (lang === 'tl' ? 'Mahirap' : 'High')}
                      </span>
                    )}
                    {selectedPet.assignedTo && (
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                        <User size={9} />
                        {translate('assignedToLabel', lang)}: {translate(`family${selectedPet.assignedTo}`, lang) || selectedPet.assignedTo}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Pet Mood Tracker Widget */}
              {(() => {
                const petSchedulesList = schedules.filter(s => s.entityId === selectedPet.id);
                const hasOverdue = petSchedulesList.some(s => new Date(s.nextDue) < new Date());
                const score = selectedPet.healthScore ?? 100;
                
                let moodEmoji = '😊';
                let moodText = lang === 'tl' ? 'Masaya at Malusog' : 'Happy & Healthy';
                let moodColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                let moodDesc = lang === 'tl' ? 'Masigla at masaya ang iyong alaga ngayon! Mahusay ang pag-aalaga mo.' : 'Your pet is active and content! Keep up the good work.';

                if (score < 50 || hasOverdue) {
                  moodEmoji = '😟';
                  moodText = lang === 'tl' ? 'Kailangan ng Kalinga' : 'Needs Care';
                  moodColor = 'bg-rose-50 text-rose-800 border-rose-100';
                  moodDesc = lang === 'tl' ? 'May mga huling gawain o mababang HP. Paki-asikaso agad!' : 'Has overdue tasks or low health. Take care of them soon!';
                } else if (score < 80) {
                  moodEmoji = '😐';
                  moodText = lang === 'tl' ? 'Kalmado / OK' : 'Calm / Neutral';
                  moodColor = 'bg-amber-50 text-amber-800 border-amber-100';
                  moodDesc = lang === 'tl' ? 'Maayos naman ang kalagayan ng iyong alaga sa ngayon.' : 'Your pet is in a stable, normal mood today.';
                }

                return (
                  <div className={`p-3.5 rounded-2xl border ${moodColor} shadow-xs flex items-start gap-3 transition-all`}>
                    <span className="text-3xl shrink-0">{moodEmoji}</span>
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider opacity-90">
                        {lang === 'tl' ? 'Pakiramdam ng Alaga' : 'Pet Mood'}
                      </h4>
                      <p className="text-xs font-black mt-0.5">{moodText}</p>
                      <p className="text-xs opacity-85 leading-normal mt-0.5">{moodDesc}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Pet Expense Tracker Widget */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-50">
                  <h4 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="p-1 bg-amber-50 rounded-lg text-amber-500 font-mono font-bold text-xs">₱</span>
                    {lang === 'tl' ? 'Tagasubaybay ng Gastos' : 'Pet Expense Tracker'}
                  </h4>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-mono">
                    Total: ₱{(selectedPet.expenses || []).reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                  </span>
                </div>

                {/* Form to log expense */}
                <form onSubmit={handleAddExpense} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'tl' ? 'Halaga (₱)' : 'Amount (₱)'}
                      </label>
                      <input
                        type="number"
                        placeholder="₱0.00"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        required
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'tl' ? 'Kategorya' : 'Category'}
                      </label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value as any)}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 text-slate-700"
                      >
                        <option value="food">{lang === 'tl' ? 'Pagkain' : 'Food'}</option>
                        <option value="vet">{lang === 'tl' ? 'Beterinaryo' : 'Vet Care'}</option>
                        <option value="supplies">{lang === 'tl' ? 'Gamit / Supplies' : 'Supplies'}</option>
                        <option value="other">{lang === 'tl' ? 'Iba pa' : 'Other'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {lang === 'tl' ? 'Mga Tala o Detalye' : 'Expense Details'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === 'tl' ? 'hal. Bumili ng kibble, bakuna' : 'e.g. Bought kibble, vaccines'}
                        value={expenseNotes}
                        onChange={(e) => setExpenseNotes(e.target.value)}
                        className="flex-grow px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 font-bold text-xs text-white rounded-lg transition shrink-0"
                      >
                        {lang === 'tl' ? 'I-log' : 'Log'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Expense List */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1 border-t border-slate-50">
                  {(!selectedPet.expenses || selectedPet.expenses.length === 0) ? (
                    <p className="text-xs text-slate-400 text-center py-2.5 italic">
                      {lang === 'tl' ? 'Walang naitalang gastos.' : 'No expenses logged yet.'}
                    </p>
                  ) : (
                    selectedPet.expenses.slice().reverse().map((exp) => (
                      <div key={exp.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs px-1.5 py-0.2 rounded-full font-mono bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                              {exp.category === 'food' ? (lang === 'tl' ? 'Pagkain' : 'Food') : exp.category === 'vet' ? (lang === 'tl' ? 'Vet' : 'Vet') : exp.category === 'supplies' ? (lang === 'tl' ? 'Gamit' : 'Supplies') : (lang === 'tl' ? 'Iba' : 'Other')}
                            </span>
                            <span className="font-bold text-slate-800 font-mono">₱{exp.amount}</span>
                          </div>
                          {exp.notes && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{exp.notes}</p>
                          )}
                          <span className="text-[8px] text-slate-400 font-mono block mt-0.5">{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpense(exp.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Schedules specific to Pet */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    <Clock size={15} className="text-orange-500" />
                    {translate('schedules', lang)}
                  </h4>
                  <button
                    onClick={() => onOpenAddTask(selectedPet.id, 'pet')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
                  >
                    <Plus size={12} /> {translate('addTask', lang)}
                  </button>
                </div>

                {petSchedules.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    {lang === 'tl' ? 'Walang aktibong iskedyul.' : 'No active schedules set.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {petSchedules.map((sched) => (
                      <div key={sched.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1 bg-slate-50 rounded-lg">{getTaskIcon(sched.taskType)}</span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">{sched.name}</h5>
                            <p className="text-xs text-slate-400">
                              Every {sched.intervalDays}d &bull; Next: {new Date(sched.nextDue).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onOpenEditTask(sched.id)}
                            className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-300 hover:text-indigo-500 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Burahin ang iskedyul ng "${sched.name}"?`)) {
                                deleteSchedule(sched.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 📷 Photo Gallery */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <PhotoGallery
                  items={selectedPet.photoTimeline || []}
                  lang={lang}
                  title={translate('photoTimelineTitle', lang)}
                  accentColor="orange"
                  onAdd={(photoUrl, label, notes) => addPhotoToTimeline(selectedPet.id, 'pet', photoUrl, label)}
                  onDelete={(photoId) => deletePhotoFromTimeline(selectedPet.id, 'pet', photoId)}
                  onUpdate={(photoId, updates) => updatePhotoInTimeline(selectedPet.id, 'pet', photoId, updates)}
                />
              </div>

              {/* Diary Observations */}
              <div className="space-y-3">
                <h4 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sparkles size={15} className="text-orange-500" />
                  {translate('observationsAndDiary', lang)}
                </h4>

                {/* Diary input */}
                <form onSubmit={handleAddDiaryEntry} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newDiaryCategory}
                      onChange={(e) => setNewDiaryCategory(e.target.value as NoteCategory)}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:border-orange-500 font-semibold"
                    >
                      <option value="behavior">{lang === 'tl' ? 'Ugali' : 'Behavior'} 🐕</option>
                      <option value="health">{lang === 'tl' ? 'Kalusugan' : 'Health'} 🩺</option>
                      <option value="mood">Mood 😊</option>
                      <option value="observation">{lang === 'tl' ? 'Tala' : 'Observe'} 👀</option>
                      <option value="general">{lang === 'tl' ? 'Pangkalahatan' : 'General'} 📝</option>
                    </select>

                    <select
                      value={newDiaryMood}
                      onChange={(e) => setNewDiaryMood(e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:border-orange-500 font-semibold"
                    >
                      <option value="Happy">Happy 😊</option>
                      <option value="Energetic">Energetic ⚡</option>
                      <option value="Calm">Calm 😌</option>
                      <option value="Tired">Tired 🥱</option>
                      <option value="Sick">Sick 🤒</option>
                      <option value="Anxious">Anxious 😰</option>
                    </select>
                  </div>

                  <textarea
                    required
                    rows={2}
                    placeholder={translate('observationTextPlaceholder', lang, { name: selectedPet.name })}
                    value={newDiaryText}
                    onChange={(e) => setNewDiaryText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition resize-none"
                  />

                  <div className="flex gap-2 justify-between items-center">
                    <input
                      type="text"
                      placeholder="Tags (hal., bakuna, diet)"
                      value={newDiaryTags}
                      onChange={(e) => setNewDiaryTags(e.target.value)}
                      className="flex-grow max-w-[60%] px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-700 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white rounded-xl shadow-md transition"
                    >
                      {translate('addNote', lang)}
                    </button>
                  </div>
                </form>

                {/* Timeline rendering */}
                {petDiary.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">{lang === 'tl' ? 'Walang tala pa.' : 'No diary entries yet.'}</p>
                ) : (
                  <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 pt-1">
                    {petDiary.map((entry) => (
                      <div key={entry.id} className="relative group">
                        <div className="absolute -left-[20.5px] top-1.5 w-3.5 h-3.5 rounded-full border bg-white border-orange-400 flex items-center justify-center text-[7px] shadow-sm">
                          {getMoodEmoji(entry.mood)}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-xs space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border ${getCategoryColor(entry.category)}`}>
                              {entry.category}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm('Burahin ang tala?')) {
                                  deleteDiaryEntry(entry.id);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-rose-500 transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">{entry.text}</p>

                          <div className="flex justify-between items-center text-[8px] text-slate-400 pt-1 font-mono">
                            <span>
                              {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="flex gap-1">
                              {entry.tags.map((t, idx) => (
                                <span key={idx} className="bg-slate-50 text-slate-500 px-1 rounded">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
