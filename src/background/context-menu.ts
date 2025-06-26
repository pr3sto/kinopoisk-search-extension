import { getKpSearchUrl } from '../lib/api/kinopoisk';

const contextMenuId = 'kinopoiskSearch';

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: contextMenuId,
    title: chrome.i18n.getMessage('contextMenuTitle'),
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (
    clickData &&
    clickData.menuItemId === contextMenuId &&
    clickData.selectionText
  ) {
    chrome.tabs.create({
      url: getKpSearchUrl(clickData.selectionText),
    });
  }
});
