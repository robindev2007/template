import type { IconType } from "react-icons";
import {
  MdAnimation,
  MdAutoAwesome,
  MdDarkMode,
  MdDescription,
  MdDevices,
  MdExplore,
  MdFavorite,
  MdFlashOn,
  MdGavel,
  MdLiveTv,
  MdLocalMovies,
  MdMood,
  MdPeople,
  MdRocket,
  MdSearch,
  MdTheaterComedy,
  MdWhatshot,
} from "react-icons/md";

export interface WatchPreference {
  value: string;
  label: string;
  description: string;
  icon: IconType;
  iconName: string;
}

export const WATCH_PREFERENCES: WatchPreference[] = [
  {
    value: "movies",
    label: "Movies",
    description: "Feature films and cinematic experiences",
    icon: MdLocalMovies,
    iconName: "MdLocalMovies",
  },
  {
    value: "tv-shows",
    label: "TV Shows",
    description: "Series, episodes, and binge-worthy content",
    icon: MdLiveTv,
    iconName: "MdLiveTv",
  },
  {
    value: "both",
    label: "Both",
    description: "The best of movies and television",
    icon: MdDevices,
    iconName: "MdDevices",
  },
];

export interface Genre {
  value: string;
  label: string;
  icon: IconType;
  iconName: string;
}

export const GENRES: Genre[] = [
  { value: "action", label: "Action", icon: MdFlashOn, iconName: "MdFlashOn" },
  { value: "comedy", label: "Comedy", icon: MdMood, iconName: "MdMood" },
  { value: "drama", label: "Drama", icon: MdTheaterComedy, iconName: "MdTheaterComedy" },
  { value: "thriller", label: "Thriller", icon: MdWhatshot, iconName: "MdWhatshot" },
  { value: "romance", label: "Romance", icon: MdFavorite, iconName: "MdFavorite" },
  { value: "horror", label: "Horror", icon: MdDarkMode, iconName: "MdDarkMode" },
  { value: "mystery", label: "Mystery", icon: MdSearch, iconName: "MdSearch" },
  { value: "fantasy", label: "Fantasy", icon: MdAutoAwesome, iconName: "MdAutoAwesome" },
  { value: "animation", label: "Animation", icon: MdAnimation, iconName: "MdAnimation" },
  { value: "documentary", label: "Documentary", icon: MdDescription, iconName: "MdDescription" },
  { value: "crime", label: "Crime", icon: MdGavel, iconName: "MdGavel" },
  { value: "family", label: "Family", icon: MdPeople, iconName: "MdPeople" },
  { value: "sci-fi", label: "Sci-Fi", icon: MdRocket, iconName: "MdRocket" },
  { value: "adventure", label: "Adventure", icon: MdExplore, iconName: "MdExplore" },
];
