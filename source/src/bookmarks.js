export let bookmarkFolders;

// load bookmark folders
chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
  bookmarkFolders = listFolders(bookmarkTreeNodes[0]);
});

function listFolders(bookmarkNode) {
  let list = [];

  // not a floder
  if (!bookmarkNode.children) {
    return list;
  }

  // add current folder if it is not a root folder
  if (bookmarkNode.id != 0) {
    list = list.concat({
      id: bookmarkNode.id,
      title: bookmarkNode.title,
    });
  }

  // add folders recursively
  for (let i = 0; i < bookmarkNode.children.length; i++) {
    list = list.concat(listFolders(bookmarkNode.children[i]));
  }

  return list;
}
