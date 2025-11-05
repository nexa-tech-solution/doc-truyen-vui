export type TChapter = {
  id: string;
  chapter: number;
  count: number;
  createdAt: Date; // store as ISO string instead of Date
  links: string[];
};

export type TComic = {
  author: string;
  banner: string;
  createdAt: string; // same here
  description: string;
  hash_tags: string[];
  id: string;
  name: string;
  ratings: number;
  updatedAt: string;
  views: number;
  chapters: TChapter[];
};
