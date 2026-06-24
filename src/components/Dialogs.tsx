import React, { useState, useRef } from 'react';
import { Pet, Plant, Schedule, DiaryEntry, EntityType, UnifiedTaskType, NoteCategory, CareStatus, TaskStatus, TaskPriority } from '../types';
import { X, Plus, Sparkles, Heart, Leaf, HelpCircle, Activity, User, MapPin, Search as SearchIcon, ChevronRight, Clock, Flag } from 'lucide-react';
import { Language, translate } from '../utils/translations';
import { searchWikipedia, getWikipediaDetail, WikipediaPage } from '../utils/wikipediaService';
import { calculateAgeFromBirthDate } from '../data/mockData';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

// Preset gradients
export const AVATAR_GRADIENTS = [
  { name: 'Amber Glow', class: 'from-amber-400 to-orange-500' },
  { name: 'Amethyst', class: 'from-purple-400 to-indigo-600' },
  { name: 'Emerald', class: 'from-emerald-400 to-teal-600' },
  { name: 'Sky Breeze', class: 'from-sky-400 to-blue-600' },
  { name: 'Rose Petal', class: 'from-rose-400 to-pink-600' },
  { name: 'Sunset', class: 'from-orange-400 to-red-500' },
];

export const PET_EMOJIS = ['🐕', '🐈', '🦜', '🐇', '🐠', '🐢', '🐹', '🦎', '🐎', '🦔', '🐾'];
export const PLANT_EMOJIS = ['🌿', '🌱', '🪻', '🌵', '🪴', '🌸', '🌳', '🍀', '🌴', '🌻', '🍁'];

export const getHouseholdMembersList = () => {
  try {
    const saved = localStorage.getItem('care_system_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.familyModeEnabled === false) {
        return ['Ako'];
      }
      if (parsed.householdMembers && Array.isArray(parsed.householdMembers)) {
        return parsed.householdMembers;
      }
    }
  } catch (e) {}
  return ['Ako', 'Nanay', 'Tatay', 'Ate', 'Kuya', 'Bunso'];
};

// --- ADD PET MODAL ---
interface AddPetDialogProps extends DialogProps {
  onAdd: (pet: Omit<Pet, 'id'>) => void;
  existingPet?: Pet;
  onEdit?: (pet: Pet) => void;
}

