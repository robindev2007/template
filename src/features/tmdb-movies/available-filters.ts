export interface FilterOption {
  label: string;
  emoji: string;
  value: string;
  tmdbParams?: Record<string, string | number | boolean>;
}

export interface FilterGroup {
  id: string;
  title: string;
  type: "single" | "multi" | "text";
  options: FilterOption[];
}

export const AVAILABLE_FILTERS: FilterGroup[] = [
  {
    id: "who-is-watching",
    title: "Who's Watching?",
    type: "single",
    options: [
      {
        label: "Just Me",
        emoji: "👤",
        value: "just-me",
        tmdbParams: { sort_by: "vote_average.desc", "vote_count.gte": 200 },
      },
      {
        label: "Couple",
        emoji: "❤️",
        value: "couple",
        tmdbParams: { with_genres: "10749,35,18" },
      },
      {
        label: "Family",
        emoji: "👨‍👩‍👧",
        value: "family",
        tmdbParams: { with_genres: "10751,16,12,35" },
      },
      {
        label: "Friends",
        emoji: "👥",
        value: "friends",
        tmdbParams: { with_genres: "35,28,12" },
      },
      {
        label: "Kids",
        emoji: "🧒",
        value: "kids",
        tmdbParams: { with_genres: "16,10751,12,35", without_genres: "28,53,27,10749,9648,80" },
      },
      {
        label: "Group",
        emoji: "👨‍👩‍👧‍👦",
        value: "group",
        tmdbParams: { sort_by: "popularity.desc" },
      },
    ],
  },
  {
    id: "media-type",
    title: "What Do You Want To Watch?",
    type: "single",
    options: [
      { label: "Movie", emoji: "🎬", value: "movie" },
      { label: "TV Show", emoji: "📺", value: "tv" },
      { label: "Either", emoji: "🔀", value: "either" },
      {
        label: "Documentary",
        emoji: "📖",
        value: "documentary",
        tmdbParams: { with_genres: "99" },
      },
      { label: "Anime", emoji: "🌸", value: "anime", tmdbParams: { with_original_language: "ja" } },
    ],
  },
  {
    id: "mood",
    title: "What's Your Mood?",
    type: "multi",
    options: [
      {
        label: "Exciting",
        emoji: "🔥",
        value: "exciting",
        tmdbParams: { sort_by: "popularity.desc" },
      },
      { label: "Funny", emoji: "😂", value: "funny", tmdbParams: { with_genres: "35" } },
      { label: "Romantic", emoji: "❤️", value: "romantic", tmdbParams: { with_genres: "10749" } },
      { label: "Thrilling", emoji: "😱", value: "thrilling", tmdbParams: { with_genres: "53" } },
      {
        label: "Mind-Bending",
        emoji: "🧠",
        value: "mind-bending",
        tmdbParams: { with_genres: "9648,878" },
      },
      { label: "Relaxing", emoji: "🌿", value: "relaxing", tmdbParams: { with_genres: "99,36" } },
      {
        label: "Emotional",
        emoji: "🥺",
        value: "emotional",
        tmdbParams: { with_genres: "18,10749" },
      },
      {
        label: "Feel Good",
        emoji: "😊",
        value: "feel-good",
        tmdbParams: { with_genres: "35,10751,16" },
      },
    ],
  },
  {
    id: "runtime",
    title: "How Much Time Do You Have?",
    type: "single",
    options: [
      {
        label: "Under 90 mins",
        emoji: "⏱️",
        value: "under-90",
        tmdbParams: { "with_runtime.lte": 90 },
      },
      {
        label: "90–120 mins",
        emoji: "⏰",
        value: "90-120",
        tmdbParams: { "with_runtime.gte": 90, "with_runtime.lte": 120 },
      },
      { label: "2+ Hours", emoji: "🕒", value: "2-plus", tmdbParams: { "with_runtime.gte": 120 } },
      { label: "No Preference", emoji: "✨", value: "no-preference" },
    ],
  },
  {
    id: "streaming",
    title: "Which Streaming Services Do You Have?",
    type: "multi",
    options: [
      {
        label: "Netflix",
        emoji: "🔴",
        value: "8",
        tmdbParams: { with_watch_providers: "8", watch_region: "US" },
      },
      {
        label: "Prime Video",
        emoji: "🟠",
        value: "119",
        tmdbParams: { with_watch_providers: "119", watch_region: "US" },
      },
      {
        label: "Disney+",
        emoji: "🔵",
        value: "337",
        tmdbParams: { with_watch_providers: "337", watch_region: "US" },
      },
      {
        label: "HBO Max",
        emoji: "🟣",
        value: "384",
        tmdbParams: { with_watch_providers: "384", watch_region: "US" },
      },
      {
        label: "Hulu",
        emoji: "🟢",
        value: "15",
        tmdbParams: { with_watch_providers: "15", watch_region: "US" },
      },
      {
        label: "Apple TV",
        emoji: "⬛",
        value: "350",
        tmdbParams: { with_watch_providers: "350", watch_region: "US" },
      },
      {
        label: "Paramount+",
        emoji: "🔷",
        value: "531",
        tmdbParams: { with_watch_providers: "531", watch_region: "US" },
      },
    ],
  },
  {
    id: "genres",
    title: "What genres do you enjoy?",
    type: "multi",
    options: [
      { label: "Romance", emoji: "❤️", value: "10749", tmdbParams: { with_genres: "10749" } },
      { label: "Comedy", emoji: "😂", value: "35", tmdbParams: { with_genres: "35" } },
      { label: "Drama", emoji: "🎭", value: "18", tmdbParams: { with_genres: "18" } },
      { label: "Sci-Fi", emoji: "🚀", value: "878", tmdbParams: { with_genres: "878" } },
      { label: "Fantasy", emoji: "🧙", value: "14", tmdbParams: { with_genres: "14" } },
      { label: "Mystery", emoji: "🔍", value: "9648", tmdbParams: { with_genres: "9648" } },
      { label: "Adventure", emoji: "🏔️", value: "12", tmdbParams: { with_genres: "12" } },
      { label: "Action", emoji: "💥", value: "28", tmdbParams: { with_genres: "28" } },
      { label: "Thriller", emoji: "🔪", value: "53", tmdbParams: { with_genres: "53" } },
      { label: "Horror", emoji: "👻", value: "27", tmdbParams: { with_genres: "27" } },
      { label: "Crime", emoji: "🕵️", value: "80", tmdbParams: { with_genres: "80" } },
      { label: "Animation", emoji: "🎨", value: "16", tmdbParams: { with_genres: "16" } },
    ],
  },
  {
    id: "avoid",
    title: "What would you like to avoid?",
    type: "multi",
    options: [
      { label: "No Horror", emoji: "🚫", value: "no-horror", tmdbParams: { without_genres: "27" } },
      {
        label: "No Romance",
        emoji: "💔",
        value: "no-romance",
        tmdbParams: { without_genres: "10749" },
      },
      {
        label: "No Documentary",
        emoji: "📚",
        value: "no-documentary",
        tmdbParams: { without_genres: "99" },
      },
      {
        label: "No Animation",
        emoji: "🎨",
        value: "no-animation",
        tmdbParams: { without_genres: "16" },
      },
      {
        label: "No Slow Drama",
        emoji: "🐌",
        value: "no-slow-drama",
        tmdbParams: { without_genres: "18" },
      },
      { label: "No Gore", emoji: "🩸", value: "no-gore", tmdbParams: { with_genres: "27,53,80" } },
      {
        label: "No Violence",
        emoji: "👊",
        value: "no-violence",
        tmdbParams: { without_genres: "28,80,53" },
      },
      { label: "No Sad Ending", emoji: "😢", value: "no-sad-ending" },
      {
        label: "No Sexual Content",
        emoji: "🔞",
        value: "no-sexual",
        tmdbParams: { include_adult: false },
      },
      {
        label: "No Jump Scares",
        emoji: "😱",
        value: "no-jump-scares",
        tmdbParams: { without_genres: "27,53" },
      },
    ],
  },
  {
    id: "ending-type",
    title: "What type of ending do you prefer?",
    type: "single",
    options: [
      { label: "Happy Ending", emoji: "😊", value: "happy" },
      { label: "Emotional Ending", emoji: "😭", value: "emotional" },
      { label: "Bittersweet Ending", emoji: "🌅", value: "bittersweet" },
      { label: "Unexpected Twist", emoji: "🤯", value: "twist" },
      { label: "No Preference", emoji: "✨", value: "no-preference" },
    ],
  },
  {
    id: "pace",
    title: "What pace do you enjoy?",
    type: "single",
    options: [
      { label: "Slow Burn", emoji: "🐢", value: "slow", tmdbParams: { "vote_average.gte": 7 } },
      { label: "Balanced", emoji: "⚖️", value: "balanced" },
      {
        label: "Fast-Paced",
        emoji: "⚡",
        value: "fast",
        tmdbParams: { sort_by: "popularity.desc" },
      },
    ],
  },
  {
    id: "decade",
    title: "Which decade do you prefer?",
    type: "single",
    options: [
      {
        label: "1960s–1980s",
        emoji: "📼",
        value: "1960-1980",
        tmdbParams: {
          "primary_release_date.gte": "1960-01-01",
          "primary_release_date.lte": "1989-12-31",
        },
      },
      {
        label: "1990s",
        emoji: "💿",
        value: "1990s",
        tmdbParams: {
          "primary_release_date.gte": "1990-01-01",
          "primary_release_date.lte": "1999-12-31",
        },
      },
      {
        label: "2000s",
        emoji: "📀",
        value: "2000s",
        tmdbParams: {
          "primary_release_date.gte": "2000-01-01",
          "primary_release_date.lte": "2009-12-31",
        },
      },
      {
        label: "2010s",
        emoji: "📱",
        value: "2010s",
        tmdbParams: {
          "primary_release_date.gte": "2010-01-01",
          "primary_release_date.lte": "2019-12-31",
        },
      },
      {
        label: "Recent Releases",
        emoji: "🆕",
        value: "recent",
        tmdbParams: { "primary_release_date.gte": "2020-01-01" },
      },
      { label: "No Preference", emoji: "✨", value: "no-preference" },
    ],
  },
  {
    id: "language",
    title: "What language do you prefer?",
    type: "single",
    options: [
      { label: "English", emoji: "🇬🇧", value: "en", tmdbParams: { with_original_language: "en" } },
      { label: "Korean", emoji: "🇰🇷", value: "ko", tmdbParams: { with_original_language: "ko" } },
      { label: "Japanese", emoji: "🇯🇵", value: "ja", tmdbParams: { with_original_language: "ja" } },
      { label: "Spanish", emoji: "🇪🇸", value: "es", tmdbParams: { with_original_language: "es" } },
      { label: "French", emoji: "🇫🇷", value: "fr", tmdbParams: { with_original_language: "fr" } },
      { label: "Any Language", emoji: "🌐", value: "any" },
    ],
  },
  {
    id: "award-winning",
    title: "Do you prefer award-winning content?",
    type: "single",
    options: [
      {
        label: "Yes",
        emoji: "🏆",
        value: "yes",
        tmdbParams: { "vote_count.gte": 1000, "vote_average.gte": 7 },
      },
      { label: "No", emoji: "👎", value: "no" },
      { label: "Doesn't Matter", emoji: "🤷", value: "doesnt-matter" },
    ],
  },
  {
    id: "tonight-mood",
    title: "What are you in the mood for tonight?",
    type: "single",
    options: [
      {
        label: "Something to Cry To",
        emoji: "😢",
        value: "cry",
        tmdbParams: { with_genres: "18,10749", sort_by: "vote_average.desc" },
      },
      {
        label: "Something Romantic",
        emoji: "❤️",
        value: "romantic-night",
        tmdbParams: { with_genres: "10749,10749", sort_by: "vote_average.desc" },
      },
      {
        label: "Something Fun",
        emoji: "🎉",
        value: "fun",
        tmdbParams: { with_genres: "35,10751", sort_by: "popularity.desc" },
      },
      {
        label: "Something Relaxing",
        emoji: "🌿",
        value: "relaxing-night",
        tmdbParams: { with_genres: "99,36", sort_by: "vote_average.desc" },
      },
      {
        label: "Something Mind-Blowing",
        emoji: "🤯",
        value: "mind-blowing",
        tmdbParams: { with_genres: "878,9648,14", sort_by: "vote_average.desc" },
      },
      {
        label: "Something Unforgettable",
        emoji: "✨",
        value: "unforgettable",
        tmdbParams: { "vote_average.gte": 8, "vote_count.gte": 5000 },
      },
      {
        label: "Surprise Me",
        emoji: "🎲",
        value: "surprise",
        tmdbParams: { sort_by: "popularity.desc" },
      },
    ],
  },
  {
    id: "favorite-actors",
    title: "Favorite actors or actresses",
    type: "text",
    options: [{ label: "Type Here", emoji: "🎭", value: "with_cast" }],
  },
  {
    id: "favorite-directors",
    title: "Favorite directors",
    type: "text",
    options: [{ label: "Type Here", emoji: "🎬", value: "with_crew" }],
  },
];
