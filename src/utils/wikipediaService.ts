const SEARCH_BASE = 'https://en.wikipedia.org/w/api.php';
const DETAIL_BASE = 'https://en.wikipedia.org/api/rest_v1';

export interface WikipediaPage {
  pageid: number;
  title: string;
  extract?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  description?: string;
}

const ALLOWED_TITLE_KEYWORDS = [
  'plant', 'flower', 'tree', 'herb', 'shrub', 'vine', 'fern', 'moss', 'cactus',
  'succulent', 'bamboo', 'palm', 'orchid', 'rose', 'lily', 'tulip', 'daisy',
  'sunflower', 'lavender', 'jasmine', 'aloe', 'ivy', 'fern', 'mint', 'basil',
  'rosemary', 'thyme', 'oregano', 'parsley', 'cilantro', 'sage', 'dill',
  'chives', 'catnip', 'pet', 'dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster',
  'guinea pig', 'gerbil', 'mouse', 'rat', 'ferret', 'parrot', 'canary',
  'finch', 'turtle', 'tortoise', 'lizard', 'gecko', 'snake', 'chameleon',
  'bearded dragon', 'hedgehog', 'chinchilla', 'horse', 'pony', 'goat',
  'sheep', 'cow', 'chicken', 'duck', 'goose', 'turkey', 'donkey', 'mule',
  'pig', 'llama', 'alpaca', 'camel', 'reptile', 'amphibian', 'frog', 'toad',
  'salamander', 'newt', 'tarantula', 'spider', 'crab', 'hermit crab',
  'snail', 'ant', 'bee', 'butterfly', 'garden',
];

const EXCLUDED_KEYWORDS = [
  'film', 'movie', 'actor', 'actress', 'celebrity', 'politician', 'president',
  'company', 'corporation', 'brand', 'software', 'website', 'band', 'album',
  'song', 'album', 'single', 'episode', 'tv', 'television', 'city', 'country',
  'continent', 'river', 'mountain', 'ocean', 'lake', 'island', 'region',
  'university', 'school', 'college', 'stadium', 'bridge', 'building',
  'historical', 'war', 'battle', 'treaty', 'revolution', 'empire',
  'kingdom', 'dynasty', 'technology', 'programming', 'language',
  'operating system', 'video game', 'console', 'car', 'automobile',
  'aircraft', 'ship', 'train', 'weapon', 'medal', 'award',
];

function isAllowed(title: string): boolean {
  const t = title.toLowerCase();
  // Exclude if any excluded keyword matches exactly (word boundary)
  for (const kw of EXCLUDED_KEYWORDS) {
    if (t.includes(kw)) return false;
  }
  // Allow if any allowed keyword is in the title
  for (const kw of ALLOWED_TITLE_KEYWORDS) {
    if (t.includes(kw)) return true;
  }
  // Allow single-word common things like "Dog", "Cat", "Rose"
  if (t.split(' ').length <= 2) return true;
  return false;
}

export async function searchWikipedia(query: string): Promise<WikipediaPage[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    format: 'json',
    srlimit: '20',
    origin: '*',
  });
  const res = await fetch(`${SEARCH_BASE}?${params}`);
  if (!res.ok) throw new Error(`Wikipedia search error: ${res.status}`);
  const data = await res.json();
  const results = (data.query?.search || []).map((item: any) => ({
    pageid: item.pageid,
    title: item.title,
    description: item.snippet?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
  }));
  return results.filter((r: WikipediaPage) => isAllowed(r.title));
}

export async function getWikipediaDetail(title: string): Promise<WikipediaPage | null> {
  const res = await fetch(`${DETAIL_BASE}/page/summary/${encodeURIComponent(title)}`, {
    headers: { 'User-Agent': 'KalingangTahanan/1.0' },
  });
  if (!res.ok) return null;
  return res.json();
}

export function guessType(title: string, description?: string): 'plant' | 'pet' {
  const t = (title + ' ' + (description || '')).toLowerCase();
  const plantWords = ['plant', 'flower', 'tree', 'herb', 'shrub', 'vine', 'fern',
    'succulent', 'cactus', 'bamboo', 'palm', 'orchid', 'rose', 'lily', 'tulip',
    'garden', 'leaf', 'bloom', 'petal', 'pollen', 'botanical', 'perennial',
    'annual', 'evergreen', 'deciduous',
  ];
  const petWords = ['dog', 'cat', 'pet', 'breed', 'canine', 'feline', 'bird',
    'fish', 'rabbit', 'hamster', 'reptile', 'amphibian', 'mammal', 'domestic',
    'turtle', 'lizard', 'parrot', 'animal', 'puppy', 'kitten', 'horse',
  ];
  const plantScore = plantWords.filter((w) => t.includes(w)).length;
  const petScore = petWords.filter((w) => t.includes(w)).length;
  if (plantScore >= petScore) return 'plant';
  return 'pet';
}
