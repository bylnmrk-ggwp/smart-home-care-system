export interface LibraryItem {
  id: string;
  name: string;
  scientificName?: string;
  type: 'pet' | 'plant';
  category: string; // e.g. "Houseplant", "Companion", "Outdoor"
  image: string; // Unsplash image url
  description: string;
  careInstructions: {
    wateringOrFeeding: string;
    sunlightOrEnvironment: string;
    soilOrExercise: string;
  };
  purpose: string;
  benefits: string[];
  tips: string[];
  warnings: string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export const LIBRARY_PETS: LibraryItem[] = [
  {
    id: 'lib-dog',
    name: 'Dog (Canis lupus familiaris)',
    type: 'pet',
    category: 'Companion & Protector',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    description: 'Dogs are loyal, highly social pack animals renowned for their close relationship with humans. They come in hundreds of breeds, each with distinct sizes, coat types, temperament, and drive.',
    careInstructions: {
      wateringOrFeeding: 'High protein kibble or wet food 2x daily. Fresh clean water must be accessible at all times.',
      sunlightOrEnvironment: 'Thrives in temperate environments. Needs comfortable indoor shelter and a soft bed.',
      soilOrExercise: 'Requires daily walks (30-90 mins depending on breed), interactive mental enrichment, and play sessions.'
    },
    purpose: 'Companion, emotional support, physical activity partner, and domestic guardian.',
    benefits: [
      'Reduces loneliness and increases daily positive motivation.',
      'Improves cardiovascular health through regular walking schedules.',
      'Provides security and alerts owners to unusual events.'
    ],
    tips: [
      'Positive reinforcement training is highly effective.',
      'Groom and brush their coat regularly to reduce shedding and spot skin issues early.'
    ],
    warnings: [
      'Chocolate, grapes, onions, and xylitol are highly toxic to dogs.',
      'Avoid leaving dogs in warm parked cars even for short durations.'
    ]
  },
  {
    id: 'lib-cat',
    name: 'Cat (Felis catus)',
    type: 'pet',
    category: 'Independent Companion',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    description: 'Cats are quiet, elegant, and semi-independent pets. They are famous for their playful curiosity, self-grooming habits, and distinct purrs of contentment.',
    careInstructions: {
      wateringOrFeeding: 'High-moisture wet food paired with dry kibble. Cats prefer running water from fountains.',
      sunlightOrEnvironment: 'A warm, safe indoor environment with sunny windowsills and tall scratching trees.',
      soilOrExercise: 'Self-entertaining but benefits from 15-20 minutes of daily interactive feather wand play.'
    },
    purpose: 'Low-maintenance affectionate companion, perfect for apartment living.',
    benefits: [
      'Lower daily stress levels—purring frequencies are proven to soothe human nerves.',
      'Natural pest controllers (keeps mice and small insects away).',
      'Quiet and respects personal workspace boundaries.'
    ],
    tips: [
      'Clean the litter box at least once a day to prevent rejection and territory stress.',
      'Provide scratching posts to keep claws healthy and protect furniture.'
    ],
    warnings: [
      'Lilies, poinsettias, and essential oils are extremely toxic to cats.',
      'Avoid cow milk, as most adult cats are actually lactose intolerant.'
    ]
  },
  {
    id: 'lib-rabbit',
    name: 'Rabbit (Oryctolagus cuniculus)',
    type: 'pet',
    category: 'Gentle Herbivore',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600',
    description: 'Rabbits are quiet, expressive, and highly clean companion pets. They can be litter-trained and communicate through subtle body language like nose-twitches and happy hops (binkies).',
    careInstructions: {
      wateringOrFeeding: '80% fresh timothy hay, with daily leafy greens and a small portion of high-fiber rabbit pellets.',
      sunlightOrEnvironment: 'Spacious indoor enclosure with secure puppy pens. Must be rabbit-proofed (protect wires).',
      soilOrExercise: 'At least 3-4 hours of free-roam exercise time outside their enclosure to stretch and explore.'
    },
    purpose: 'Quiet, interactive, herbivorous companion suitable for peaceful households.',
    benefits: [
      'Silent and does not bark or vocalize loudly.',
      'Clean habits—they spend hours grooming themselves and can easily learn litter box rules.',
      'Fascinating social behaviors that build a peaceful household energy.'
    ],
    tips: [
      'Hay must be constantly available to wear down their continuously growing teeth.',
      'Handle gently with both hands supporting their hindquarters to protect their delicate spines.'
    ],
    warnings: [
      'Extremely sensitive digestive systems; a single day of not eating (GI Stasis) can be fatal.',
      'Do not keep them in direct hot sunlight or drafts; they overheat very easily.'
    ]
  },
  {
    id: 'lib-parrakeet',
    name: 'Parakeet / Budgie (Melopsittacus undulatus)',
    type: 'pet',
    category: 'Vocal Feathered Friend',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&q=80&w=600',
    description: 'Budgerigars, or budgies, are highly intelligent, colorful, and active birds. They are social learners, capable of mimicking human speech and bonding deeply with their human flock.',
    careInstructions: {
      wateringOrFeeding: 'High-quality seed mix balanced with fresh leafy greens, fruits, and a cuttlebone for calcium.',
      sunlightOrEnvironment: 'Spacious cage placed in a bustling living area away from kitchen fumes. Prefers natural sunlight.',
      soilOrExercise: 'Requires daily supervised free-flight time in a closed room with windows covered.'
    },
    purpose: 'Vibrant, melodic, and highly social feathered life partner.',
    benefits: [
      'Fills the home with delightful, cheerful chirping melodies.',
      'Requires less physical space than a dog or cat.',
      'Highly intelligent and capable of learning tricks and simple words.'
    ],
    tips: [
      'Provide variety of natural wood perches of varying diameters to prevent foot arthritis.',
      'Clean the cage liner daily to prevent respiratory infections.'
    ],
    warnings: [
      'Teflon/non-stick pan fumes are instantly lethal to birds.',
      'Avoid drafts and sudden temperature shifts.'
    ]
  }
];

export const LIBRARY_PLANTS: LibraryItem[] = [
  {
    id: 'lib-monstera',
    name: 'Monstera Deliciosa (Swiss Cheese Plant)',
    type: 'plant',
    category: 'Foliage Houseplant',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600',
    description: 'A gorgeous tropical native of Central America, famous for its dramatic split-leaf patterns (fenestrations) that help it survive heavy jungle wind and rain.',
    careInstructions: {
      wateringOrFeeding: 'Water thoroughly once every 7-10 days when the top 2 inches of soil are dry. Mist leaves.',
      sunlightOrEnvironment: 'Bright, indirect sunlight. Harsh direct sun will scorch and yellow the delicate leaves.',
      soilOrExercise: 'Peat-based, aerated, well-draining soil mix with a moss pole for climbing support.'
    },
    purpose: 'Exotic home decoration, aesthetic statement, and moderate air filtering.',
    benefits: [
      'Adds an instant bold tropical aesthetic feel to any corner.',
      'Purifies toxic formaldehyde and dust particles from stagnant indoor air.',
      'Increases indoor humidity levels naturally through leaf transpiration.'
    ],
    tips: [
      'Wipe down leaves with a damp cloth monthly to clean dust and optimize sunlight absorption.',
      'Rotate the pot 90 degrees every month for symmetrical, even growth.'
    ],
    warnings: [
      'Contains calcium oxalate crystals which are toxic to cats and dogs if ingested.',
      'Avoid overwatering—yellowing leaves with brown mushy spots indicate root rot.'
    ],
    difficulty: 'Medium'
  },
  {
    id: 'lib-pothos',
    name: 'Golden Pothos (Devil\'s Ivy)',
    type: 'plant',
    category: 'Low-Light Climber',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600',
    description: 'An exceptionally rugged, fast-growing trailing vine with heart-shaped leaves variegated in golden-yellow. Known as one of the easiest houseplants to keep alive.',
    careInstructions: {
      wateringOrFeeding: 'Allow soil to dry out completely between waterings. Leaves will droop slightly when thirsty.',
      sunlightOrEnvironment: 'Very tolerant. Thrives in low, fluorescent light, as well as bright, indirect windows.',
      soilOrExercise: 'Basic potting soil with good drainage. Can also be grown directly in water jars.'
    },
    purpose: 'Ideal for beginners, offices, hanging baskets, and high bookshelves.',
    benefits: [
      'Extremely resilient—can bounce back from severe watering neglect.',
      'Highly effective at cleaning carbon monoxide, benzene, and xylene from indoor air.',
      'Easy to propagate in water—just clip a node and watch roots grow!'
    ],
    tips: [
      'Prune the vines regularly to encourage thicker, bushier growth at the crown.',
      'Variegation increases with brighter light. If leaves turn solid green, move closer to a window.'
    ],
    warnings: [
      'Toxic to pets; keep trailing vines placed high up out of reach.'
    ],
    difficulty: 'Easy'
  },
  {
    id: 'lib-snake',
    name: 'Snake Plant (Sansevieria / Mother-in-Law\'s Tongue)',
    type: 'plant',
    category: 'Indestructible Succulent',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600',
    description: 'An architectural plant with upright, sword-like leaves banded in silver and yellow. Originating from West Africa, it is legendary for its durability and neglect tolerance.',
    careInstructions: {
      wateringOrFeeding: 'Water sparingly. Once every 3-4 weeks is plenty. Ensure the soil is bone-dry before watering.',
      sunlightOrEnvironment: 'Tolerates low light corners, but performs best in indirect sunlight.',
      soilOrExercise: 'Sandy, quick-draining cactus/succulent soil mix with a porous clay pot.'
    },
    purpose: 'Low-maintenance architectural home accent, perfect for bedrooms.',
    benefits: [
      'Produces oxygen at night (unlike most plants), making it the absolute best bedroom companion.',
      'Cleans toxic airborne chemicals like toluene and trichloroethylene.',
      'Virtually indestructible—survives weeks without water or direct light.'
    ],
    tips: [
      'When in doubt, do NOT water. Overwatering is the single most common cause of plant death.',
      'Keep temperatures above 50°F (10°C) to prevent leaf damage.'
    ],
    warnings: [
      'Highly toxic if chewed by pets. Keep on safe tables or stands.'
    ],
    difficulty: 'Easy'
  },
  {
    id: 'lib-lavender',
    name: 'Lavender (Lavandula)',
    type: 'plant',
    category: 'Fragrant Outdoor Herb',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&q=80&w=600',
    description: 'An aromatic evergreen shrub native to the Mediterranean. Highly prized for its spikes of violet flowers, unique pine-sweet aroma, and therapeutic properties.',
    careInstructions: {
      wateringOrFeeding: 'Water deeply but very infrequently. Allow soil to dry out fully. Prefers dry, arid air.',
      sunlightOrEnvironment: 'Requires full, direct hot sunlight (6+ hours daily). Best placed outdoors.',
      soilOrExercise: 'Sandy, alkaline, dry, nutrient-poor soil. Needs perfect water drainage.'
    },
    purpose: 'Aromatic flower garden, pollination attractor, and therapeutic herbal use.',
    benefits: [
      'Incredible calming aromatherapy scent that relieves human anxiety and improves sleep quality.',
      'Attracts friendly pollinators like bees and butterflies to your yard.',
      'Can be dried and used for culinary teas, oils, or sachet bags.'
    ],
    tips: [
      'Prune back by one-third in spring to prevent the plant from becoming woody and leggy.',
      'Plant in terracotta pots if growing on balconies to help moisture escape.'
    ],
    warnings: [
      'Lavender oil is toxic to dogs and cats. Ensure they don\'t chew on the leaves.'
    ],
    difficulty: 'Hard'
  }
];
