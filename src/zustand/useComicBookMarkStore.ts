import AsyncStorage from '@react-native-async-storage/async-storage';
import { TComic } from '@src/utils/types/comic.types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
type ComicBookMarkState = {
  comics: string[];
  updateBookMarkComic: (comicId: string) => void;
  isBookMarked: (comicId: string) => boolean;
};

export const useComicBookMarkStore = create<ComicBookMarkState>()(
  persist(
    (set, get) => ({
      comics: [],
      updateBookMarkComic: comicId =>
        set(state => {
          const exists = state.comics.some(c => c === comicId);
          if (exists) {
            return { comics: state.comics.filter(c => c !== comicId) };
          } else {
            return { comics: [...state.comics, comicId] };
          }
        }),
      isBookMarked: comicId => get().comics.some(c => c === comicId),
    }),
    {
      name: 'comic-bookmark-storage', // better key name
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
