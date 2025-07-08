import browser from 'webextension-polyfill';

export type BookmarkFolder = {
  id: string;
  title: string;
  children: BookmarkFolder[];
};

const bookmarks = $state<{
  rootFolder: BookmarkFolder | null;
  urls: string[];
}>({
  rootFolder: null,
  urls: [],
});

export default bookmarks;

browser.bookmarks.getTree().then((bookmarkTreeNodes) => {
  const { folder, urls } = __loadBookmarks(bookmarkTreeNodes[0]);
  bookmarks.rootFolder = folder;
  bookmarks.urls = urls;
});

function __loadBookmarks(bookmarkNode: browser.Bookmarks.BookmarkTreeNode): {
  folder: BookmarkFolder | null;
  urls: string[];
} {
  const urls: string[] = [];

  // add bookmark url
  if (bookmarkNode.url) {
    // remove '/' at the end
    urls.push(bookmarkNode.url.replace(/\/+$/, ''));
    return { folder: null, urls };
  }

  let folder: BookmarkFolder = {
    id: bookmarkNode.id,
    title: bookmarkNode.title,
    children: [],
  };

  // search children recursively
  bookmarkNode.children?.forEach((node) => {
    const { folder: f, urls: u } = __loadBookmarks(node);
    if (f !== null) {
      folder.children.push(f);
    }
    urls.push(...u);
  });

  return { folder, urls };
}
