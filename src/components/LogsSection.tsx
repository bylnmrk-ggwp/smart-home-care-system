import React, { useState } from 'react';
import { CareLog } from '../types';
import { Language, translate } from '../utils/translations';
import { ClipboardList, Search, Trash2, Clock } from 'lucide-react';

interface LogsSectionProps {
  lang: Language;
  logs: CareLog[];
  deleteLog: (id: string) => void;
}

export function LogsSection({ lang, logs, deleteLog }: LogsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pet' | 'plant'>('all');

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || log.entityType === filterType;

    return matchesSearch && matchesType;
  });

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'feeding': return '🍖';
      case 'walking': return '🏃';
      case 'medicine': return '💊';
      case 'vet': return '🩺';
      case 'watering': return '💧';
      case 'fertilizer': return '🧪';
      case 'sunlight': return '☀️';
      default: return '🧼';
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      <div className="px-1">
        <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
          <ClipboardList className="text-indigo-500" size={18} />
          {translate('logs', lang)}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang === 'tl' 
            ? 'Kasaysayan at talaan ng lahat ng nagawang mga gawain ng pag-aalaga.' 
            : 'Unified activity timeline of all completed tasks.'}
        </p>
      </div>

      {/* Search and Filters Hub */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'tl' ? 'Maghanap sa kasaysayan...' : 'Search logs (e.g., watering, Max)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition bg-slate-50"
          />
        </div>

        {/* Categories toggler */}
        <div className="flex gap-2">
          {(['all', 'pet', 'plant'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-grow py-1.5 text-xs font-bold rounded-xl border transition ${
                filterType === type
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-black'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              {type === 'all' 
                ? (lang === 'tl' ? 'Lahat' : 'All Logs') 
                : type === 'pet' 
                  ? (lang === 'tl' ? '🐶 Mga Alaga' : '🐶 Pets Only') 
                  : (lang === 'tl' ? '🌿 Halaman' : '🌿 Plants Only')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline output */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 shadow-xs">
          <ClipboardList size={32} className="mx-auto text-slate-300 mb-2 animate-pulse" />
          <p className="font-bold text-slate-600 text-xs">
            {lang === 'tl' ? 'Walang nahanap na kasaysayan' : 'No matching logs found'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'tl' 
              ? 'Magsagawa ng mga gawain sa Dashboard para magkaroon ng talaan dito.' 
              : 'Complete care tasks from the Home dashboard to see records here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => {
            const date = new Date(log.timestamp);
            return (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-slate-100 p-3 shadow-xs flex items-center justify-between gap-3 group hover:border-indigo-150 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl shrink-0">
                    {getTaskIcon(log.taskType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        log.entityType === 'pet'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {log.entityName}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-800 mt-1 truncate">{log.taskName}</h5>
                    {log.notes && (
                      <p className="text-xs text-slate-500 italic mt-0.5 truncate max-w-xs leading-none">
                        &ldquo;{log.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(lang === 'tl' ? 'Sigurado ka bang buburahin ang tala na ito?' : 'Permanently remove this task completion record?')) {
                        deleteLog(log.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-500 transition"
                    title="Burahin"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
