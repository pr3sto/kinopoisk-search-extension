import browser from 'webextension-polyfill';
import { getKpSearchUrl } from '../lib/api/kinopoisk';

const contextMenuId = 'kinopoiskSearch';

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    id: contextMenuId,
    title: browser.i18n.getMessage('contextMenuTitle'),
    contexts: ['selection'],
  });
});

browser.contextMenus.onClicked.addListener(function (clickData) {
  if (
    clickData &&
    clickData.menuItemId === contextMenuId &&
    clickData.selectionText
  ) {
    browser.tabs.create({
      url: getKpSearchUrl(clickData.selectionText),
    });
  }
});
