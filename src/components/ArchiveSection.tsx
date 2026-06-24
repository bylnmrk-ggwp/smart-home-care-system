import React, { useState, useMemo } from 'react';
import { Schedule } from '../types';
import { Language, translate } from '../utils/translations';
import { Archive, Search, RotateCcw, Trash2, Clock } from 'lucide-react';

interface ArchiveSectionProps {
  lang: Language;
  schedules: Schedule[];
  onRestoreTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function ArchiveSection({ lang, schedules, onRestoreTask, onDeleteTask }: ArchiveSectionProps) {
  const [search, setSearch] = useState('');

  const archivedSchedules = useMemo(() => {
    return schedules.filter(s => s.isArchived);
  }, [schedules]);

  const filtered = useMemo(() => {
    if (!search.trim()) return archivedSchedules;
    const q = search.toLowerCase();
    return archivedSchedules.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.entityName.toLowerCase().includes(q)
    );
  }, [archivedSchedules, search]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'tl' ? 'fil-PH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(lang === 'tl' ? 'fil-PH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
          <Archive size={16} />
        </div>
        <h2 className="font-display font-bold text-sm text-slate-800">
          {lang === 'tl' ? 'Archive' : 'Archive'}
        </h2>
        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{archivedSchedules.length}</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'tl' ? 'Maghanap sa archive...' : 'Search archive...'}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-500 text-slate-800 transition"
        />
      </div>

      {/* Archived Task List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Archive size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              {search
                ? (lang === 'tl' ? 'Walang nakitang naka-archive' : 'No archived tasks found')
                : (lang === 'tl' ? 'Wala pang naka-archive na gawain' : 'No archived tasks yet')}
            </p>
          </div>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-slate-100 p-3 space-y-2 transition hover:shadow-sm opacity-80 hover:opacity-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-slate-800 truncate">{task.name}</span>
                    <span className="text-[9px] text-slate-400 capitalize px-1.5 py-0.5 bg-slate-100 rounded">Archived</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{task.entityType === 'pet' ? '🐕' : '🌿'} {task.entityName}</span>
                    <span className="text-slate-300">|</span>
                    <span className="capitalize">{task.taskType}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock size={10} />
                  <span>
                    {task.archivedAt
                      ? `${lang === 'tl' ? 'Na-archive:' : 'Archived:'} ${formatDate(task.archivedAt)}`
                      : `${lang === 'tl' ? 'Natapos:' : 'Completed:'} ${task.completedAt ? formatDate(task.completedAt) : formatDate(task.nextDue)}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRestoreTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition"
                    title={lang === 'tl' ? 'I-restore' : 'Restore'}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition"
                    title={lang === 'tl' ? 'Tanggalin' : 'Delete'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
