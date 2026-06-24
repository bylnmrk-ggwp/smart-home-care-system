import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Upload, Trash2, Edit3, Check, Camera } from 'lucide-react';
import { Language, translate } from '../utils/translations';

interface GalleryItem {
  id: string;
  date: string;
  photoUrl: string;
  label: string;
  notes?: string;
}

interface PhotoGalleryProps {
  items: GalleryItem[];
  lang: Language;
  onAdd: (photoUrl: string, label: string, notes?: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: { label?: string; notes?: string }) => void;
  title?: string;
  accentColor?: 'orange' | 'emerald';
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error('File too large (max 5MB)'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoGallery({
  items,
  lang,
  onAdd,
  onDelete,
  onUpdate,
  title,
  accentColor = 'orange',
}: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [slideshowTimer, setSlideshowTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOrange = accentColor === 'orange';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setNewPhoto(base64);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to read file');
    }
    e.target.value = '';
  };

  const handleAddPhoto = () => {
    if (!newPhoto || !newLabel.trim()) return;
    onAdd(newPhoto, newLabel.trim(), newNotes.trim() || undefined);
    setNewPhoto(null);
    setNewLabel('');
    setNewNotes('');
    setIsAdding(false);
  };

  const openCarousel = (index: number) => {
    setActiveIndex(index);
    if (slideshowTimer) clearInterval(slideshowTimer);
  };

  const closeCarousel = () => {
    setActiveIndex(null);
    if (slideshowTimer) clearInterval(slideshowTimer);
    setSlideshowTimer(null);
    setEditingId(null);
  };

  const goPrev = useCallback(() => {
    if (items.length === 0 || activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + items.length) % items.length);
    setEditingId(null);
  }, [activeIndex, items.length]);

  const goNext = useCallback(() => {
    if (items.length === 0 || activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % items.length);
    setEditingId(null);
  }, [activeIndex, items.length]);

