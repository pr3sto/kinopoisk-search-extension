type BookmarkFolder = {
  id: string;
  title: string;
  syncing: boolean;
  children: BookmarkFolder[];
};

export type { BookmarkFolder };
