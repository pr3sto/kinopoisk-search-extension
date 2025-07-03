import browser from 'webextension-polyfill';
import type { BookmarkFolder } from '../types/bookmark-folder';

const bookmarksState = $state<{
  rootFolder: BookmarkFolder | null;
  urls: string[];
}>({
  rootFolder: null,
  urls: [],
});

function loadBookmarks(bookmarkNode: browser.Bookmarks.BookmarkTreeNode): {
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
    const { folder: f, urls: u } = loadBookmarks(node);
    if (f !== null) {
      folder.children.push(f);
    }
    urls.push(...u);
  });

  return { folder, urls };
}

browser.bookmarks.getTree().then((bookmarkTreeNodes) => {
  const { folder, urls } = loadBookmarks(bookmarkTreeNodes[0]);
  bookmarksState.rootFolder = folder;
  bookmarksState.urls = urls;
});

export default bookmarksState;