  const startSlideshow = () => {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      setSlideshowTimer(null);
      return;
    }
    const timer = setInterval(() => {
      setActiveIndex(prev => {
        if (prev === null) return 0;
        return (prev + 1) % items.length;
      });
    }, 3000);
    setSlideshowTimer(timer);
  };

  const handleStartEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingId || !onUpdate) return;
    onUpdate(editingId, { label: editLabel.trim(), notes: editNotes.trim() });
    setEditingId(null);
  };

  useEffect(() => {
    return () => {
      if (slideshowTimer) clearInterval(slideshowTimer);
    };
  }, [slideshowTimer]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activeIndex === null) return;
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'Escape') closeCarousel();
  }, [activeIndex, goPrev, goNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const ac = isOrange
    ? { border: 'border-orange-200', bg: 'bg-orange-50', bgDark: 'bg-orange-600', text: 'text-orange-600', textDark: 'text-orange-700', focus: 'focus:border-orange-500', btn: 'bg-orange-500 hover:bg-orange-600', light: 'bg-orange-50/50' }
    : { border: 'border-emerald-200', bg: 'bg-emerald-50', bgDark: 'bg-emerald-600', text: 'text-emerald-600', textDark: 'text-emerald-700', focus: 'focus:border-emerald-500', btn: 'bg-emerald-600 hover:bg-emerald-700', light: 'bg-emerald-50/50' };

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
          <Camera size={15} className={ac.text} />
          {title}
        </h4>
      )}

      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className={`w-full p-3 border-2 border-dashed ${ac.border} ${ac.light} rounded-2xl flex flex-col items-center gap-1.5 transition hover:${ac.bg} cursor-pointer`}
        >
          <div className={`p-2 rounded-full ${ac.bg}`}>
            <Camera size={20} className={ac.text} />
          </div>
          <span className={`text-xs font-bold ${ac.textDark}`}>
            {lang === 'tl' ? 'Mag-upload ng Larawan' : 'Upload Photo'}
          </span>
          <span className="text-xs text-slate-400">
            {lang === 'tl' ? 'Max 5MB' : 'Max 5MB per image'}
          </span>
        </button>
      ) : (
        <div className={`p-3 rounded-2xl border ${ac.border} ${ac.light} space-y-2`}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          {!newPhoto ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-24 border-2 border-dashed ${ac.border} rounded-xl flex flex-col items-center justify-center gap-1 ${ac.light} hover:${ac.bg} transition cursor-pointer`}
            >
              <Camera size={18} className={ac.text} />
              <span className={`text-xs font-bold ${ac.textDark}`}>
                {lang === 'tl' ? 'Pumili ng Larawan' : 'Tap to select photo'}
              </span>
            </button>
          ) : (
            <div className="relative">
              <img src={newPhoto} alt="" className="w-full h-28 object-cover rounded-xl" />
              <button
                onClick={() => setNewPhoto(null)}
                className="absolute top-1 right-1 p-1 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-lg transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {uploadError && (
            <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
          )}
          <input
            type="text"
            required
            placeholder={lang === 'tl' ? 'Pamagat (hal., Unang araw)' : 'Caption (e.g., First day home)'}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className={`w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white ${ac.focus} text-slate-800`}
          />
          <textarea
            rows={2}
            placeholder={lang === 'tl' ? 'Mga tala (opsyonal)' : 'Notes (optional)'}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className={`w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white ${ac.focus} text-slate-800 resize-none`}
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewPhoto(null); setNewLabel(''); setNewNotes(''); setUploadError(null); }}
              className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              {translate('cancel', lang)}
            </button>
            <button
              onClick={handleAddPhoto}
              disabled={!newPhoto || !newLabel.trim()}
              className={`flex-1 py-1.5 rounded-lg ${ac.btn} disabled:bg-slate-300 text-xs font-bold text-white transition disabled:cursor-not-allowed`}
            >
              {translate('confirm', lang)}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-center text-xs text-slate-400 py-3 italic">
          {lang === 'tl' ? 'Wala pang mga larawan.' : 'No photos yet.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openCarousel(idx)}
                className="relative group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden cursor-pointer aspect-square"
              >
                <img
                  src={item.photoUrl}
                  alt={item.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-bold truncate leading-tight">{item.label}</p>
                  <p className="text-[7px] text-white/70 font-mono">{item.date}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition text-xs"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {activeIndex !== null && (
            <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center" onClick={closeCarousel}>
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); startSlideshow(); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${slideshowTimer ? 'bg-emerald-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  >
                    {slideshowTimer ? (lang === 'tl' ? 'Itigil' : 'Stop') : (lang === 'tl' ? 'Slide Show' : 'Slideshow')}
                  </button>
                </div>
                <button
                  onClick={closeCarousel}
                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full max-w-lg px-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={goPrev}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition shrink-0"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex-1 flex flex-col items-center min-w-0">
                  <img
                    src={items[activeIndex].photoUrl}
                    alt={items[activeIndex].label}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[55vh] object-contain rounded-xl"
                  />
                  {editingId === items[activeIndex].id ? (
                    <div className="w-full mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/50"
                      />
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/50 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs font-bold rounded-lg bg-white/20 hover:bg-white/30 text-white transition">{translate('cancel', lang)}</button>
                        <button onClick={handleSaveEdit} className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white transition"><Check size={12} className="inline" /> {translate('save', lang)}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full mt-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs font-bold text-white">{items[activeIndex].label}</p>
                      <p className="text-xs text-white/60 font-mono mt-0.5">{items[activeIndex].date}</p>
                      {items[activeIndex].notes && (
                        <p className="text-xs text-white/80 mt-1 max-w-xs mx-auto leading-relaxed">{items[activeIndex].notes}</p>
                      )}
                      {onUpdate && (
                        <button
                          onClick={() => handleStartEdit(items[activeIndex])}
                          className="mt-1.5 px-2 py-0.5 text-xs font-bold rounded-lg bg-white/20 hover:bg-white/30 text-white/80 transition inline-flex items-center gap-1"
                        >
                          <Edit3 size={10} /> {lang === 'tl' ? 'I-edit' : 'Edit'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={goNext}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition shrink-0"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="absolute bottom-4 flex gap-1" onClick={(e) => e.stopPropagation()}>
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveIndex(idx); setEditingId(null); }}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      idx === activeIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
