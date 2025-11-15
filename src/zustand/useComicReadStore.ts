import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ComicRead = {
  id: string;
  chapterIds: string[];
};

export type ComicReadState = {
  comics: ComicRead[];
  updateReadComic: (comicId: string, chapterId: string) => void;
  checkReadComic: (comicId: string, chapterId: string) => boolean;
};

export const useComicReadStore = create<ComicReadState>()(
  persist(
    (set, get) => ({
      comics: [],
      updateReadComic: (comicId, chapterId) =>
        set(state => {
          const index = state.comics.findIndex(c => c.id === comicId);

          if (index === -1) {
            return {
              comics: [
                ...state.comics,
                { id: comicId, chapterIds: [chapterId] },
              ],
            };
          }

          const comic = state.comics[index];
          if (comic.chapterIds.includes(chapterId)) return state;

          const comics = [...state.comics];
          comics[index] = {
            ...comic,
            chapterIds: [...comic.chapterIds, chapterId],
          };

          return { comics };
        }),
      checkReadComic: (comicId, chapterId) => {
        const comic = get().comics.find(item => item.id === comicId);
        return comic ? comic.chapterIds.includes(chapterId) : false;
      },
    }),
    {
      name: 'comic-read-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
