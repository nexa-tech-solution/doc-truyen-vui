import AsyncStorage from '@react-native-async-storage/async-storage';
import { TComic } from '@src/utils/types/comic.types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ComicBookMarkState = {
  comics: TComic[];
  updateBookMarkComic: (comic: TComic) => void;
  isBookMarked: (comicId: string) => boolean;
};

export const useComicBookMarkStore = create<ComicBookMarkState>()(
  persist(
    (set, get) => ({
      comics: [],
      updateBookMarkComic: comic =>
        set(state => {
          const exists = state.comics.some(c => c.id === comic.id);
          if (exists) {
            return { comics: state.comics.filter(c => c.id !== comic.id) };
          } else {
            return { comics: [...state.comics, comic] };
          }
        }),
      isBookMarked: comicId => get().comics.some(c => c.id === comicId),
    }),
    {
      name: 'comic-bookmark-storage', // better key name
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
