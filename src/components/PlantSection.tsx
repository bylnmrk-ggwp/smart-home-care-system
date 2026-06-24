import React, { useState } from 'react';
import { Plant, Schedule, DiaryEntry, CareLog, NoteCategory, CareStatus } from '../types';
import { Language, translate } from '../utils/translations';
import { PhotoGallery } from './PhotoGallery';
import {
  Leaf,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Clock,
  ArrowLeft,
  MapPin,
  Camera,
  Search,
  Filter,
  User,
  Activity,
  Sun
} from 'lucide-react';

interface PlantSectionProps {
  lang: Language;
  plants: Plant[];
  schedules: Schedule[];
  diary: DiaryEntry[];
  logs: CareLog[];
  addPlant: (plant: Omit<Plant, 'id'>) => void;
  updatePlant: (plant: Plant) => void;
  deletePlant: (id: string) => void;
  addSchedule: (sched: Omit<Schedule, 'id'>) => void;
  deleteSchedule: (id: string) => void;
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'timestamp'>) => void;
  deleteDiaryEntry: (id: string) => void;
  addPhotoToTimeline: (entityId: string, entityType: 'pet' | 'plant', photoUrl: string, label: string) => void;
  deletePhotoFromTimeline: (entityId: string, entityType: 'pet' | 'plant', photoId: string) => void;
  updatePhotoInTimeline: (entityId: string, entityType: 'pet' | 'plant', photoId: string, updates: { label?: string; notes?: string }) => void;
  onOpenAddPlant: () => void;
  onOpenAddTask: (entityId: string, entityType: 'plant') => void;
  onOpenEditTask: (scheduleId: string) => void;
}

