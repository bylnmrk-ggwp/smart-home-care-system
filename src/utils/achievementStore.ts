interface Requirement {
  type: string;
  count: number;
}

interface Badge {
  id: string;
  titleEn: string;
  titleTl: string;
  descEn: string;
  descTl: string;
  icon: string;
  category: 'pet' | 'plant' | 'task' | 'diary' | 'photo' | 'streak' | 'social' | 'milestone';
  requirement: Requirement;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

interface AchievementCheckParams {
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
  unlockedBadgeCount: number;
  earlyBirdTasks: number;
  nightOwlTasks: number;
  perfectWeekCount: number;
}

const ALL_BADGES: Badge[] = [
  {
    id: 'new_caregiver',
    titleEn: 'New Caregiver',
    titleTl: 'Bagong Tagapag-alaga',
    descEn: 'Register your first pet or plant',
    descTl: 'Magrehistro ng unang alaga o halaman',
    icon: '🏡',
    category: 'pet',
    requirement: { type: 'first_pet_or_plant', count: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'plant_parent',
    titleEn: 'Plant Parent',
    titleTl: 'Magulang ng Halaman',
    descEn: 'Register 3 plants',
    descTl: 'Magrehistro ng 3 halaman',
    icon: '🌱',
    category: 'plant',
    requirement: { type: 'register_plant', count: 3 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'pet_lover',
    titleEn: 'Pet Lover',
    titleTl: 'Mahilig sa Alaga',
    descEn: 'Register 3 pets',
    descTl: 'Magrehistro ng 3 alaga',
    icon: '🐾',
    category: 'pet',
    requirement: { type: 'register_pet', count: 3 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'water_master',
    titleEn: 'Water Master',
    titleTl: 'Master sa Pagdidilig',
    descEn: 'Complete 10 watering tasks',
    descTl: 'Makatapos ng 10 gawaing pagdidilig',
    icon: '💧',
    category: 'task',
    requirement: { type: 'task_complete', count: 10 },
    isUnlocked: false,
    progress: 0,
    // Note: this badge's progress specifically tracks watering tasks
  },
  {
    id: 'feeding_frenzy',
    titleEn: 'Feeding Frenzy',
    titleTl: 'Sabaw sa Pagpapakain',
    descEn: 'Complete 10 feeding tasks',
    descTl: 'Makatapos ng 10 gawaing pagpapakain',
    icon: '🍖',
    category: 'task',
    requirement: { type: 'feeding_complete', count: 10 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'walk_leader',
    titleEn: 'Walk Leader',
    titleTl: 'Pinuno ng Paglalakad',
    descEn: 'Complete 10 walking tasks',
    descTl: 'Makatapos ng 10 gawaing paglalakad',
    icon: '🏃',
    category: 'task',
    requirement: { type: 'walking_complete', count: 10 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'medicine_keeper',
    titleEn: 'Medicine Keeper',
    titleTl: 'Tagapag-ingat ng Gamot',
    descEn: 'Complete 5 medicine tasks',
    descTl: 'Makatapos ng 5 gawaing gamutan',
    icon: '💊',
    category: 'task',
    requirement: { type: 'medicine_complete', count: 5 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'diary_keeper',
    titleEn: 'Diary Keeper',
    titleTl: 'Tagapagsulat ng Talaarawan',
    descEn: 'Write 5 diary entries',
    descTl: 'Magsulat ng 5 tala sa talaarawan',
    icon: '📝',
    category: 'diary',
    requirement: { type: 'diary_entry', count: 5 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'photo_bug',
    titleEn: 'Photo Bug',
    titleTl: 'Mahilig sa Larawan',
    descEn: 'Upload 5 photos',
    descTl: 'Mag-upload ng 5 larawan',
    icon: '📷',
    category: 'photo',
    requirement: { type: 'photo_upload', count: 5 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'streak_7',
    titleEn: '7-Day Streak',
    titleTl: '7-Araw na Streak',
    descEn: 'Maintain a 7 day streak',
    descTl: 'Panatilihin ang 7 araw na streak',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'max_streak', count: 7 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'streak_30',
    titleEn: '30-Day Streak',
    titleTl: '30-Araw na Streak',
    descEn: 'Maintain a 30 day streak',
    descTl: 'Panatilihin ang 30 araw na streak',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'max_streak', count: 30 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'task_master',
    titleEn: 'Task Master',
    titleTl: 'Panginoon ng Gawain',
    descEn: 'Complete 50 tasks',
    descTl: 'Makatapos ng 50 gawain',
    icon: '⭐',
    category: 'task',
    requirement: { type: 'task_complete', count: 50 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'green_thumb',
    titleEn: 'Green Thumb',
    titleTl: 'Luntiang Daliri',
    descEn: 'Keep 5 plants healthy',
    descTl: 'Panatilihing malusog ang 5 halaman',
    icon: '🌿',
    category: 'plant',
    requirement: { type: 'healthy_plant', count: 5 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'pet_whisperer',
    titleEn: 'Pet Whisperer',
    titleTl: 'Bulong ng Alaga',
    descEn: 'Keep 3 pets at 100 health',
    descTl: 'Panatilihing 100 ang kalusugan ng 3 alaga',
    icon: '❤️',
    category: 'pet',
    requirement: { type: 'healthy_pet', count: 3 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'early_bird',
    titleEn: 'Early Bird',
    titleTl: 'Maagang Ibon',
    descEn: 'Complete a task before 8am',
    descTl: 'Makatapos ng gawain bago mag-8am',
    icon: '🌅',
    category: 'task',
    requirement: { type: 'early_bird_task', count: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'night_owl',
    titleEn: 'Night Owl',
    titleTl: 'Kuwago sa Gabi',
    descEn: 'Complete a task after 10pm',
    descTl: 'Makatapos ng gawain pagkatapos ng 10pm',
    icon: '🦉',
    category: 'task',
    requirement: { type: 'night_owl_task', count: 1 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'social_butterfly',
    titleEn: 'Social Butterfly',
    titleTl: 'Paruparong Sosyal',
    descEn: 'Add 3 household members',
    descTl: 'Magdagdag ng 3 miyembro ng bahay',
    icon: '🦋',
    category: 'social',
    requirement: { type: 'household_member', count: 3 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'library_curator',
    titleEn: 'Library Curator',
    titleTl: 'Tagapangasiwa ng Aklatan',
    descEn: 'Add 3 entries to library',
    descTl: 'Magdagdag ng 3 entry sa aklatan',
    icon: '📚',
    category: 'milestone',
    requirement: { type: 'library_entry', count: 3 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'photo_gallery_pro',
    titleEn: 'Photo Gallery Pro',
    titleTl: 'Pro ng Galeriya ng Larawan',
    descEn: 'Upload 15 photos',
    descTl: 'Mag-upload ng 15 larawan',
    icon: '🖼️',
    category: 'photo',
    requirement: { type: 'photo_upload', count: 15 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'grandparent',
    titleEn: 'Grandparent',
    titleTl: 'Lolo o Lola',
    descEn: 'Have pets or plants for 1 year',
    descTl: 'Magkaroon ng alaga o halaman sa loob ng 1 taon',
    icon: '👑',
    category: 'milestone',
    requirement: { type: 'care_duration_days', count: 365 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'achievement_hunter',
    titleEn: 'Achievement Hunter',
    titleTl: 'Mangangaso ng Achievement',
    descEn: 'Unlock 10 badges',
    descTl: 'Makakuha ng 10 badge',
    icon: '🏆',
    category: 'milestone',
    requirement: { type: 'achievement_unlock', count: 10 },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'perfect_week',
    titleEn: 'Perfect Week',
    titleTl: 'Perpektong Linggo',
    descEn: 'Complete all tasks for 7 days',
    descTl: 'Makatapos ng lahat ng gawain sa loob ng 7 araw',
    icon: '💯',
    category: 'streak',
    requirement: { type: 'perfect_week', count: 1 },
    isUnlocked: false,
    progress: 0,
  },
];

const STORAGE_KEY = 'care_system_achievements';

function getAchievementsState(): Badge[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: Badge[] = JSON.parse(stored);
      return parsed.map((badge, index) => {
        const template = ALL_BADGES[index];
        if (template) {
          return { ...template, ...badge };
        }
        return badge;
      });
    }
  } catch {
    // fall through to initialize
  }
  return ALL_BADGES.map((b) => ({ ...b }));
}

function saveAchievementsState(badges: Badge[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
}

function getNextMilestone(
  currentCount: number,
  thresholds: number[]
): { next: number; remaining: number } | null {
  for (const threshold of thresholds) {
    if (currentCount < threshold) {
      return { next: threshold, remaining: threshold - currentCount };
    }
  }
  return null;
}

function checkAndUpdateAchievements(params: AchievementCheckParams): Badge[] {
  const badges = getAchievementsState();

  const badgeChecks: Array<{ badge: Badge; condition: boolean }> = [
    {
      badge: badges[0],
      condition: params.petCount + params.plantCount >= 1,
    },
    {
      badge: badges[1],
      condition: params.plantCount >= 3,
    },
    {
      badge: badges[2],
      condition: params.petCount >= 3,
    },
    {
      badge: badges[3],
      condition: params.totalWateringCompleted >= 10,
    },
    {
      badge: badges[4],
      condition: params.totalFeedingCompleted >= 10,
    },
    {
      badge: badges[5],
      condition: params.totalWalkingCompleted >= 10,
    },
    {
      badge: badges[6],
      condition: params.totalMedicineCompleted >= 5,
    },
    {
      badge: badges[7],
      condition: params.totalDiaryEntries >= 5,
    },
    {
      badge: badges[8],
      condition: params.totalPhotosUploaded >= 5,
    },
    {
      badge: badges[9],
      condition: params.maxStreak >= 7,
    },
    {
      badge: badges[10],
      condition: params.maxStreak >= 30,
    },
    {
      badge: badges[11],
      condition: params.totalTasksCompleted >= 50,
    },
    {
      badge: badges[12],
      condition: params.healthyPlantCount >= 5,
    },
    {
      badge: badges[13],
      condition: params.healthyPetCount >= 3,
    },
    {
      badge: badges[14],
      condition: params.earlyBirdTasks >= 1,
    },
    {
      badge: badges[15],
      condition: params.nightOwlTasks >= 1,
    },
    {
      badge: badges[16],
      condition: params.householdMemberCount >= 3,
    },
    {
      badge: badges[17],
      condition: params.libraryEntryCount >= 3,
    },
    {
      badge: badges[18],
      condition: params.totalPhotosUploaded >= 15,
    },
    {
      badge: badges[19],
      condition: false, // grandparent — requires date tracking, not in params yet
    },
    {
      badge: badges[20],
      condition: params.unlockedBadgeCount >= 10,
    },
    {
      badge: badges[21],
      condition: params.perfectWeekCount >= 1,
    },
  ];

  for (const { badge, condition } of badgeChecks) {
    if (!badge) continue;

    if (!badge.isUnlocked) {
      if (condition) {
        badge.isUnlocked = true;
        badge.unlockedAt = new Date().toISOString();
        badge.progress = badge.requirement.count;
      }
    }
  }

  // Update progress for all badges
  badges[0].progress = Math.min(params.petCount + params.plantCount, badges[0].requirement.count);
  badges[1].progress = Math.min(params.plantCount, badges[1].requirement.count);
  badges[2].progress = Math.min(params.petCount, badges[2].requirement.count);
  badges[3].progress = Math.min(params.totalWateringCompleted, badges[3].requirement.count);
  badges[4].progress = Math.min(params.totalFeedingCompleted, badges[4].requirement.count);
  badges[5].progress = Math.min(params.totalWalkingCompleted, badges[5].requirement.count);
  badges[6].progress = Math.min(params.totalMedicineCompleted, badges[6].requirement.count);
  badges[7].progress = Math.min(params.totalDiaryEntries, badges[7].requirement.count);
  badges[8].progress = Math.min(params.totalPhotosUploaded, badges[8].requirement.count);
  badges[9].progress = Math.min(params.maxStreak, badges[9].requirement.count);
  badges[10].progress = Math.min(params.maxStreak, badges[10].requirement.count);
  badges[11].progress = Math.min(params.totalTasksCompleted, badges[11].requirement.count);
  badges[12].progress = Math.min(params.healthyPlantCount, badges[12].requirement.count);
  badges[13].progress = Math.min(params.healthyPetCount, badges[13].requirement.count);
  badges[14].progress = Math.min(params.earlyBirdTasks, badges[14].requirement.count);
  badges[15].progress = Math.min(params.nightOwlTasks, badges[15].requirement.count);
  badges[16].progress = Math.min(params.householdMemberCount, badges[16].requirement.count);
  badges[17].progress = Math.min(params.libraryEntryCount, badges[17].requirement.count);
  badges[18].progress = Math.min(params.totalPhotosUploaded, badges[18].requirement.count);
  badges[20].progress = Math.min(params.unlockedBadgeCount, badges[20].requirement.count);
  badges[21].progress = Math.min(params.perfectWeekCount, badges[21].requirement.count);

  saveAchievementsState(badges);
  return badges;
}

function resetAchievements(): void {
  const reset = ALL_BADGES.map((b) => ({ ...b }));
  saveAchievementsState(reset);
}

export { ALL_BADGES, getAchievementsState, saveAchievementsState, checkAndUpdateAchievements, resetAchievements, getNextMilestone };
export type { Badge, AchievementCheckParams, Requirement };
