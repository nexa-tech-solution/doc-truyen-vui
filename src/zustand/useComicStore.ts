import AsyncStorage from '@react-native-async-storage/async-storage';
import { TChapter, TComic } from '@src/utils/types/comic.types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ComicState = {
  comics: TComic[];
  updateComic: (comics: TComic[]) => void;
  updateComicChapter: (comicId: string, chapters: TChapter[]) => void;
  getComic: (id: string) => TComic | undefined;
  getChapter: (comicId: string, chapterId: string) => TChapter | undefined;
};

export const useComicStore = create<ComicState>()(
  persist(
    (set, get) => ({
      comics: [],
      updateComic: comics => set({ comics }),
      updateComicChapter: (comicId, chapters) =>
        set(state => ({
          comics: state.comics.map(comic =>
            comic.id === comicId ? { ...comic, chapters } : comic,
          ),
        })),
      getComic: id => get().comics.find(comic => comic.id === id),
      getChapter: (comicId, chapterId) => {
        const comic = get().comics.find(comic => comic.id === comicId);
        const chapter = comic?.chapters?.find(item => item.id === chapterId);
        return chapter;
      },
    }),
    {
      name: 'comic-storage', // better key name
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