export function PlantSection({
  lang,
  plants,
  schedules,
  diary,
  updatePlant,
  deletePlant,
  deleteSchedule,
  addDiaryEntry,
  deleteDiaryEntry,
  addPhotoToTimeline,
  deletePhotoFromTimeline,
  updatePhotoInTimeline,
  onOpenAddPlant,
  onOpenAddTask,
  onOpenEditTask,
}: PlantSectionProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  
  // Search and Advanced Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSunlight, setFilterSunlight] = useState('All');
  const [filterMaint, setFilterMaint] = useState('All');
  const [filterArea, setFilterArea] = useState('All');

  // Diary Entry Form State
  const [newDiaryText, setNewDiaryText] = useState('');
  const [newDiaryCategory, setNewDiaryCategory] = useState<NoteCategory>('observation');
  const [newDiaryTags, setNewDiaryTags] = useState('');

  // Selected Plant
  const selectedPlant = plants.find((p) => p.id === selectedPlantId);
  const plantSchedules = schedules.filter((s) => s.entityId === selectedPlantId);
  const plantDiary = diary.filter((d) => d.entityId === selectedPlantId);

  // Filter Plants list
  const filteredPlants = plants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.species && p.species.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSunlight = filterSunlight === 'All' || p.sunlight === filterSunlight;
    const matchesMaint = filterMaint === 'All' || p.maintenance === filterMaint;
    const matchesArea = filterArea === 'All' || p.locationArea === filterArea;

    return matchesSearch && matchesSunlight && matchesMaint && matchesArea;
  });

  const handleAddDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantId || !selectedPlant || !newDiaryText.trim()) return;

    const tags = newDiaryTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    addDiaryEntry({
      entityId: selectedPlantId,
      entityType: 'plant',
      entityName: selectedPlant.name,
      text: newDiaryText.trim(),
      category: newDiaryCategory,
      tags: tags.length > 0 ? tags : [newDiaryCategory],
    });

    setNewDiaryText('');
    setNewDiaryTags('');
    setNewDiaryCategory('observation');
  };

  const handleStatusChange = (newStatus: CareStatus) => {
    if (!selectedPlant) return;
    
    // Dynamically adjust health score based on status toggle
    let calculatedScore = 100;
    if (newStatus === 'Needs Attention') calculatedScore = 65;
    if (newStatus === 'Critical') calculatedScore = 35;

    updatePlant({
      ...selectedPlant,
      status: newStatus,
      healthScore: calculatedScore
    });

    addDiaryEntry({
      entityId: selectedPlant.id,
      entityType: 'plant',
      entityName: selectedPlant.name,
      text: lang === 'tl' 
        ? `Ang kalusugan ay pinalitan sa: "${translate(newStatus === 'Healthy' ? 'statusHealthy' : newStatus === 'Needs Attention' ? 'statusWarning' : 'statusCritical', lang)}"`
        : `Health status manually changed to: "${newStatus}"`,
      category: 'health',
      tags: ['health', 'status-update'],
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'health': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'growth': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'observation': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watering': return '💧';
      case 'fertilizer': return '🧪';
      case 'sunlight': return '☀️';
      default: return '🪵';
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
      
      {/* 1. PLANTS LIST / SEARCH & FILTER VIEW */}
      {!selectedPlantId ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
              <Leaf className="text-emerald-500" size={18} />
              {translate('plants', lang)}
            </h3>
            <button
              onClick={onOpenAddPlant}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white px-3 py-1.5 rounded-xl transition shadow-md"
            >
              <Plus size={14} /> {translate('addPlant', lang)}
            </button>
          </div>

          {/* Search and Advanced Filters */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={translate('searchPlaceholder', lang)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition bg-slate-50"
              />
            </div>

            {/* Filters selectors */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {translate('sunlightLabel', lang)}
                </label>
                <select
                  value={filterSunlight}
                  onChange={(e) => setFilterSunlight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-1 focus:outline-none text-slate-700"
                >
                  <option value="All">{lang === 'tl' ? 'Sikat ng Araw' : 'All Sunlight'}</option>
                  <option value="Low">Low 🌥️</option>
                  <option value="Medium">Medium ⛅</option>
                  <option value="High">High ☀️</option>
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
          {filteredPlants.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500">
              <span className="text-4xl">🌱</span>
              <h4 className="font-semibold text-slate-800 text-base mt-3">
                {lang === 'tl' ? 'Walang nahanap na halaman' : 'No Plants Found'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {lang === 'tl' ? 'Subukang palitan ang iyong mga filter o magdagdag ng bagong halaman.' : 'Try changing filters or add a new plant profile.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredPlants.map((plant) => {
                const relatedSchedules = schedules.filter((s) => s.entityId === plant.id);
                const score = plant.healthScore ?? 100;

                return (
                  <div
                    key={plant.id}
                    onClick={() => setSelectedPlantId(plant.id)}
                    className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 transition-all cursor-pointer shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plant.avatarColor} flex items-center justify-center text-3xl shadow-md shrink-0`}>
                        {plant.avatarEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-display font-bold text-slate-800 text-base leading-none">{plant.name}</h4>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${getScoreColor(score)} font-mono`}>
                            {score} HP
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{plant.species} &bull; {translate('sunlightLabel', lang)}: {translate(plant.sunlight, lang) || plant.sunlight}</p>
                        
                        <div className="flex gap-2 items-center mt-1.5 flex-wrap">
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-0.5">
                            <Activity size={9} />
                            {relatedSchedules.length} schedules
                          </span>
                          {plant.locationArea && (
                            <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                              <MapPin size={8} />
                              {plant.locationArea}
                            </span>
                          )}
                          {plant.assignedTo && (
                            <span className="text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">
                              {translate(`family${plant.assignedTo}`, lang) || plant.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 2. PLANT DETAIL EXPANDED VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPlantId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition px-1"
          >
            <ArrowLeft size={14} /> {translate('backToList', lang)}
          </button>

          {selectedPlant && (
            <div className="space-y-5">
              {/* Profile card Header */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className={`h-24 bg-gradient-to-br ${selectedPlant.avatarColor} relative`}>
                  <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-white p-1 shadow-md">
                    <div className={`w-full h-full bg-gradient-to-br ${selectedPlant.avatarColor} rounded-xl flex items-center justify-center text-3xl`}>
                      {selectedPlant.avatarEmoji}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-4 flex gap-1.5">
                    <button
                      onClick={() => {
                        if (confirm(`Burahin ang halaman na si ${selectedPlant.name}? Lahat ng tala at iskedyul ay mawawala.`)) {
                          deletePlant(selectedPlant.id);
                          setSelectedPlantId(null);
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
                      <h3 className="font-display font-bold text-xl text-slate-800 leading-none">{selectedPlant.name}</h3>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {translate('speciesLabel', lang)}: <strong className="text-slate-700">{selectedPlant.species}</strong> &bull; {translate('sunlightLabel', lang)}: <strong className="text-slate-700">{translate(selectedPlant.sunlight, lang) || selectedPlant.sunlight}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(selectedPlant.healthScore ?? 100)}`}>
                        {selectedPlant.healthScore ?? 100} HP
                      </span>
                      <span className="text-xs text-slate-400 mt-1">{getScoreStatusLabel(selectedPlant.healthScore ?? 100)}</span>
                    </div>
                  </div>

                  {/* Manual Status Selector */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'tl' ? 'BAGUHIN KALAGAYAN' : 'UPDATE HEALTH STATUS'}:
                    </span>
                    <select
                      value={selectedPlant.status}
                      onChange={(e) => handleStatusChange(e.target.value as CareStatus)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 focus:outline-none text-slate-700 font-semibold"
                    >
                      <option value="Healthy">{translate('statusHealthy', lang)}</option>
                      <option value="Needs Attention">{translate('statusWarning', lang)}</option>
                      <option value="Critical">{translate('statusCritical', lang)}</option>
                    </select>
                  </div>

                  {/* Core Tags detail */}
                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    {selectedPlant.locationArea && (
                      <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                        <MapPin size={9} />
                        {translate('locationLabel', lang)}: {selectedPlant.locationArea}
                      </span>
                    )}
                    {selectedPlant.maintenance && (
                      <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold">
                        {translate('filterMaintenance', lang)}: {selectedPlant.maintenance === 'low' ? (lang === 'tl' ? 'Madali' : 'Low') : (lang === 'tl' ? 'Mahirap' : 'High')}
                      </span>
                    )}
                    {selectedPlant.assignedTo && (
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                        <User size={9} />
                        {translate('assignedToLabel', lang)}: {translate(`family${selectedPlant.assignedTo}`, lang) || selectedPlant.assignedTo}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedules specific to Plant */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                    <Clock size={15} className="text-emerald-500" />
                    {translate('schedules', lang)}
                  </h4>
                  <button
                    onClick={() => onOpenAddTask(selectedPlant.id, 'plant')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-850 flex items-center gap-1"
                  >
                    <Plus size={12} /> {translate('addTask', lang)}
                  </button>
                </div>

                {plantSchedules.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    {lang === 'tl' ? 'Walang aktibong iskedyul.' : 'No active schedules set.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {plantSchedules.map((sched) => (
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

              {/* 📷 Plant Photo Gallery */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <PhotoGallery
                  items={selectedPlant.photoTimeline || []}
                  lang={lang}
                  title={translate('photoTimelineTitle', lang)}
                  accentColor="emerald"
                  onAdd={(photoUrl, label, notes) => addPhotoToTimeline(selectedPlant.id, 'plant', photoUrl, label)}
                  onDelete={(photoId) => deletePhotoFromTimeline(selectedPlant.id, 'plant', photoId)}
                  onUpdate={(photoId, updates) => updatePhotoInTimeline(selectedPlant.id, 'plant', photoId, updates)}
                />
              </div>

              {/* Diary Entries & Observations */}
              <div className="space-y-3">
                <h4 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sparkles size={15} className="text-emerald-500" />
                  {translate('observationsAndDiary', lang)}
                </h4>

                {/* Diary add form */}
                <form onSubmit={handleAddDiaryEntry} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newDiaryCategory}
                      onChange={(e) => setNewDiaryCategory(e.target.value as NoteCategory)}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="observation">{lang === 'tl' ? 'Obserbasyon' : 'Observe'} 👀</option>
                      <option value="growth">{lang === 'tl' ? 'Pagsibol / Paglaki' : 'Growth'} 🌱</option>
                      <option value="health">{lang === 'tl' ? 'Kalusugan' : 'Health'} 🩺</option>
                      <option value="general">{lang === 'tl' ? 'Pangkalahatan' : 'General'} 📝</option>
                    </select>
                  </div>

                  <textarea
                    required
                    rows={2}
                    placeholder={translate('observationTextPlaceholder', lang, { name: selectedPlant.name })}
                    value={newDiaryText}
                    onChange={(e) => setNewDiaryText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition resize-none"
                  />

                  <div className="flex gap-2 justify-between items-center">
                    <input
                      type="text"
                      placeholder="Tags (hal., dilig, pataba)"
                      value={newDiaryTags}
                      onChange={(e) => setNewDiaryTags(e.target.value)}
                      className="flex-grow max-w-[60%] px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-700 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl shadow-md transition"
                    >
                      {translate('addNote', lang)}
                    </button>
                  </div>
                </form>

                {/* Timeline displaying log nodes */}
                {plantDiary.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">{lang === 'tl' ? 'Walang tala pa.' : 'No diary entries yet.'}</p>
                ) : (
                  <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 pt-1">
                    {plantDiary.map((entry) => (
                      <div key={entry.id} className="relative group">
                        <div className="absolute -left-[20.5px] top-1.5 w-3.5 h-3.5 rounded-full border bg-white border-emerald-400 flex items-center justify-center text-[7px] shadow-sm">
                          🌱
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