export function PetDialog({ isOpen, onClose, onAdd, existingPet, onEdit, lang }: AddPetDialogProps) {
  const [name, setName] = useState(existingPet?.name || '');
  const [type, setType] = useState(existingPet?.type || 'Dog');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [age, setAge] = useState(existingPet?.age || '');
  const [birthDate, setBirthDate] = useState(existingPet?.birthDate || '');
  const [avatarColor, setAvatarColor] = useState(existingPet?.avatarColor || AVATAR_GRADIENTS[0].class);
  const [avatarEmoji, setAvatarEmoji] = useState(existingPet?.avatarEmoji || PET_EMOJIS[0]);
  
  // Advanced features
  const [assignedTo, setAssignedTo] = useState(existingPet?.assignedTo || getHouseholdMembersList()[0]);
  const [locationArea, setLocationArea] = useState(existingPet?.locationArea || 'Loob ng Bahay');
  const [maintenance, setMaintenance] = useState<'low' | 'high'>(existingPet?.maintenance || 'low');
  const [healthScore, setHealthScore] = useState<number>(existingPet?.healthScore || 100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const calculatedAge = birthDate ? calculateAgeFromBirthDate(birthDate) : age.trim();
    const payload = {
      name: name.trim(),
      type,
      breed: breed.trim(),
      age: calculatedAge,
      birthDate: birthDate || undefined,
      avatarColor,
      avatarEmoji,
      assignedTo,
      locationArea,
      maintenance,
      healthScore: Number(healthScore),
      photoTimeline: existingPet?.photoTimeline || [],
      streakCount: existingPet?.streakCount || 0
    };

    if (existingPet && onEdit) {
      onEdit({
        ...existingPet,
        ...payload
      });
    } else {
      onAdd(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-display font-semibold text-base text-slate-800 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Heart size={16} />
            </span>
            {existingPet ? translate('editPetProfile', lang) : translate('registerNewPet', lang)}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Pet Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('petName', lang)}</label>
            <input
              type="text"
              required
              placeholder="e.g., Sparky, Luna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('typeLabel', lang)}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition bg-white"
              >
                <option value="Dog">Dog 🐕</option>
                <option value="Cat">Cat 🐈</option>
                <option value="Bird">Bird 🦜</option>
                <option value="Rabbit">Rabbit 🐇</option>
                <option value="Fish">Fish 🐠</option>
                <option value="Reptile">Reptile 🦎</option>
                <option value="Other">Other 🐾</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('breedLabel', lang)}</label>
              <input
                type="text"
                placeholder="e.g., Golden Retriever"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('ageLabel', lang)}</label>
              <input
                type="text"
                placeholder="e.g., 2 years, 6 months"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {translate('filterMaintenance', lang)}
              </label>
              <select
                value={maintenance}
                onChange={(e) => setMaintenance(e.target.value as 'low' | 'high')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition bg-white"
              >
                <option value="low">{lang === 'tl' ? 'Mababa (Low)' : 'Low Maintenance'}</option>
                <option value="high">{lang === 'tl' ? 'Mataas (High)' : 'High Maintenance'}</option>
              </select>
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              {lang === 'tl' ? 'Petsa ng Kapanganakan' : 'Birth Date'}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition"
              />
              {birthDate && (
                <span className="text-xs text-orange-600 font-semibold whitespace-nowrap bg-orange-50 px-2 py-1.5 rounded-lg">
                  {calculateAgeFromBirthDate(birthDate)}
                </span>
              )}
            </div>
          </div>

          {/* Location Area & Caregiver Assigned */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {translate('locationLabel', lang)}
              </label>
              <select
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition bg-white"
              >
                <option value="Loob ng Bahay">{translate('areaIndoor', lang)}</option>
                <option value="Balkonahe">{translate('areaBalcony', lang)}</option>
                <option value="Hardin">{translate('areaGarden', lang)}</option>
                <option value="Likod-bahay (Outdoor)">{translate('areaOutdoor', lang)}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {translate('assignedToLabel', lang)}
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-slate-800 transition bg-white"
              >
                {getHouseholdMembersList().map((member) => (
                  <option key={member} value={member}>
                    {member === 'Ako' ? translate('familyMe', lang) : member}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Health score slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {translate('healthScore', lang)}
              </label>
              <span className="text-xs font-bold font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                {healthScore} / 100 HP
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={healthScore}
              onChange={(e) => setHealthScore(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Emoji Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Select Icon / Emoji</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 max-h-24 overflow-y-auto">
              {PET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center transition-all ${
                    avatarEmoji === emoji
                      ? 'bg-orange-500 text-white scale-110 shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Theme background */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Background Theme</label>
            <div className="grid grid-cols-6 gap-1.5">
              {AVATAR_GRADIENTS.map((gradient) => (
                <button
                  key={gradient.class}
                  type="button"
                  onClick={() => setAvatarColor(gradient.class)}
                  className={`h-7 rounded-lg bg-gradient-to-br ${gradient.class} relative flex items-center justify-center border transition-all ${
                    avatarColor === gradient.class
                      ? 'ring-2 ring-orange-500 border-white scale-105 shadow'
                      : 'border-transparent hover:scale-102'
                  }`}
                  title={gradient.name}
                >
                  {avatarColor === gradient.class && (
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              {translate('cancel', lang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-md transition text-xs"
            >
              {translate('confirm', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- ADD PLANT MODAL ---
interface AddPlantDialogProps extends DialogProps {
  onAdd: (plant: Omit<Plant, 'id'>) => void;
  existingPlant?: Plant;
  onEdit?: (plant: Plant) => void;
}

export function PlantDialog({ isOpen, onClose, onAdd, existingPlant, onEdit, lang }: AddPlantDialogProps) {
  const [name, setName] = useState(existingPlant?.name || '');
  const [species, setSpecies] = useState(existingPlant?.species || '');
  const [sunlight, setSunlight] = useState<'Low' | 'Medium' | 'High'>(existingPlant?.sunlight || 'Medium');
  const [avatarColor, setAvatarColor] = useState(existingPlant?.avatarColor || AVATAR_GRADIENTS[2].class);
  const [avatarEmoji, setAvatarEmoji] = useState(existingPlant?.avatarEmoji || PLANT_EMOJIS[0]);
  const [status, setStatus] = useState<CareStatus>(existingPlant?.status || 'Healthy');
  const [birthDate, setBirthDate] = useState(existingPlant?.birthDate || '');

  // Advanced features
  const [assignedTo, setAssignedTo] = useState(existingPlant?.assignedTo || getHouseholdMembersList()[0]);
  const [locationArea, setLocationArea] = useState(existingPlant?.locationArea || 'Loob ng Bahay');
  const [maintenance, setMaintenance] = useState<'low' | 'high'>(existingPlant?.maintenance || 'low');
  const [healthScore, setHealthScore] = useState<number>(existingPlant?.healthScore || 100);

  // Wikipedia search
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiResults, setWikiResults] = useState<WikipediaPage[]>([]);
  const [isWikiSearching, setIsWikiSearching] = useState(false);
  const [showWikiSearch, setShowWikiSearch] = useState(false);
  const [selectedWiki, setSelectedWiki] = useState<WikipediaPage | null>(null);

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
    try {
      const detail = await getWikipediaDetail(page.title);
      setSelectedWiki(detail || page);
    } catch {
      setSelectedWiki(page);
    }
  };

  const handleApplyWiki = () => {
    if (!selectedWiki) return;
    setSpecies(selectedWiki.title);
    setShowWikiSearch(false);
    setWikiQuery('');
    setWikiResults([]);
    setSelectedWiki(null);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      species: species.trim(),
      location: locationArea,
      sunlight,
      avatarColor,
      avatarEmoji,
      status,
      birthDate: birthDate || undefined,
      assignedTo,
      locationArea,
      maintenance,
      healthScore: Number(healthScore),
      photoTimeline: existingPlant?.photoTimeline || [],
      streakCount: existingPlant?.streakCount || 0
    };

    if (existingPlant && onEdit) {
      onEdit({
        ...existingPlant,
        ...payload
      });
    } else {
      onAdd(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-display font-semibold text-base text-slate-800 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <Leaf size={16} />
            </span>
            {existingPlant ? translate('editPlantProfile', lang) : translate('addPlantTitle', lang)}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Plant Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('plantName', lang)}</label>
            <input
              type="text"
              required
              placeholder="e.g., Living Room Monstera, Basil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('speciesLabel', lang)}</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g., Monstera Deliciosa"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowWikiSearch(!showWikiSearch)}
                  className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1"
                  title={lang === 'tl' ? 'Maghanap sa Wikipedia' : 'Search Wikipedia'}
                >
                  <SearchIcon size={14} />
                </button>
              </div>

              {/* Wikipedia search panel */}
              {showWikiSearch && (
                <div className="mt-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={wikiQuery}
                      onChange={(e) => setWikiQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleWikiSearch(); } }}
                      placeholder={lang === 'tl' ? 'Pangalan ng halaman...' : 'Plant name...'}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleWikiSearch}
                      disabled={isWikiSearching}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      {isWikiSearching ? '...' : (lang === 'tl' ? 'Hanapin' : 'Search')}
                    </button>
                  </div>
                  {wikiResults.length > 0 && (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {wikiResults.slice(0, 8).map((page) => (
                        <button
                          key={page.pageid}
                          type="button"
                          onClick={() => handleSelectWiki(page)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-xs text-slate-700 font-medium transition cursor-pointer flex items-center gap-2"
                        >
                          {page.thumbnail?.source && (
                            <img src={page.thumbnail.source} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                          )}
                          <span className="truncate font-bold">{page.title}</span>
                          <ChevronRight size={10} className="text-slate-300 ml-auto shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {wikiResults.length === 0 && !isWikiSearching && wikiQuery && (
                    <p className="text-xs text-slate-400 text-center py-1">
                      {lang === 'tl' ? 'Walang nahanap na resulta' : 'No results found'}
                    </p>
                  )}
                  {/* Selected wiki detail */}
                  {selectedWiki && (
                    <div className="bg-white rounded-lg border border-slate-100 p-2 space-y-1.5">
                      <div className="flex gap-2 items-start">
                        {selectedWiki.thumbnail?.source && (
                          <img src={selectedWiki.thumbnail.source} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">{selectedWiki.title}</p>
                          {selectedWiki.description && (
                            <p className="text-[8px] text-slate-400">{selectedWiki.description}</p>
                          )}
                        </div>
                      </div>
                      {selectedWiki.extract && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {selectedWiki.extract.slice(0, 200)}...
                        </p>
                      )}
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={handleApplyWiki}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          {lang === 'tl' ? 'Gamitin ang Pangalan' : 'Use This Name'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedWiki(null)}
                          className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          {lang === 'tl' ? 'Ibawal' : 'Dismiss'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {translate('filterMaintenance', lang)}
              </label>
              <select
                value={maintenance}
                onChange={(e) => setMaintenance(e.target.value as 'low' | 'high')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition bg-white"
              >
                <option value="low">{lang === 'tl' ? 'Mababa (Low)' : 'Low Maintenance'}</option>
                <option value="high">{lang === 'tl' ? 'Mataas (High)' : 'High Maintenance'}</option>
              </select>
            </div>
          </div>

          {/* Location Area & Caregiver Assigned */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {translate('locationLabel', lang)}
              </label>
              <select
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition bg-white"
              >
                <option value="Loob ng Bahay">{translate('areaIndoor', lang)}</option>
                <option value="Balkonahe">{translate('areaBalcony', lang)}</option>
                <option value="Hardin">{translate('areaGarden', lang)}</option>
                <option value="Likod-bahay (Outdoor)">{translate('areaOutdoor', lang)}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {translate('assignedToLabel', lang)}
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition bg-white"
              >
                {getHouseholdMembersList().map((member) => (
                  <option key={member} value={member}>
                    {member === 'Ako' ? translate('familyMe', lang) : member}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              {lang === 'tl' ? 'Petsa ng Pagtatanim' : 'Planting / Birth Date'}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition"
              />
              {birthDate && (
                <span className="text-xs text-emerald-600 font-semibold whitespace-nowrap bg-emerald-50 px-2 py-1.5 rounded-lg">
                  {calculateAgeFromBirthDate(birthDate)}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('sunlightLabel', lang)}</label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value as 'Low' | 'Medium' | 'High')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition bg-white"
              >
                <option value="Low">{translate('low', lang)} (Indirect) 🌥️</option>
                <option value="Medium">{translate('medium', lang)} (Partial) ⛅</option>
                <option value="High">{translate('high', lang)} (Direct) ☀️</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CareStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 transition bg-white"
              >
                <option value="Healthy">{translate('statusHealthy', lang)}</option>
                <option value="Needs Attention">{translate('statusWarning', lang)}</option>
                <option value="Critical">{translate('statusCritical', lang)}</option>
              </select>
            </div>
          </div>

          {/* Health score slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {translate('healthScore', lang)}
              </label>
              <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {healthScore} / 100 HP
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={healthScore}
              onChange={(e) => setHealthScore(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Emoji Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Select Icon / Emoji</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 max-h-24 overflow-y-auto">
              {PLANT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center transition-all ${
                    avatarEmoji === emoji
                      ? 'bg-emerald-500 text-white scale-110 shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Background gradient theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Background Theme</label>
            <div className="grid grid-cols-6 gap-1.5">
              {AVATAR_GRADIENTS.map((gradient) => (
                <button
                  key={gradient.class}
                  type="button"
                  onClick={() => setAvatarColor(gradient.class)}
                  className={`h-7 rounded-lg bg-gradient-to-br ${gradient.class} relative flex items-center justify-center border transition-all ${
                    avatarColor === gradient.class
                      ? 'ring-2 ring-emerald-500 border-white scale-105 shadow'
                      : 'border-transparent hover:scale-102'
                  }`}
                  title={gradient.name}
                >
                  {avatarColor === gradient.class && (
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              {translate('cancel', lang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md transition text-xs"
            >
              {translate('confirm', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- ADD CARE SCHEDULE / TASK MODAL ---
interface AddScheduleDialogProps extends DialogProps {
  pets: Pet[];
  plants: Plant[];
  onAdd: (sched: Omit<Schedule, 'id'>) => void;
  onUpdate?: (sched: Schedule) => void;
  editSchedule?: Schedule | null;
  preselectedEntityId?: string;
  preselectedEntityType?: 'pet' | 'plant';
}

export function ScheduleDialog({ isOpen, onClose, pets, plants, onAdd, onUpdate, editSchedule, preselectedEntityId, preselectedEntityType, lang }: AddScheduleDialogProps) {
  const [entityType, setEntityType] = useState<EntityType>(editSchedule?.entityType || preselectedEntityType || 'pet');
  const [entityId, setEntityId] = useState(editSchedule?.entityId || preselectedEntityId || (entityType === 'pet' ? pets[0]?.id : plants[0]?.id) || '');
  const [taskName, setTaskName] = useState(editSchedule?.name || '');
  const [taskType, setTaskType] = useState<UnifiedTaskType>(editSchedule?.taskType || 'feeding');
  const [intervalDays, setIntervalDays] = useState(editSchedule?.intervalDays || 1);
  const [reminderTime, setReminderTime] = useState(editSchedule?.reminderTime || '');
  const [priority, setPriority] = useState<TaskPriority>(editSchedule?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(editSchedule?.status || 'pending');

  if (!isOpen) return null;

  const currentEntities = entityType === 'pet' ? pets : plants;

  const handleTypeChange = (type: EntityType) => {
    setEntityType(type);
    const list = type === 'pet' ? pets : plants;
    setEntityId(list[0]?.id || '');
    setTaskType(type === 'pet' ? 'feeding' : 'watering');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId || !taskName.trim()) return;

    const selectedEntity = currentEntities.find((e) => e.id === entityId);
    if (!selectedEntity) return;

    if (editSchedule && onUpdate) {
      onUpdate({
        ...editSchedule,
        name: taskName.trim(),
        taskType,
        intervalDays: Number(intervalDays),
        reminderTime: reminderTime || undefined,
        priority,
        status,
      });
    } else {
      const d = new Date();
      d.setHours(d.getHours() + 1);
      onAdd({
        entityId,
        entityType,
        entityName: selectedEntity.name,
        taskType,
        name: taskName.trim(),
        intervalDays: Number(intervalDays),
        lastCompleted: null,
        nextDue: d.toISOString(),
        reminderTime: reminderTime || undefined,
        priority,
        status: 'pending',
        isArchived: false,
      });
    }

    setTaskName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-display font-semibold text-base text-slate-800 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
              <Sparkles size={16} />
            </span>
            {translate('addTaskTitle', lang)}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!preselectedEntityType && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{translate('categoryLabel', lang)}</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange('pet')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    entityType === 'pet' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  🐕 {lang === 'tl' ? 'Hayop' : 'Pet'}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('plant')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    entityType === 'plant' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  🌿 {lang === 'tl' ? 'Halaman' : 'Plant'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              {lang === 'tl' ? 'Pumili ng Profile' : `Select ${entityType === 'pet' ? 'Pet' : 'Plant'}`} *
            </label>
            <select
              required
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              disabled={!!preselectedEntityId}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition bg-white"
            >
              <option value="" disabled>-- Select Profile --</option>
              {currentEntities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('categoryLabel', lang)}</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as UnifiedTaskType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition bg-white"
              >
                {entityType === 'pet' ? (
                  <>
                    <option value="feeding">{lang === 'tl' ? 'Pagpapakain' : 'Feeding'} 🍖</option>
                    <option value="walking">{lang === 'tl' ? 'Pagpapasyal / Laro' : 'Walk / Play'} 🏃</option>
                    <option value="medicine">{lang === 'tl' ? 'Gamot' : 'Medicine'} 💊</option>
                    <option value="vet">{lang === 'tl' ? 'Beterinaryo' : 'Vet Checkup'} 🩺</option>
                    <option value="other">{lang === 'tl' ? 'Iba pang alaga' : 'Other Care'} 🧼</option>
                  </>
                ) : (
                  <>
                    <option value="watering">{lang === 'tl' ? 'Pagdidilig' : 'Watering'} 💧</option>
                    <option value="fertilizer">{lang === 'tl' ? 'Pataba / Fertilizer' : 'Fertilizer'} 🧪</option>
                    <option value="sunlight">{lang === 'tl' ? 'Iikot sa araw' : 'Sunlight Rotate'} ☀️</option>
                    <option value="other">{lang === 'tl' ? 'Ibang pag-aalaga' : 'Other Care'} 🪵</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('intervalDaysLabel', lang)}</label>
              <input
                type="number"
                min={1}
                max={365}
                required
                value={intervalDays}
                onChange={(e) => setIntervalDays(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('taskNameLabel', lang)} *</label>
            <input
              type="text"
              required
              placeholder={lang === 'tl' ? 'hal., Diligan ng 500ml' : 'e.g., Feed kibble, water morning soak'}
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                <Clock size={12} className="inline mr-1" />
                {lang === 'tl' ? 'Oras ng Paalala' : 'Reminder Time'}
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                <Flag size={12} className="inline mr-1" />
                {lang === 'tl' ? 'Priyoridad' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 transition bg-white"
              >
                <option value="low">{lang === 'tl' ? 'Mababa' : 'Low'} 🟢</option>
                <option value="medium">{lang === 'tl' ? 'Katamtaman' : 'Medium'} 🟡</option>
                <option value="high">{lang === 'tl' ? 'Mataas' : 'High'} 🔴</option>
              </select>
            </div>
          </div>

          {editSchedule && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {lang === 'tl' ? 'Katayuan' : 'Status'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                      status === s
                        ? s === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                          : s === 'in_progress'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'bg-green-100 text-green-700 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    {s === 'pending'
                      ? (lang === 'tl' ? 'Nakabinbin' : 'Pending')
                      : s === 'in_progress'
                      ? (lang === 'tl' ? 'Ginagawa' : 'In Progress')
                      : (lang === 'tl' ? 'Tapos' : 'Completed')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              {translate('cancel', lang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md transition text-xs"
            >
              {translate('confirm', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- ADD DIARY ENTRY / NOTE MODAL ---
interface AddDiaryDialogProps extends DialogProps {
  pets: Pet[];
  plants: Plant[];
  onAdd: (entry: Omit<DiaryEntry, 'id' | 'timestamp'>) => void;
  preselectedEntityId?: string;
  preselectedEntityType?: 'pet' | 'plant';
}

export function DiaryDialog({ isOpen, onClose, pets, plants, onAdd, preselectedEntityId, preselectedEntityType, lang }: AddDiaryDialogProps) {
  const [entityType, setEntityType] = useState<EntityType>(preselectedEntityType || 'pet');
  const [entityId, setEntityId] = useState(preselectedEntityId || (entityType === 'pet' ? pets[0]?.id : plants[0]?.id) || '');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [mood, setMood] = useState('Happy');
  const [tagsStr, setTagsStr] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentEntities = entityType === 'pet' ? pets : plants;

  const handleTypeChange = (type: EntityType) => {
    setEntityType(type);
    const list = type === 'pet' ? pets : plants;
    setEntityId(list[0]?.id || '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(lang === 'tl' ? 'Masyadong malaki ang file (max 5MB)' : 'File too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result as string);
      setUploadError(null);
    };
    reader.onerror = () => setUploadError('Failed to read file');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId || !text.trim()) return;

    const selectedEntity = currentEntities.find((e) => e.id === entityId);
    if (!selectedEntity) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onAdd({
      entityId,
      entityType,
      entityName: selectedEntity.name,
      text: text.trim(),
      category,
      tags: tags.length > 0 ? tags : [category],
      mood,
      photoUrl: photoData || undefined,
    });

    setText('');
    setTagsStr('');
    setPhotoData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-display font-semibold text-base text-slate-800 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-600">
              <Sparkles size={16} />
            </span>
            {translate('addDiaryTitle', lang)}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {!preselectedEntityType && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{translate('categoryLabel', lang)}</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange('pet')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    entityType === 'pet' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  🐕 {lang === 'tl' ? 'Hayop' : 'Pet'}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('plant')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    entityType === 'plant' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  🌿 {lang === 'tl' ? 'Halaman' : 'Plant'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              {lang === 'tl' ? 'Pumili ng Profile' : `Select ${entityType === 'pet' ? 'Pet' : 'Plant'}`} *
            </label>
            <select
              required
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              disabled={!!preselectedEntityId}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition bg-white"
            >
              <option value="" disabled>-- Select Profile --</option>
              {currentEntities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('categoryLabel', lang)}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition bg-white"
              >
                <option value="general">{lang === 'tl' ? 'Pangkalahatan' : 'General'}</option>
                <option value="observation">{lang === 'tl' ? 'Obserbasyon' : 'Observation'}</option>
                <option value="health">{lang === 'tl' ? 'Kalusugan' : 'Health / Diet'}</option>
                <option value="growth">{lang === 'tl' ? 'Paglaki / Haba' : 'Growth'}</option>
                <option value="behavior">{lang === 'tl' ? 'Ugali / Kilos' : 'Behavior'}</option>
                <option value="mood">Mood</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('moodLabel', lang)}</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition bg-white"
              >
                <option value="Happy">Happy 😊</option>
                <option value="Energetic">Energetic ⚡</option>
                <option value="Calm">Calm 😌</option>
                <option value="Tired">Tired 🥱</option>
                <option value="Anxious">Anxious 😰</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('observationText', lang)} *</label>
            <textarea
              required
              rows={3}
              placeholder={lang === 'tl' ? 'Sumulat ng tala tungkol sa alaga o halaman ngayon...' : 'Write down your observations, diet adjustments, or growth markers...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('tagsLabel', lang)}</label>
            <input
              type="text"
              placeholder="e.g., puppy, vaccination, sprout"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{translate('photoUrlLabel', lang)}</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            {!photoData ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 border-2 border-dashed border-teal-200 bg-teal-50/50 rounded-xl flex flex-col items-center gap-1 hover:bg-teal-50 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span className="text-xs font-bold text-teal-700">{lang === 'tl' ? 'Mag-upload ng Larawan' : 'Upload Image'}</span>
                <span className="text-[8px] text-slate-400">Max 5MB</span>
              </button>
            ) : (
              <div className="relative">
                <img src={photoData} alt="" className="w-full h-28 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setPhotoData(null)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-lg transition"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {uploadError && <p className="text-xs text-rose-600 font-semibold mt-1">{uploadError}</p>}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              {translate('cancel', lang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold text-white shadow-md transition text-xs"
            >
              {translate('confirm', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
