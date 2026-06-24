export type Language = 'en' | 'tl';

export const TRANSLATIONS = {
  en: {
    // Nav & General
    appName: "Smart Home Care",
    welcomeBack: "Welcome back",
    navigationMenu: "Navigation Menu",
    activeScreen: "Active Screen",
    environment: "Environment",
    localCache: "Local Cache",
    langToggle: "🇵🇭 Mag-Tagalog",
    langLabel: "Language",
    confirm: "Confirm",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    back: "Back",
    actions: "Actions",

    // Tabs
    home: "Home",
    pets: "Pets",
    plants: "Plants",
    library: "Library",
    logs: "Logs",
    diary: "Diary",
    settings: "Settings",

    // Dashboard Screen
    quickActions: "Quick Care Actions",
    addPet: "Add Pet",
    addPlant: "Add Plant",
    addTask: "Add Task",
    addNote: "Add Note",
    careLibrary: "Care & Species Library",
    exploreLibraryDesc: "Explore toxic substances, sunlight limits, and pet companion traits.",
    urgentAttention: "Urgent Attention Needed",
    overdueTasksDesc: "You have {count} task(s) that are past their scheduled dates. Complete them below to restore perfect status.",
    todaysTasks: "Today's Tasks",
    viewLogs: "View Logs",
    allCaughtUp: "All caught up!",
    allCaughtUpDesc: "Every pet is fed and plant watered. Excellent job!",
    gardenHealth: "Garden Health",
    plantCareIndex: "Plant Care Index",
    managePlants: "Manage Plants",
    diaryInsights: "Diary Insights",
    growthDiary: "Growth Diary",
    diaryInsightsDesc: "Logs and daily growth snapshots help you spot patterns in pet behavior and plant recovery.",
    openDiary: "Open Diary",
    petsLogged: "Pets Logged",
    plantsManaged: "Plants Managed",

    // Health score labels
    healthScore: "Health Score",
    statusHealthy: "Healthy",
    statusWarning: "Needs Attention",
    statusCritical: "Critical",
    scoreIndicator: "Care Status Score",

    // Habit builder
    streakTitle: "Habit Streak",
    streakActive: "Active Streak",
    streakDays: "days",
    streakMotto0: "Start watering and feeding today to build a streak!",
    streakMotto1: "Awesome! Keep up the excellent care!",
    streakMotto2: "Fantastic! You are a certified pet & plant champion!",
    dailyRoutineProgress: "Daily Routine Habits Completed",

    // Weekly summary
    weeklyReportTitle: "Weekly Care Summary",
    reportDilig: "plants watered {count} times",
    reportFeed: "pets fed {count} times",
    reportMissed: "{count} care schedule(s) missed or delayed",
    reportStatusGood: "Great work this week! Your companions are thriving.",
    reportStatusBad: "Some chores are lagging behind. Let's do better tomorrow!",

    // Location / Area
    locationLabel: "Location / Area",
    areaIndoor: "Loob ng Bahay (Indoor)",
    areaBalcony: "Balkonahe (Balcony)",
    areaGarden: "Hardin (Garden)",
    areaOutdoor: "Outdoor (Backyard)",
    areaSelectPlaceholder: "Select Location...",

    // Family mode
    assignedToLabel: "Assigned Caregiver (Family Mode)",
    familyMe: "Ako (Me)",
    familyNanay: "Nanay (Mother)",
    familyTatay: "Tatay (Father)",
    familyAte: "Ate (Elder Sister)",
    familyKuya: "Kuya (Elder Brother)",
    familyBunso: "Bunso (Youngest)",
    familySelectPlaceholder: "Select Family Member...",

    // Search and filters
    searchPlaceholder: "Search by name, species or breed...",
    filterTitle: "Filter Controls",
    filterMaintenance: "Maintenance Needs",
    filterMaintenanceLow: "Low Maintenance",
    filterMaintenanceHigh: "High Maintenance",
    filterType: "Companions Type",
    filterTypeAll: "All",

    // Calendar
    calendarTitle: "Care Schedule Calendar",
    calendarMonth: "June 2026",
    viewSchedulesFor: "Tasks for {date}",
    noTasksOnDate: "No tasks scheduled for this day.",

    // Photo progress
    progressTimeline: "Growth & Photo Timeline",
    addProgressPhoto: "Add Timeline Photo",
    photoLabel: "Progress Label (e.g., Seed, Sprout, 3 Months Old)",
    uploadPhotoBtn: "Upload Photo",
    photoPlaceholder: "Drop a URL or take a photo...",
    timelineIntro: "Compare photos from before & after to track visual health improvements.",

    // Specific tagalog hints / care tips system
    careTipsTitle: "Smart Care Recommendations",
    petCareTip1: "If your pet shows low appetite, observe their hydration and call the vet.",
    petCareTip2: "Regular playtime reduces behavioral anxiety and chewing of furniture.",
    plantCareTip1: "Yellowing leaves? Reduce watering frequency to prevent root decay.",
    plantCareTip2: "Wipe down leaves to help photosynthesis under fluorescent light.",

    // Specific alert messages for overdue
    overdueWarningAlert: "{name}'s task \"{taskName}\" is overdue by {time}!",

    // Dialog form labels
    registerNewPet: "Register New Pet",
    editPetProfile: "Edit Pet Profile",
    petName: "Pet Name *",
    typeLabel: "Type",
    breedLabel: "Breed",
    ageLabel: "Age (e.g., 2 years)",
    addPlantTitle: "Register New Plant",
    editPlantProfile: "Edit Plant Profile",
    plantName: "Plant Name *",
    speciesLabel: "Species",
    sunlightLabel: "Sunlight Requirements",
    low: "Low",
    medium: "Medium",
    high: "High",
    addTaskTitle: "Schedule Care Task",
    taskNameLabel: "Task Name (e.g., Evening Walking, Water Rose)",
    intervalDaysLabel: "Repeat Every (Days)",
    firstDue: "First Due Date",
    addDiaryTitle: "Write Diary Entry",
    observationText: "Diary Notes & Observations",
    categoryLabel: "Category",
    moodLabel: "Current Companion Mood",
    tagsLabel: "Tags (comma-separated)",
    photoUrlLabel: "Attachment Image URL",

    // AI Assistant
    aiAssistant: "AI Assistant",
    aiAssistantDesc: "Ask questions and get care tips for your pets and plants (Tagalog + English supported).",
    aiEnabled: "Enable AI Assistant",
    aiApiKey: "Gemini API Key",
    aiApiKeyPlaceholder: "Enter your Google AI API key...",
    aiApiKeyDesc: "Get a free API key from aistudio.google.com",
    aiAskQuestion: "Ask a question about pet or plant care...",
    aiSend: "Send",
    aiThinking: "Thinking...",
    aiUnavailable: "AI unavailable offline",
    aiUnavailableDesc: "Connect to the internet to use the AI assistant",
    aiWelcome: "Hello! I'm your AI care assistant. Ask me anything about pet or plant care!",
    aiWelcome_tl: "Mabuhay! Ako ang iyong AI katulong sa pag-aalaga. Magtanong tungkol sa pag-aalaga ng hayop o halaman!",
    aiError: "Sorry, I couldn't process your request. Please check your API key and try again.",
    aiClearChat: "Clear chat",
    aiPoweredBy: "Powered by OpenAI",
  },
  tl: {
    // Nav & General
    appName: "Kalingang Tahanan",
    welcomeBack: "Maligayang pagbabalik",
    navigationMenu: "Menu ng Navigation",
    activeScreen: "Aktibong Screen",
    environment: "Kasalukuyang Cache",
    localCache: "Lokal na Memorya",
    langToggle: "🇺🇸 English Menu",
    langLabel: "Wika (Language)",
    confirm: "Kumpirmahin",
    cancel: "I-cancel",
    delete: "I-delete",
    edit: "I-edit",
    save: "I-save",
    back: "Bumalik",
    actions: "Mga Aksyon",

    // Tabs
    home: "Home",
    pets: "Mga Alaga",
    plants: "Mga Halaman",
    library: "Gabay",
    logs: "Ulat",
    diary: "Talaarawan",
    settings: "Mga Setting",

    // Dashboard Screen
    quickActions: "Mabilisang Aksyon",
    addPet: "Magdagdag ng Alaga",
    addPlant: "Magdagdag ng Halaman",
    addTask: "Magdagdag ng Gawain",
    addNote: "Magdagdag ng Tala",
    careLibrary: "Aklatan ng Pag-aalaga",
    exploreLibraryDesc: "Alamin ang mga nakalalasong bagay, tamang sikat ng araw, at katangian ng mga hayop.",
    urgentAttention: "Kailangan ng Mabilisang Pansin",
    overdueTasksDesc: "Mayroon kang {count} (na) gawaing lumampas na sa takdang oras. Kumpletuhin ang mga ito sa ibaba para maging malusog muli ang iyong alaga.",
    todaysTasks: "Mga Gawain Ngayon",
    viewLogs: "Tingnan ang Ulat",
    allCaughtUp: "Lahat ay Nagawa Na!",
    allCaughtUpDesc: "Busog ang lahat ng alaga at nadiligan ang mga halaman. Mahusay!",
    gardenHealth: "Kalusugan ng Hardin",
    plantCareIndex: "Indise ng Halaman",
    managePlants: "Ayusin ang Halaman",
    diaryInsights: "Pagsusuri sa Talaarawan",
    growthDiary: "Talaarawan ng Paglaki",
    diaryInsightsDesc: "Ang mga tala at larawan ng paglaki ay tumutulong sa iyo na mapansin ang kilos ng alaga at paggaling ng halaman.",
    openDiary: "Buksan ang Talaarawan",
    petsLogged: "Alagang Naka-tala",
    plantsManaged: "Halama't Inaalagaan",

    // Health score labels
    healthScore: "Kalusugan Score",
    statusHealthy: "Malusog",
    statusWarning: "Kailangan ng Pansin",
    statusCritical: "Kritikal",
    scoreIndicator: "Marka ng Kalagayan",

    // Habit builder
    streakTitle: "Araw ng Tuloy-tuloy",
    streakActive: "Aktibong Streak",
    streakDays: "araw",
    streakMotto0: "Simulan ang pagdilig at pagpapakain ngayon para magka-streak!",
    streakMotto1: "Magaling! Tuloy-tuloy ang pag-aalaga mo!",
    streakMotto2: "Napakahusay! Ikaw ay isang sertipikadong tagapangalaga!",
    dailyRoutineProgress: "Nakumpletong Gawaing Rutina Ngayon",

    // Weekly summary
    weeklyReportTitle: "Lingguhang Buod ng Alaga",
    reportDilig: "{count} beses nadiligan ang mga halaman",
    reportFeed: "{count} beses nakapagpakain ng alagang hayop",
    reportMissed: "{count} gawain ang hindi nagawa o naantala",
    reportStatusGood: "Magaling ang pag-aalaga ngayong linggo! Masaya ang iyong mga kasama.",
    reportStatusBad: "May ilang gawaing nakaligtaan. Pagbutihin natin bukas!",

    // Location / Area
    locationLabel: "Lokasyon / Lugar",
    areaIndoor: "Loob ng Bahay",
    areaBalcony: "Balkonahe",
    areaGarden: "Hardin",
    areaOutdoor: "Likod-bahay (Outdoor)",
    areaSelectPlaceholder: "Pumili ng Lokasyon...",

    // Family mode
    assignedToLabel: "Naka-atas Kay (Family Mode)",
    familyMe: "Ako",
    familyNanay: "Nanay",
    familyTatay: "Tatay",
    familyAte: "Ate",
    familyKuya: "Kuya",
    familyBunso: "Bunso",
    familySelectPlaceholder: "Pumili ng Miyembro ng Pamilya...",

    // Search and filters
    searchPlaceholder: "Maghanap gamit ang pangalan o uri...",
    filterTitle: "Pagsasala ng Listahan",
    filterMaintenance: "Antas ng Pag-aalaga",
    filterMaintenanceLow: "Madaling Alagaan (Low)",
    filterMaintenanceHigh: "Kailangan ng Atensyon (High)",
    filterType: "Uri ng Kasama",
    filterTypeAll: "Lahat",

    // Calendar
    calendarTitle: "Kalendaryo ng mga Gawain",
    calendarMonth: "Hunyo 2026",
    viewSchedulesFor: "Mga Gawain noong {date}",
    noTasksOnDate: "Walang nakatalagang gawain sa araw na ito.",

    // Photo progress
    progressTimeline: "Timeline ng Larawan at Paglaki",
    addProgressPhoto: "Magdagdag ng Larawan sa Timeline",
    photoLabel: "Kategorya ng Larawan (hal., Buto, Usbong, 3 Buwang Alaga)",
    uploadPhotoBtn: "I-upload ang Larawan",
    photoPlaceholder: "Maglagay ng URL o kumuha ng larawan...",
    timelineIntro: "I-kumpara ang mga larawan bago at pagkatapos upang subaybayan ang paggaling o paglaki.",

    // Specific tagalog hints / care tips system
    careTipsTitle: "Matalinong Payo sa Pag-aalaga",
    petCareTip1: "Kung walang gana kumain ang alaga, obserbahan ang kanyang kalagayan.",
    petCareTip2: "Ang regular na laro ay nakababawas sa pagkabagot at pagkagat ng gamit.",
    plantCareTip1: "Kung naninilaw ang dahon, bawasan ang dilig para maiwasan ang mabulok na ugat.",
    plantCareTip2: "Punasan ang mga dahon buwan-buwan para mas sumipsip ng liwanag.",

    // Specific alert messages for overdue
    overdueWarningAlert: "Hindi nagawa ang \"{taskName}\" para kay {name}! Huli na ito ng {time}!",

    // Dialog form labels
    registerNewPet: "Magtala ng Bagong Alaga",
    editPetProfile: "I-edit ang Profile ng Alaga",
    petName: "Pangalan ng Alaga *",
    typeLabel: "Uri ng Hayop",
    breedLabel: "Lahi (Breed)",
    ageLabel: "Edad (hal., 2 taon)",
    addPlantTitle: "Magtala ng Bagong Halaman",
    editPlantProfile: "I-edit ang Profile ng Halaman",
    plantName: "Pangalan ng Halaman *",
    speciesLabel: "Espesye (Species)",
    sunlightLabel: "Kailangan na Sikat ng Araw",
    low: "Mababa",
    medium: "Katamtaman",
    high: "Mataas",
    addTaskTitle: "Magtakda ng Bagong Gawain",
    taskNameLabel: "Pangalan ng Gawain (hal., Pagdidilig, Pagpapakain ng Pagkaing Basa)",
    intervalDaysLabel: "Ulitin Kada (Araw)",
    firstDue: "Unang Takdang Araw",
    addDiaryTitle: "Sumulat sa Talaarawan",
    observationText: "Mga Obserbasyon sa Talaarawan",
    categoryLabel: "Kategorya",
    moodLabel: "Kasalukuyang Mood ng Alaga",
    tagsLabel: "Tags (ihiwalay gamit ang kuwit)",
    photoUrlLabel: "URL ng Kalakip na Larawan",

    // AI Assistant
    aiAssistant: "AI Katulong",
    aiAssistantDesc: "Magtanong at kumuha ng mga tip sa pag-aalaga ng iyong mga alaga at halaman (Tagalog + English).",
    aiEnabled: "Paganahin ang AI Katulong",
    aiApiKey: "Gemini API Key",
    aiApiKeyPlaceholder: "Ilagay ang iyong Google AI API key...",
    aiApiKeyDesc: "Kumuha ng libreng API key sa aistudio.google.com",
    aiAskQuestion: "Magtanong tungkol sa pag-aalaga ng hayop o halaman...",
    aiSend: "Ipadala",
    aiThinking: "Nag-iisip...",
    aiUnavailable: "Hindi available ang AI offline",
    aiUnavailableDesc: "Kumonekta sa internet para magamit ang AI katulong",
    aiWelcome: "Mabuhay! Ako ang iyong AI katulong sa pag-aalaga. Magtanong tungkol sa pag-aalaga ng hayop o halaman!",
    aiWelcome_tl: "Mabuhay! Ako ang iyong AI katulong sa pag-aalaga. Magtanong tungkol sa pag-aalaga ng hayop o halaman!",
    aiError: "Paumanhin, hindi ko naproseso ang iyong kahilingan. Pakisuri ang iyong API key at subukan muli.",
    aiClearChat: "I-clear ang chat",
    aiPoweredBy: "Pinapagana ng OpenAI",
  }
};

export function translate(key: string, lang: Language, replacements?: { [key: string]: string | number }): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS['tl']; // Default to Tagalog as requested!
  const text = (dictionary as any)[key] || (TRANSLATIONS['en'] as any)[key] || key;
  if (!replacements) return text;
  let result = text;
  Object.keys(replacements).forEach(k => {
    result = result.split(`{${k}}`).join(String(replacements[k]));
  });
  return result;
}

