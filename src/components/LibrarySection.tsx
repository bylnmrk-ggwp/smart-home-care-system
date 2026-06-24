import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LIBRARY_PETS, LIBRARY_PLANTS, LibraryItem } from '../data/libraryData';
import { Language, translate } from '../utils/translations';
import { searchWikipedia, getWikipediaDetail, guessType, WikipediaPage } from '../utils/wikipediaService';
import {
  getAllUserItems, addUserItem, updateUserItem, deleteUserItem,
  searchUserItems, UserLibraryItem,
} from '../utils/userLibraryStore';
import { AddEditLibraryDialog } from './AddEditLibraryDialog';
import {
  Search, Heart, Leaf, ArrowLeft, Droplet, Sun, ShieldAlert,
  Sparkles, Compass, Smile, Utensils, Dumbbell, Globe,
  ChevronRight, ExternalLink, Plus, Pencil, Trash2, BookOpen,
  Wifi, WifiOff,
} from 'lucide-react';

interface LibrarySectionProps {
  lang: Language;
}

export function LibrarySection({ lang }: LibrarySectionProps) {
  const [tab, setTab] = useState<'library' | 'browse'>('library');
  const [selectedType, setSelectedType] = useState<'plant' | 'pet'>('plant');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail views
  const [selectedItem, setSelectedItem] = useState<LibraryItem | UserLibraryItem | null>(null);
  const [selectedWiki, setSelectedWiki] = useState<WikipediaPage | null>(null);

  // CRUD dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<UserLibraryItem | null>(null);

  // Wikipedia
  const [showWiki, setShowWiki] = useState(false);
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiResults, setWikiResults] = useState<WikipediaPage[]>([]);
  const [isWikiSearching, setIsWikiSearching] = useState(false);
  const [isWikiLoadingDetail, setIsWikiLoadingDetail] = useState(false);

  // Online state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const go = () => setIsOnline(true);
    const gf = () => setIsOnline(false);
    window.addEventListener('online', go);
    window.addEventListener('offline', gf);
    return () => { window.removeEventListener('online', go); window.removeEventListener('offline', gf); };
  }, []);

  // Re-render when user data changes
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // User + static items
  const q = searchQuery.toLowerCase();
  const userItems = searchUserItems(tab === 'library' ? searchQuery : '');

  // In browse mode, filter user items by type + search
  const browseUserItems = tab === 'browse'
    ? getAllUserItems().filter((item) => {
        const matchType = item.type === selectedType;
        const matchSearch = !q ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.scientificName.toLowerCase().includes(q) ||
          item.careInstructions.toLowerCase().includes(q) ||
          item.benefits.toLowerCase().includes(q);
        return matchType && matchSearch;
      })
    : [];

  const staticItems =
    tab === 'browse'
      ? (selectedType === 'plant' ? LIBRARY_PLANTS : LIBRARY_PETS).filter((item) => {
          return (
            !q ||
            item.name.toLowerCase().includes(q) ||
            (item.scientificName?.toLowerCase().includes(q)) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.purpose.toLowerCase().includes(q)
          );
        })
      : [];

  // Merged display list — browse shows static + user entries together
  const displayItems: (UserLibraryItem | LibraryItem)[] =
    tab === 'library' ? userItems : [...staticItems, ...browseUserItems];

  // Translated name helper
  const translateName = (name: string) => {
    if (lang === 'en') return name;
    const map: Record<string, string> = {
      'Aloe Vera': 'Aloe Vera (Sarsabila)',
      'Snake Plant': 'Snake Plant (Buntot-tigre)',
      'Peace Lily': 'Peace Lily (Lily ng Kapayapaan)',
      'Spider Plant': 'Spider Plant (Gamba)',
      'Fiddle Leaf Fig': 'Fiddle Leaf Fig (Dahon-biyolin)',
      'English Ivy': 'English Ivy (Halamang Gapang)',
      'Domestic Dog': 'Aso (Domestic Dog)',
      'Domestic Cat': 'Pusa (Domestic Cat)',
      'Parrot (Budgerigar)': 'Ibon / Loro',
      'Domestic Rabbit': 'Kuneho (Rabbit)',
      'Goldfish': 'Goldfish (Isdang Ginto)',
      'Leopard Gecko': 'Butiki / Gecko',
    };
    return map[name] || name;
  };

  // CRUD handlers
  const handleSave = (data: Omit<UserLibraryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editItem) {
      updateUserItem(editItem.id, data);
    } else {
      addUserItem(data);
    }
    setEditItem(null);
    triggerRefresh();
  };

  const handleEdit = (item: UserLibraryItem) => {
    setEditItem(item);
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'tl' ? 'Sigurado ka bang gusto mong burahin ito?' : 'Are you sure you want to delete this entry?')) {
      deleteUserItem(id);
      triggerRefresh();
    }
  };

  // Wikipedia handlers
  const handleWikiSearch = async () => {
    if (!wikiQuery.trim()) return;
    setIsWikiSearching(true);
    try {
      const results = await searchWikipedia(wikiQuery);
      setWikiResults(results);
    } catch {
      setWikiResults([]);
    }
    setIsWikiSearching(false);
  };

  const handleSelectWiki = async (page: WikipediaPage) => {
    setIsWikiLoadingDetail(true);
    try {
      const detail = await getWikipediaDetail(page.title);
      setSelectedWiki(detail || page);
    } catch {
      setSelectedWiki(page);
    }
    setIsWikiLoadingDetail(false);
  };

  const handleImportWiki = () => {
    if (!selectedWiki) return;
    const guessedType = guessType(selectedWiki.title, selectedWiki.description);
    setEditItem(null);
    setShowAddDialog(true);
    // We'll pass the data via a ref or close/reopen... simpler: set a timeout
    // Actually let's prefill the AddEditDialog via state
    // For now, close wiki detail and open dialog
    const detail = selectedWiki;
    setSelectedWiki(null);
    setShowWiki(false);
    // Triggers the dialog with prefill — we set a flag
    setWikiImportData({
      name: detail.title,
      description: detail.extract?.slice(0, 500) || detail.description || '',
      image: detail.thumbnail?.source || '',
      type: guessedType,
      importedFrom: `Wikipedia: ${detail.title}`,
    });
    setShowAddDialog(true);
  };

  const [wikiImportData, setWikiImportData] = useState<Partial<Omit<UserLibraryItem, 'id' | 'createdAt' | 'updatedAt'>> | null>(null);

  // Determine image source
  const getImage = (item: UserLibraryItem | LibraryItem): string => {
    if ('image' in item) return item.image;
    return (item as LibraryItem).image;
  };

  const getType = (item: UserLibraryItem | LibraryItem): 'plant' | 'pet' => {
    return item.type;
  };

  const getDescription = (item: UserLibraryItem | LibraryItem): string => {
    if ('careInstructions' in item && typeof item.careInstructions === 'string') {
      return item.description;
    }
    return (item as LibraryItem).description;
  };

  const getCategory = (item: UserLibraryItem | LibraryItem): string => {
    if ('category' in item) return (item as any).category || '';
    return '';
  };

  const getScientificName = (item: UserLibraryItem | LibraryItem): string => {
    if ('scientificName' in item) return (item as any).scientificName || '';
    return (item as LibraryItem).scientificName || '';
  };

  return (
    <div className="space-y-5 pb-8 relative min-h-[600px]">

      {/* Online/offline indicator */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
        isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}>
        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
        {isOnline
          ? (lang === 'tl' ? 'Online — Wikipedia at sync handa na' : 'Online — Wikipedia & sync ready')
          : (lang === 'tl' ? 'Offline — offline records lang' : 'Offline — offline records only')}
      </div>

      <AnimatePresence mode="wait">
        {/* Wikipedia detail view */}
        {selectedWiki ? (
          <motion.div key="wiki-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="space-y-4 pb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedWiki(null)} className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl transition shadow-sm">
                <ArrowLeft size={16} />
              </button>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wikipedia</span>
                <h3 className="font-display font-bold text-slate-800 text-sm leading-none mt-0.5">{lang === 'tl' ? 'Detalye' : 'Details'}</h3>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
              <div className="h-44 relative bg-slate-100">
                {selectedWiki.thumbnail?.source ? (
                  <img src={selectedWiki.thumbnail.source} alt={selectedWiki.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🪴</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h2 className="font-display font-bold text-base text-white drop-shadow-sm">{selectedWiki.title}</h2>
                  {selectedWiki.description && <p className="text-xs text-white/70">{selectedWiki.description}</p>}
                </div>
              </div>
            </div>
            {selectedWiki.extract && (
              <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'tl' ? 'Paglalarawan' : 'Description'}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedWiki.extract}</p>
              </div>
            )}
            <button onClick={handleImportWiki}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={14} />
              {lang === 'tl' ? 'I-import sa Aking Library' : 'Import to My Library'}
            </button>
            <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(selectedWiki.title)}`} target="_blank" rel="noopener noreferrer"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2">
              <ExternalLink size={14} />
              {lang === 'tl' ? 'Buksan sa Wikipedia' : 'Open in Wikipedia'}
            </a>
            <button onClick={() => setSelectedWiki(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
              <ArrowLeft size={14} />
              {lang === 'tl' ? 'Bumalik' : 'Back'}
            </button>
          </motion.div>

        /* Detail view for any entry */
        ) : selectedItem ? (
          <DetailView
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            lang={lang}
            translateName={translateName}
            onEdit={tab === 'library' && 'id' in selectedItem && selectedItem.id.startsWith('usr_')
              ? () => { handleEdit(selectedItem as UserLibraryItem); setSelectedItem(null); }
              : undefined}
            onDelete={tab === 'library' && 'id' in selectedItem && selectedItem.id.startsWith('usr_')
              ? () => { handleDelete((selectedItem as UserLibraryItem).id); setSelectedItem(null); }
              : undefined}
          />
        ) : (
          /* List view */
          <motion.div key="list-view" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="space-y-5">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
              <span className="text-2xl bg-indigo-100 p-2 rounded-xl text-indigo-700 shrink-0">📖</span>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">{translate('libraryTitle', lang)}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {lang === 'tl'
                    ? 'Mag-browse ng gabay sa pag-aalaga, sikat ng araw, pagkain, at iba pang pangangailangan ng mga alaga at halaman.'
                    : 'Browse care guides, environmental needs, and daily habits for common pets and home plants.'}
                </p>
              </div>
            </div>

            {/* Main tabs: My Library | Browse */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button onClick={() => { setTab('library'); setSearchQuery(''); setShowWiki(false); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
                  tab === 'library' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <BookOpen size={13} className="inline mr-1" />{lang === 'tl' ? 'Aking Library' : 'My Library'}
              </button>
              <button onClick={() => { setTab('browse'); setSearchQuery(''); setShowWiki(false); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
                  tab === 'browse' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <Globe size={13} className="inline mr-1" />{lang === 'tl' ? 'Browse' : 'Browse'}
              </button>
            </div>

            {/* Sub-tabs: Plants | Pets (only in browse mode) */}
            {tab === 'browse' && (
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setSelectedType('plant')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
                    selectedType === 'plant' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  <Leaf size={13} className="inline mr-1" />{lang === 'tl' ? 'Halaman' : 'Plants'}
                </button>
                <button onClick={() => setSelectedType('pet')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
                    selectedType === 'pet' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  <Heart size={13} className="inline mr-1" />{lang === 'tl' ? 'Alaga' : 'Pets'}
                </button>
              </div>
            )}

            {/* Search + Add button row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                <input type="text"
                  placeholder={lang === 'tl' ? 'Maghanap...' : `Search ${tab === 'library' ? 'your library' : (selectedType === 'plant' ? 'plants' : 'pets')}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400" />
              </div>
              <button onClick={() => { setEditItem(null); setWikiImportData(null); setShowAddDialog(true); }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer">
                <Plus size={14} />{lang === 'tl' ? 'Dagdag' : 'Add'}
              </button>
            </div>

            {/* Wikipedia toggle */}
            <div>
              <button onClick={() => setShowWiki(!showWiki)}
                  className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    showWiki ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                  }`}>
                  <Globe size={14} />
                  {lang === 'tl' ? 'Maghanap sa Wikipedia' : 'Search Wikipedia'}
                </button>
              </div>

            {/* Wikipedia search panel */}
            {showWiki && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <input type="text" value={wikiQuery}
                    onChange={(e) => setWikiQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleWikiSearch(); } }}
                    placeholder={lang === 'tl' ? 'Pangalan ng halaman o alaga...' : 'Plant or pet name...'}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-slate-800" />
                  <button onClick={handleWikiSearch} disabled={isWikiSearching}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer">
                    {isWikiSearching ? '...' : (lang === 'tl' ? 'Hanapin' : 'Search')}
                  </button>
                </div>
                {isWikiLoadingDetail && (
                  <div className="flex items-center justify-center py-4 text-xs text-slate-400 gap-2">
                    <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    {lang === 'tl' ? 'Kinukuha...' : 'Loading...'}
                  </div>
                )}
                {wikiResults.length > 0 && (
                  <div className="max-h-72 overflow-y-auto space-y-1 pt-1">
                    {wikiResults.map((page) => (
                      <button key={page.pageid} onClick={() => handleSelectWiki(page)}
                        className="w-full text-left px-2.5 py-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-xs text-slate-700 font-medium transition cursor-pointer flex items-center gap-2">
                        {page.thumbnail?.source && <img src={page.thumbnail.source} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-800 truncate block">{page.title}</span>
                          {page.description && <span className="text-xs text-slate-400 truncate block">{page.description}</span>}
                        </div>
                        <ChevronRight size={12} className="text-slate-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {wikiResults.length === 0 && !isWikiSearching && wikiQuery && (
                  <p className="text-xs text-slate-400 text-center py-2">{lang === 'tl' ? 'Walang nahanap' : 'No results'}</p>
                )}
              </div>
            )}

            {/* Empty state */}
            {displayItems.length === 0 && !showWiki && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-500 font-medium">
                  {tab === 'library'
                    ? (lang === 'tl' ? 'Wala pang entries. Magdagdag o maghanap sa Wikipedia!' : 'No entries yet. Add one or search Wikipedia!')
                    : (lang === 'tl' ? `Walang tugma para sa "${searchQuery}"` : `No guides match "${searchQuery}"`)}
                </p>
                {tab === 'library' && (
                  <button onClick={() => { setEditItem(null); setWikiImportData(null); setShowAddDialog(true); }}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5">
                    <Plus size={14} />{lang === 'tl' ? 'Magdagdag ng Entry' : 'Add Entry'}
                  </button>
                )}
              </div>
            )}

            {/* Card list */}
            {displayItems.length > 0 && (
              <div className="space-y-2">
                {displayItems.map((item) => {
                  const isUser = 'id' in item && (item as any).id?.startsWith('usr_');
                  const img = getImage(item);
                  const type = getType(item);
                  return (
                    <motion.div key={(item as any).id} whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-2xl border border-slate-200 p-3 hover:shadow-sm hover:border-indigo-200 transition cursor-pointer"
                      onClick={() => setSelectedItem(item)}>
                      <div className="flex gap-3 items-start">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            type === 'plant' ? '🪴' : '🐾'
                          )}
                        </div>
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display font-bold text-sm text-slate-800 leading-tight">
                              {tab === 'browse' ? translateName(item.name) : item.name}
                            </h4>
                            <ChevronRight size={14} className="text-slate-300 shrink-0 mt-0.5" />
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{getDescription(item).slice(0, 100)}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              type === 'plant' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {type === 'plant' ? (lang === 'tl' ? 'Halaman' : 'Plant') : (lang === 'tl' ? 'Alaga' : 'Pet')}
                            </span>
                            {getCategory(item) && (
                              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                {getCategory(item)}
                              </span>
                            )}
                            {isUser && (
                              <span className="text-[8px] text-indigo-400 font-semibold ml-auto">{lang === 'tl' ? 'Akin' : 'Mine'}</span>
                            )}
                          </div>
                          {/* CRUD buttons for user entries */}
                          {isUser && (
                            <div className="flex gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleEdit(item as UserLibraryItem)}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1">
                                <Pencil size={10} />{lang === 'tl' ? 'Baguhin' : 'Edit'}
                              </button>
                              <button onClick={() => handleDelete((item as UserLibraryItem).id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1">
                                <Trash2 size={10} />{lang === 'tl' ? 'Bura' : 'Delete'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Dialog */}
      <AddEditLibraryDialog
        isOpen={showAddDialog}
        onClose={() => { setShowAddDialog(false); setEditItem(null); setWikiImportData(null); }}
        onSave={(data) => { handleSave(data); setWikiImportData(null); }}
        lang={lang}
        editItem={editItem}
        prefill={wikiImportData}
      />
    </div>
  );
}

// Detail view sub-component
function DetailView({
  item, onBack, lang, translateName, onEdit, onDelete,
}: {
  item: LibraryItem | UserLibraryItem;
  onBack: () => void;
  lang: Language;
  translateName: (n: string) => string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const isUser = 'id' in item && (item as any).id?.startsWith('usr_');
  const type = item.type;
  const img = 'image' in item ? item.image : (item as LibraryItem).image;
  const name = item.name;
  const scientificName = 'scientificName' in item ? (item as any).scientificName : (item as LibraryItem).scientificName;
  const category = 'category' in item ? (item as any).category : (item as LibraryItem).category;
  const description = getDesc(item);
  const benefits = getBenefits(item);
  const careInstructions = getCare(item);

  function getDesc(i: LibraryItem | UserLibraryItem): string {
    if ('careInstructions' in i && typeof (i as any).careInstructions === 'string') return i.description;
    return (i as LibraryItem).description;
  }
  function getCare(i: LibraryItem | UserLibraryItem): string {
    if ('careInstructions' in i && typeof (i as any).careInstructions === 'string') return (i as any).careInstructions || '';
    const li = i as LibraryItem;
    return [li.careInstructions.wateringOrFeeding, li.careInstructions.sunlightOrEnvironment, li.careInstructions.soilOrExercise].join(' | ');
  }
  function getBenefits(i: LibraryItem | UserLibraryItem): string[] {
    if ('benefits' in i && typeof (i as any).benefits === 'string') return (i as any).benefits ? [(i as any).benefits] : [];
    return (i as LibraryItem).benefits;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl transition shadow-sm cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isUser ? (lang === 'tl' ? 'Aking Library' : 'My Library') : (lang === 'tl' ? 'Gabay' : 'Guide')}
          </span>
          <h3 className="font-display font-bold text-slate-800 text-sm leading-none mt-0.5">
            {isUser ? name : translateName(name)}
          </h3>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
        <div className="h-44 relative bg-slate-100">
          {img ? (
            <img src={img} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
              {type === 'plant' ? '🪴' : '🐾'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex gap-1.5 items-center flex-wrap">
              {category && (
                <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                  {category}
                </span>
              )}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 ${
                type === 'plant' ? 'bg-emerald-600/60 text-white' : 'bg-orange-600/60 text-white'
              }`}>
                {type === 'plant' ? (lang === 'tl' ? 'Halaman' : 'Plant') : (lang === 'tl' ? 'Alaga' : 'Pet')}
              </span>
            </div>
            <h2 className="font-display font-bold text-base mt-1 text-white leading-tight">{name}</h2>
            {scientificName && <p className="text-xs text-white/70 italic">{scientificName}</p>}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          {lang === 'tl' ? 'Paglalarawan' : 'Description'}
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed">{description}</p>
      </div>

      {/* Care Instructions */}
      {careInstructions && (
        <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles size={12} />{lang === 'tl' ? 'Pag-aalaga' : 'Care Instructions'}
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">{careInstructions}</p>
        </div>
      )}

      {/* Benefits */}
      {benefits.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Smile size={12} />{lang === 'tl' ? 'Benepisyo' : 'Benefits'}
          </h4>
          <ul className="space-y-1">
            {benefits.map((b, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2">
                <span className="text-emerald-500 shrink-0">&#10003;</span>{b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit/Delete buttons for user items */}
      {onEdit && onDelete && (
        <div className="flex gap-2">
          <button onClick={onEdit}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
            <Pencil size={14} />{lang === 'tl' ? 'Baguhin' : 'Edit'}
          </button>
          <button onClick={onDelete}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
            <Trash2 size={14} />{lang === 'tl' ? 'Burahin' : 'Delete'}
          </button>
        </div>
      )}

      <button onClick={onBack}
        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
        <ArrowLeft size={14} />
        {lang === 'tl' ? 'Bumalik' : 'Back'}
      </button>
    </motion.div>
  );
}
