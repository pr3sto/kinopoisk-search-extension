import type { BookmarkFolder } from '../types/bookmark-folder';

export const bookmarksState = $state<{
  folders: BookmarkFolder[];
  urls: string[];
}>({
  folders: [],
  urls: [],
});

function loadBookmarks(bookmarkNode: chrome.bookmarks.BookmarkTreeNode): {
  folders: BookmarkFolder[];
  urls: string[];
} {
  const folders: BookmarkFolder[] = [];
  const urls: string[] = [];

  // add bookmark url
  if (bookmarkNode.url) {
    // remove '/' at the end
    urls.push(bookmarkNode.url.replace(/\/+$/, ''));
    return { folders, urls };
  }

  // add current folder if it is not a root folder
  if (bookmarkNode.id != '0') {
    folders.push({
      id: bookmarkNode.id,
      title: bookmarkNode.title,
    });
  }

  // search folders recursively
  bookmarkNode.children?.forEach((node) => {
    const { folders: childFolders, urls: childUrls } = loadBookmarks(node);
    folders.push(...childFolders);
    urls.push(...childUrls);
  });

  return { folders, urls };
}

chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
  const { folders, urls } = loadBookmarks(bookmarkTreeNodes[0]);
  bookmarksState.folders = folders;
  bookmarksState.urls = urls;
});
