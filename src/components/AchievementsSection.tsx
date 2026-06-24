import React, { useState, useEffect } from 'react';
import { Language, translate } from '../utils/translations';
import { 
  Trophy, 
  Award, 
  Lock, 
  TrendingUp, 
  Calendar, 
  Star,
  Flame,
  Target,
  Zap,
  Filter
} from 'lucide-react';
import { 
  getAchievementsState, 
  checkAndUpdateAchievements, 
  Badge, 
  AchievementCheckParams,
  ALL_BADGES
} from '../utils/achievementStore';

interface AchievementsSectionProps {
  lang: Language;
  petCount: number;
  plantCount: number;
  totalTasksCompleted: number;
  totalWateringCompleted: number;
  totalFeedingCompleted: number;
  totalWalkingCompleted: number;
  totalMedicineCompleted: number;
  totalDiaryEntries: number;
  totalPhotosUploaded: number;
  currentStreak: number;
  maxStreak: number;
  healthyPetCount: number;
  healthyPlantCount: number;
  householdMemberCount: number;
  libraryEntryCount: number;
}

export function AchievementsSection({
  lang,
  petCount,
  plantCount,
  totalTasksCompleted,
  totalWateringCompleted,
  totalFeedingCompleted,
  totalWalkingCompleted,
  totalMedicineCompleted,
  totalDiaryEntries,
  totalPhotosUploaded,
  currentStreak,
  maxStreak,
  healthyPetCount,
  healthyPlantCount,
  householdMemberCount,
  libraryEntryCount,
}: AchievementsSectionProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  useEffect(() => {
    const params: AchievementCheckParams = {
      petCount,
      plantCount,
      totalTasksCompleted,
      totalWateringCompleted,
      totalFeedingCompleted,
      totalWalkingCompleted,
      totalMedicineCompleted,
      totalDiaryEntries,
      totalPhotosUploaded,
      currentStreak,
      maxStreak,
      healthyPetCount,
      healthyPlantCount,
      householdMemberCount,
      libraryEntryCount,
      unlockedBadgeCount: 0,
      earlyBirdTasks: 0,
      nightOwlTasks: 0,
      perfectWeekCount: 0,
    };

    const updatedBadges = checkAndUpdateAchievements(params);
    setBadges(updatedBadges);
  }, [
    petCount,
    plantCount,
    totalTasksCompleted,
    totalWateringCompleted,
    totalFeedingCompleted,
    totalWalkingCompleted,
    totalMedicineCompleted,
    totalDiaryEntries,
    totalPhotosUploaded,
    currentStreak,
    maxStreak,
    healthyPetCount,
    healthyPlantCount,
    householdMemberCount,
    libraryEntryCount,
  ]);

  const categories = [
    { id: 'all', label: lang === 'tl' ? 'Lahat' : 'All', icon: Trophy },
    { id: 'pet', label: lang === 'tl' ? 'Alaga' : 'Pet', icon: Award },
    { id: 'plant', label: lang === 'tl' ? 'Halaman' : 'Plant', icon: Award },
    { id: 'task', label: lang === 'tl' ? 'Gawain' : 'Task', icon: Target },
    { id: 'diary', label: lang === 'tl' ? 'Talaarawan' : 'Diary', icon: Calendar },
    { id: 'photo', label: lang === 'tl' ? 'Larawan' : 'Photo', icon: Star },
    { id: 'streak', label: lang === 'tl' ? 'Streak' : 'Streak', icon: Flame },
    { id: 'social', label: lang === 'tl' ? 'Sosyal' : 'Social', icon: Zap },
    { id: 'milestone', label: lang === 'tl' ? 'Milestone' : 'Milestone', icon: TrendingUp },
  ];

  const filteredBadges = badges.filter(badge => {
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesUnlocked = !showUnlockedOnly || badge.isUnlocked;
    return matchesCategory && matchesUnlocked;
  });

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const totalCount = badges.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  const getLevel = () => {
    if (unlockedCount >= 15) return { level: 5, name: lang === 'tl' ? 'Legend' : 'Legend', color: 'from-purple-500 to-pink-500' };
    if (unlockedCount >= 12) return { level: 4, name: lang === 'tl' ? 'Master' : 'Master', color: 'from-amber-500 to-orange-500' };
    if (unlockedCount >= 8) return { level: 3, name: lang === 'tl' ? 'Expert' : 'Expert', color: 'from-emerald-500 to-teal-500' };
    if (unlockedCount >= 4) return { level: 2, name: lang === 'tl' ? 'Skilled' : 'Skilled', color: 'from-blue-500 to-indigo-500' };
    return { level: 1, name: lang === 'tl' ? 'Novice' : 'Novice', color: 'from-slate-400 to-slate-500' };
  };

  const currentLevel = getLevel();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-lg tracking-tight flex items-center gap-2">
              <Trophy size={20} />
              {lang === 'tl' ? 'Mga Achievement' : 'Achievements & Badges'}
            </h2>
            <p className="text-sm text-amber-100 mt-1 leading-normal">
              {lang === 'tl' 
                ? 'Subaybayan ang iyong pag-unlad at makakuha ng mga badge!' 
                : 'Track your progress and earn badges for your care journey!'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{unlockedCount}/{totalCount}</div>
            <div className="text-xs text-amber-200 font-semibold">
              {lang === 'tl' ? 'Na-unlock' : 'Unlocked'}
            </div>
          </div>
        </div>
      </div>

      {/* Level & Progress */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center text-white font-black text-lg`}>
              {currentLevel.level}
            </div>
            <div>
              <div className="font-display font-bold text-slate-800 text-sm">
                {lang === 'tl' ? 'Antas' : 'Level'} {currentLevel.level}: {currentLevel.name}
              </div>
              <div className="text-xs text-slate-400">
                {lang === 'tl' ? 'Caregiver Rank' : 'Caregiver Rank'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-indigo-600 text-lg">{progressPercentage}%</div>
            <div className="text-xs text-slate-400">
              {lang === 'tl' ? 'Kabuuan' : 'Overall Progress'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Next Milestone */}
        {progressPercentage < 100 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-xl">
            <Target size={12} className="text-indigo-500" />
            <span className="font-semibold">
              {lang === 'tl' ? 'Susunod na milestone:' : 'Next milestone:'}
            </span>
            <span className="text-slate-700">
              {unlockedCount + 1}/{totalCount} {lang === 'tl' ? 'badge' : 'badges'}
            </span>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-xs">
          <div className="text-2xl font-black text-emerald-600">{maxStreak}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase">
            {lang === 'tl' ? 'Max Streak' : 'Max Streak'}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-xs">
          <div className="text-2xl font-black text-orange-600">{totalTasksCompleted}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase">
            {lang === 'tl' ? 'Tasks' : 'Tasks'}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-xs">
          <div className="text-2xl font-black text-purple-600">{totalDiaryEntries}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase">
            {lang === 'tl' ? 'Entries' : 'Entries'}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'tl' ? 'Filter ayon sa Kategorya' : 'Filter by Category'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon size={12} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Show Unlocked Only Toggle */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-3 shadow-xs">
        <span className="text-xs font-semibold text-slate-600">
          {lang === 'tl' ? 'Ipakita lang ang na-unlock' : 'Show unlocked only'}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredBadges.map(badge => (
          <div
            key={badge.id}
            className={`relative rounded-2xl border p-4 shadow-xs transition-all ${
              badge.isUnlocked
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                : 'bg-slate-50 border-slate-200 opacity-70'
            }`}
          >
            {/* Badge Icon */}
            <div className={`text-3xl mb-2 ${badge.isUnlocked ? '' : 'grayscale'}`}>
              {badge.icon}
            </div>

            {/* Badge Name */}
            <div className={`font-display font-bold text-xs mb-1 ${
              badge.isUnlocked ? 'text-slate-800' : 'text-slate-500'
            }`}>
              {lang === 'tl' ? badge.titleTl : badge.titleEn}
            </div>

            {/* Badge Description */}
            <div className="text-xs text-slate-500 leading-tight mb-2">
              {lang === 'tl' ? badge.descTl : badge.descEn}
            </div>

            {/* Progress Bar */}
            {!badge.isUnlocked && (
              <div className="mt-2">
                <div className="flex justify-between text-[8px] text-slate-400 mb-1">
                  <span>{lang === 'tl' ? 'Progreso' : 'Progress'}</span>
                  <span>{badge.progress}/{badge.requirement.count}</span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-400 rounded-full transition-all"
                    style={{ width: `${(badge.progress / badge.requirement.count) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lock Icon for locked badges */}
            {!badge.isUnlocked && (
              <div className="absolute top-2 right-2 p-1 bg-slate-200 rounded-full">
                <Lock size={10} className="text-slate-400" />
              </div>
            )}

            {/* Unlocked Date */}
            {badge.isUnlocked && badge.unlockedAt && (
              <div className="absolute top-2 right-2 text-[8px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                {new Date(badge.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-xs">
          <div className="text-4xl mb-3">🏆</div>
          <div className="font-display font-bold text-slate-600 text-sm mb-1">
            {lang === 'tl' ? 'Walang badge na nakita' : 'No badges found'}
          </div>
          <div className="text-xs text-slate-400">
            {lang === 'tl' 
              ? 'Subukang baguhin ang filter o magkaroon ng mga alaga at gawain!' 
              : 'Try changing filters or add pets, plants, and complete tasks!'}
          </div>
        </div>
      )}

      {/* Reward History */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs">📜</span>
          <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
            {lang === 'tl' ? 'Kasaysayan ng Reward' : 'Recent Unlocks'}
          </h3>
        </div>

        {badges.filter(b => b.isUnlocked).length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            {lang === 'tl' ? 'Wala pang na-unlock na badge' : 'No badges unlocked yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {badges
              .filter(b => b.isUnlocked)
              .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
              .slice(0, 5)
              .map(badge => (
                <div key={badge.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                  <div className="text-xl">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-700 truncate">
                      {lang === 'tl' ? badge.titleTl : badge.titleEn}
                    </div>
                    <div className="text-xs text-slate-400">
                      {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div className="text-emerald-600">
                    <Award size={14} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
