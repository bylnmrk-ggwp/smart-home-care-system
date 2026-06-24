import React, { useState, useMemo } from 'react';
import { Schedule, TaskStatus, TaskPriority } from '../types';
import { Language, translate } from '../utils/translations';
import { ClipboardList, Search, CheckCircle, Archive, Edit3, Clock, Flag, ChevronDown, Filter, ArrowUpDown } from 'lucide-react';

interface TasksSectionProps {
  lang: Language;
  schedules: Schedule[];
  onCompleteTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onOpenEditTask: (id: string) => void;
  onOpenAddTask: () => void;
}

type SortField = 'nextDue' | 'priority' | 'name';
type SortDir = 'asc' | 'desc';

const priorityOrder: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };

export function TasksSection({ lang, schedules, onCompleteTask, onArchiveTask, onUpdateStatus, onOpenEditTask, onOpenAddTask }: TasksSectionProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('nextDue');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const activeSchedules = useMemo(() => {
    return schedules.filter(s => !s.isArchived);
  }, [schedules]);

  const filtered = useMemo(() => {
    let items = activeSchedules;

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.entityName.toLowerCase().includes(q) ||
        s.taskType.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      items = items.filter(s => s.status === statusFilter);
    }

    items = [...items].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nextDue') {
        cmp = new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
      } else if (sortField === 'priority') {
        cmp = (priorityOrder[a.priority || 'medium'] || 2) - (priorityOrder[b.priority || 'medium'] || 2);
      } else if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [activeSchedules, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>;
      case 'in_progress': return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">In Progress</span>;
      case 'completed': return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Completed</span>;
    }
  };

  const getPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case 'high': return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">High</span>;
      case 'medium': return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Medium</span>;
      case 'low': return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Low</span>;
      default: return null;
    }
  };

  const isOverdue = (nextDue: string) => {
    return new Date(nextDue).getTime() < Date.now();
  };

  const nextStatus = (status: TaskStatus): TaskStatus => {
    if (status === 'pending') return 'in_progress';
    if (status === 'in_progress') return 'completed';
    return 'pending';
  };

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, in_progress: 0, completed: 0 };
    activeSchedules.forEach(s => { counts[s.status]++; });
    return counts;
  }, [activeSchedules]);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
            <ClipboardList size={16} />
          </div>
          <h2 className="font-display font-bold text-sm text-slate-800">
            {lang === 'tl' ? 'Mga Gawain' : 'Tasks'}
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{activeSchedules.length}</span>
        </div>
        <button
          onClick={onOpenAddTask}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          + {lang === 'tl' ? 'Bago' : 'New'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'tl' ? 'Maghanap ng gawain...' : 'Search tasks...'}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-slate-800 transition"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition ${
              statusFilter === s
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {s === 'all'
              ? (lang === 'tl' ? 'Lahat' : 'All')
              : s === 'pending'
              ? (lang === 'tl' ? 'Nakabinbin' : 'Pending')
              : s === 'in_progress'
              ? (lang === 'tl' ? 'Ginagawa' : 'In Progress')
              : (lang === 'tl' ? 'Tapos' : 'Completed')}
            {s !== 'all' && (
              <span className="ml-1 text-xs opacity-60">({statusCounts[s]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 text-xs">
        <Filter size={12} className="text-slate-400" />
        <span className="text-slate-400 font-medium">{lang === 'tl' ? 'Ayusin ayon sa:' : 'Sort by:'}</span>
        {(['nextDue', 'priority', 'name'] as SortField[]).map(f => (
          <button
            key={f}
            onClick={() => toggleSort(f)}
            className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
              sortField === f
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {f === 'nextDue' ? (lang === 'tl' ? 'Petsa' : 'Date') : f === 'priority' ? (lang === 'tl' ? 'Priyoridad' : 'Priority') : (lang === 'tl' ? 'Pangalan' : 'Name')}
            {sortField === f && (
              <ArrowUpDown size={10} className={`transition ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              {search || statusFilter !== 'all'
                ? (lang === 'tl' ? 'Walang nakitang gawain' : 'No tasks found')
                : (lang === 'tl' ? 'Wala pang gawain. Magdagdag ng bago!' : 'No tasks yet. Add a new one!')}
            </p>
          </div>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-xl border p-3 space-y-2 transition hover:shadow-sm ${
                task.status === 'completed' ? 'border-green-200 opacity-70' :
                isOverdue(task.nextDue) && task.status !== 'completed' ? 'border-red-200 bg-red-50/30' :
                'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-slate-800 truncate">{task.name}</span>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{task.entityType === 'pet' ? '🐕' : '🌿'} {task.entityName}</span>
                    <span className="text-slate-300">|</span>
                    <span className="capitalize">{task.taskType}</span>
                    {task.reminderTime && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {task.reminderTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {getStatusBadge(task.status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-semibold ${isOverdue(task.nextDue) && task.status !== 'completed' ? 'text-red-600' : 'text-slate-600'}`}>
                    {isOverdue(task.nextDue) && task.status !== 'completed' ? '⚠️ ' : ''}
                    {lang === 'tl' ? 'Due:' : 'Due:'} {formatDate(task.nextDue)} {formatTime(task.nextDue)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const ns = nextStatus(task.status);
                      if (ns === 'completed') {
                        onCompleteTask(task.id);
                      } else {
                        onUpdateStatus(task.id, ns);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition"
                    title={lang === 'tl' ? 'Markahan' : 'Mark status'}
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button
                    onClick={() => onOpenEditTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600 transition"
                    title={lang === 'tl' ? 'I-edit' : 'Edit'}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onArchiveTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
                    title={lang === 'tl' ? 'I-archive' : 'Archive'}
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>

              {task.status === 'completed' && task.completedAt && (
                <div className="text-xs text-green-600 font-medium">
                  {lang === 'tl' ? 'Natapos:' : 'Completed:'} {formatDate(task.completedAt)} {formatTime(task.completedAt)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
