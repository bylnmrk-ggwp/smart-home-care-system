import React, { useState } from 'react';
import { DiaryEntry, NoteCategory } from '../types';
import { Language, translate } from '../utils/translations';
import { Sparkles, Search, Trash2, MessageSquare, Plus } from 'lucide-react';

interface NotesSectionProps {
  lang: Language;
  diary: DiaryEntry[];
  deleteDiaryEntry: (id: string) => void;
  onOpenAddDiary: () => void;
}

export function NotesSection({ lang, diary, deleteDiaryEntry, onOpenAddDiary }: NotesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'pet' | 'plant'>('all');

  // Filter diary entries
  const filteredDiary = diary.filter((entry) => {
    const matchesSearch =
      entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;
    const matchesType = filterType === 'all' || entry.entityType === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'health': return 'bg-rose-50 text-rose-700 border-rose-150';
      case 'growth': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'behavior': return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'mood': return 'bg-orange-50 text-orange-700 border-orange-150';
      case 'observation': return 'bg-blue-50 text-blue-700 border-blue-150';
      default: return 'bg-slate-50 text-slate-700 border-slate-150';
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

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
            <Sparkles className="text-teal-600" size={18} />
            {translate('diary', lang)}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'tl' 
              ? 'Talaan at obserbasyon tungkol sa paglaki at kilos ng mga alaga at halaman.' 
              : 'Timeline of all growths, behaviors & care remarks.'}
          </p>
        </div>
        <button
          onClick={onOpenAddDiary}
          className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 font-bold text-xs text-white px-3 py-1.5 rounded-xl transition shadow-md"
        >
          <Plus size={14} /> {translate('addNote', lang)}
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'tl' ? 'Maghanap sa diary (hal. dahon, vet, #pagsibol)...' : 'Search diary (e.g., sprout, vet, #growth)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition bg-slate-50"
          />
        </div>

        {/* Entity toggle */}
        <div className="flex gap-1.5">
          {(['all', 'pet', 'plant'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-1 text-sm font-bold rounded-lg border transition ${
                filterType === type
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-black'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'all' 
                ? (lang === 'tl' ? 'Lahat ng Paksa' : 'All Subjects') 
                : type === 'pet' 
                  ? (lang === 'tl' ? '🐶 Hayop' : '🐶 Pets Only') 
                  : (lang === 'tl' ? '🌿 Halaman' : '🌿 Plants Only')}
            </button>
          ))}
        </div>

        {/* Category horizontal scroller */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none whitespace-nowrap scrollbar-none">
          {([
            { id: 'all', label: lang === 'tl' ? 'Lahat' : 'All Notes' },
            { id: 'health', label: '🩺 ' + (lang === 'tl' ? 'Kalusugan' : 'Health') },
            { id: 'growth', label: '🌱 ' + (lang === 'tl' ? 'Paglaki' : 'Growth') },
            { id: 'behavior', label: '🐕 ' + (lang === 'tl' ? 'Kilos' : 'Behavior') },
            { id: 'observation', label: '👀 ' + (lang === 'tl' ? 'Obserbasyon' : 'Observe') },
            { id: 'general', label: '📝 ' + (lang === 'tl' ? 'Pangkalahatan' : 'General') }
          ] as const).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition ${
                filterCategory === cat.id
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Diary Timeline Feed */}
      {filteredDiary.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 shadow-xs">
          <MessageSquare size={32} className="mx-auto text-slate-300 mb-2 animate-pulse" />
          <p className="font-bold text-slate-600 text-xs">
            {lang === 'tl' ? 'Walang nahanap na tala' : 'No entries found'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'tl' 
              ? 'Sumulat ng obserbasyon tungkol sa paglaki at kalusugan upang makita dito.' 
              : 'Write growth, health, or behavior remarks to populate the timeline.'}
          </p>
        </div>
      ) : (
        <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 pt-1">
          {filteredDiary.map((entry) => {
            const date = new Date(entry.timestamp);

            return (
              <div key={entry.id} className="relative group">
                {/* Visual bullet */}
                <span className={`absolute -left-[20.5px] top-1.5 w-3.5 h-3.5 rounded-full border bg-white flex items-center justify-center text-[7px] shadow-sm ${
                  entry.entityType === 'pet' ? 'border-orange-400 text-orange-600' : 'border-emerald-400 text-emerald-600'
                }`}>
                  {entry.entityType === 'pet' ? getMoodEmoji(entry.mood) : '🌿'}
                </span>

                <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-xs space-y-1.5 hover:border-slate-200 transition">
                  <div className="flex justify-between items-start gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        entry.entityType === 'pet'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {entry.entityName}
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                      {entry.mood && (
                        <span className="text-xs text-slate-500 bg-slate-50 px-1 rounded flex items-center gap-0.5">
                          <span>{getMoodEmoji(entry.mood)}</span>
                          <span>{entry.mood}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(lang === 'tl' ? 'Sigurado ka bang buburahin ang talang ito?' : 'Permanently delete this diary note?')) {
                          deleteDiaryEntry(entry.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-rose-500 transition"
                      title="Burahin"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.text}</p>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                    <span className="font-mono">
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &bull; {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {entry.tags.map((tag, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-500 font-mono rounded px-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
