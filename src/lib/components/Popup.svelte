<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getKpChanceUrl,
    getKpSearchUrl,
    getKpSuggestionsAsync,
  } from '../api/kinopoisk';
  import type { Suggestions } from '../types/suggestions';
  import { isButtonDown, isButtonUp } from '../utils/buttons';
  import { debounce } from '../utils/debounce';
  import SuggestionItem from './SuggestionItem.svelte';

  // localization
  const i18n_searchPlaceholder = chrome.i18n.getMessage('searchPlaceholder');
  const i18n_searchIconTitle = chrome.i18n.getMessage('searchIconTitle');
  const i18n_noSuggestionsFound = chrome.i18n.getMessage('noSuggestionsFound');
  const i18n_firstSuggestionHeader = chrome.i18n.getMessage(
    'firstSuggestionHeader',
  );
  const i18n_movieSuggestionHeader = chrome.i18n.getMessage(
    'movieSuggestionHeader',
  );
  const i18n_personSuggestionHeader = chrome.i18n.getMessage(
    'personSuggestionHeader',
  );
  const i18n_showAllMessage = chrome.i18n.getMessage('showAllMessage');

  let searchInput: HTMLInputElement;
  let previousSearch = '';
  let searchText = $state('');
  let suggestionsLoading = $state(false);
  let suggestionsLoaded = $state(false);
  let suggestions: Suggestions = $state({
    first: null,
    movies: [],
    persons: [],
  });

  let controller = new AbortController();

  // delay api call when user type search input
  const debouncedLoadSuggestions = debounce(loadSuggestions, 200);

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.target === null || !(isButtonUp(event) || isButtonDown(event))) {
      return;
    }

    const navigationItems = Array.from(
      document.querySelectorAll<HTMLElement>('[data-navigation-item]'),
    );
    if (navigationItems.length === 0) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    const currentNavigationItem = (event.target as HTMLElement).closest(
      '[data-navigation-item]',
    ) as HTMLElement | null;

    let currentPosition = currentNavigationItem
      ? navigationItems.indexOf(currentNavigationItem)
      : -1;

    if (currentPosition === -1) {
      navigationItems[0].focus();
    }

    let nextPosition = isButtonDown(event)
      ? currentPosition + 1
      : currentPosition - 1;

    if (nextPosition >= 0 && nextPosition < navigationItems.length) {
      navigationItems[nextPosition].focus();
    }
  }

  function handleSearchbarButtonClick() {
    chrome.tabs.create({
      url: searchText.length ? getKpSearchUrl(searchText) : getKpChanceUrl(),
    });
  }

  function handleSearchbarInput() {
    const currentSearch = searchText.trim();

    if (currentSearch.length === 0) {
      controller.abort('empty search');
      controller = new AbortController();

      previousSearch = '';
      suggestionsLoaded = false;
      clearSuggestion();
      return;
    }

    if (currentSearch === previousSearch) {
      return;
    }

    controller.abort('new search');
    controller = new AbortController();
    debouncedLoadSuggestions(controller.signal);
    previousSearch = currentSearch;
  }

  async function loadSuggestions(signal: AbortSignal) {
    suggestionsLoading = true;
    const kpSuggestions = await getKpSuggestionsAsync(searchText, signal);
    suggestionsLoading = false;

    if (!signal.aborted) {
      suggestionsLoaded = true;

      if (kpSuggestions) {
        suggestions = kpSuggestions;
      } else {
        clearSuggestion();
      }
    }
  }

  function clearSuggestion() {
    suggestions.first = null;
    suggestions.movies = [];
    suggestions.persons = [];
  }

  onMount(() => {
    searchInput.focus();
  });
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div id="logo">
  <a href="https://www.kinopoisk.ru/" target="_blank">
    <img alt="https://www.kinopoisk.ru/" />
  </a>
</div>

<div id="searchbar">
  <input
    bind:this={searchInput}
    bind:value={searchText}
    id="searchbar__input"
    type="text"
    autocomplete="off"
    placeholder={i18n_searchPlaceholder}
    data-navigation-item
    oninput={handleSearchbarInput} />
  <button
    id="searchbar__button"
    title={i18n_searchIconTitle}
    aria-label={i18n_searchIconTitle}
    onclick={handleSearchbarButtonClick}></button>
</div>

<div id="suggestions" class={suggestionsLoading ? 'loading' : ''}>
  {#if suggestionsLoading}
    <div id="suggestions__loader">
      <span id="suggestions__loader__spinner"></span>
    </div>
  {/if}
  {#if suggestionsLoaded}
    {#if !suggestions.first && !suggestions.movies.length && !suggestions.persons.length}
      <span id="suggestions__empty">{i18n_noSuggestionsFound}</span>
    {:else}
      {#if suggestions.first}
        <div class="suggestions__section">
          <div class="suggestions__section__header">
            <span>{i18n_firstSuggestionHeader}</span>
          </div>
          <SuggestionItem item={suggestions.first} />
        </div>
      {/if}
      {#if suggestions.movies.length}
        <div class="suggestions__section">
          <div class="suggestions__section__header">
            <span>{i18n_movieSuggestionHeader}</span>
          </div>
          {#each suggestions.movies as item}
            <SuggestionItem {item} />
          {/each}
        </div>
      {/if}
      {#if suggestions.persons.length}
        <div class="suggestions__section">
          <div class="suggestions__section__header">
            <span>{i18n_personSuggestionHeader}</span>
          </div>
          {#each suggestions.persons as item}
            <SuggestionItem {item} />
          {/each}
        </div>
      {/if}
    {/if}
    <a
      id="suggestions__show-all-link"
      href={getKpSearchUrl(searchText)}
      title={getKpSearchUrl(searchText)}
      target="_blank"
      data-navigation-item>{i18n_showAllMessage}</a>
  {/if}
</div>

<style lang="scss">
  @use '../styles/colors.scss' as *;
  @use '../styles/dimensions.scss' as *;

  $empty-suggestions-height: 100px;
  $spinner-width: 25px;

  #logo {
    margin: $margin-global;

    & img {
      content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY0IiBoZWlnaHQ9IjM2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNTguODU5IDE4YzAtNS44ODkgMi45NTQtMTAuNiA4LjI4MS0xMC42IDUuMzI4IDAgOC4yODEgNC43MTEgOC4yODEgMTAuNiAwIDUuODktMi45NTQgMTAuNi04LjI4IDEwLjYtNS4zMjggMC04LjI4Mi00LjcxLTguMjgyLTEwLjZabTguMjgxIDcuNjZjMi4wNzIgMCAyLjk1NC0zLjUzNCAyLjk1NC03LjY1MiAwLTQuMTItLjg4OS03LjY1Mi0yLjk1NC03LjY1Mi0yLjA2NSAwLTIuOTU0IDMuNTMzLTIuOTU0IDcuNjUyLS4wMDcgNC4xMTguODgyIDcuNjUyIDIuOTU0IDcuNjUyWk0zLjg0MyA3Ljd2NS41OTZoLjI5NEw3Ljk4IDcuN2g1LjMybC03LjA5OCA2LjQ3NC4yOTQuMjkzTDE5LjUxIDcuNjkzdjQuNzExTDcuOTczIDE2LjUyM3YuMjkybDExLjUzNy0xLjAyOHY0LjQxOUw3Ljk3MyAxOS4xNzh2LjI5M2wxMS41MzcgNC4xMTh2NC43MTJMNi40OTYgMjEuNTI2bC0uMjk0LjI5MyA3LjA5OCA2LjQ3NEg3Ljk4bC0zLjg0My01LjU5NmgtLjI5NHY1LjU5NkgwVjcuNjg2aDMuODQzVjcuN1ptMTkuMjMgMEgyOC4xbC0uMjk0IDEyLjM2M2guMjk0TDM0LjAxNSA3LjdoNC40Mzh2MjAuNjA4aC01LjAyNmwuMjk0LTEyLjM2NGgtLjI5NEwyNy41MSAyOC4zMDloLTQuNDM4VjcuN1ptMjMuOTU1IDBoLTUuMDI2djIwLjYwOGg1LjAyNnYtOS4xM2g0LjEzN3Y5LjEzaDUuMDI2VjcuN2gtNS4wMjZ2Ny45NTJoLTQuMTM3VjcuN1ptNDUuMjUgMGgtMTQuMTl2MjAuNjA4aDUuMDI3VjExLjIzM2g0LjEzN3YxNy4wNzVoNS4wMjZWNy43Wm0yLjY2IDEwLjNjMC01Ljg4OSAyLjk1NC0xMC42IDguMjgyLTEwLjYgNS4zMiAwIDguMjgxIDQuNzExIDguMjgxIDEwLjYgMCA1Ljg5LTIuOTU0IDEwLjYtOC4yODEgMTAuNi01LjMyIDAtOC4yODItNC43MS04LjI4Mi0xMC42Wm04LjI4MiA3LjY2YzIuMDcyIDAgMi45NTQtMy41MzQgMi45NTQtNy42NTIgMC00LjEyLS44ODktNy42NTItMi45NTQtNy42NTItMi4wNzIgMC0yLjk1NCAzLjUzMy0yLjk1NCA3LjY1MiAwIDQuMTE4Ljg4MiA3LjY1MiAyLjk1NCA3LjY1MlpNMTE5LjE4NyA3LjdoLTUuMDI2djIwLjYwOGg0LjQzOGw1LjkxNi0xMi4zNjRoLjI5NGwtLjI5NCAxMi4zNjRoNS4wMjZWNy43aC00LjQzOGwtNS45MTYgMTIuMzYzaC0uMjk0bC4yOTQtMTIuMzYzWm0yMy42NjkgMTMuNTQxIDQuNzMyLjU4NWMtLjg4OSA0LjEyLTIuOTU0IDYuNzc0LTcuMzY0IDYuNzc0LTUuMzIgMC04LjAxNi00LjcxLTguMDE2LTEwLjYgMC01Ljg4OSAyLjY4OS0xMC42IDguMDE2LTEwLjYgNC4zMTcgMCA2LjQ3NSAyLjY0OSA3LjM2NCA2LjQ3NWwtNC43MzIgMS4xNzdjLS4yOTQtMi4wNjMtMS4xNTUtNC43MS0yLjYzMi00LjcxLTEuNzcxIDAtMi42ODkgMy41MzMtMi42ODkgNy42NTEgMCA0LjA5LjkxOCA3LjY1MiAyLjY4OSA3LjY1MiAxLjQ0OS4wMTUgMi4zMy0yLjM0MSAyLjYzMi00LjQwNFptMTEuODMtMTMuNTRoLTQuNzMydjIwLjYwN2g0LjczMnYtOS4xM2guMjk0bDMuNTQ5IDkuMTNIMTY0bC01LjE3Ny0xMC42TDE2My44NDkgNy43aC01LjAyNmwtMy44NDMgOS4xM2gtLjI5NFY3LjdaIiBmaWxsPSIjZmZmIi8+PC9zdmc+Cg==');
    }
  }

  #searchbar {
    position: relative;
    margin: $margin-global;
  }

  #searchbar__input {
    width: 100%;
    height: 100%;
    padding: 7px 40px 7px 13px;
    outline: none;
    border: 2px solid $background-color-light;
    border-radius: $border-radius;
    background: $background-color-base;
    color: $font-color-dark;
    font-size: $font-size-primary;
    transition: border 0.1s ease-out;

    &:focus {
      border: 2px solid $accent-color;
    }
  }

  #searchbar__button {
    position: absolute;
    right: calc($icon-width-regular/2);
    width: $icon-width-regular;
    height: 100%;
    border: none;
    background: $font-color-light;
    mask: url("data:image/svg+xml,%3Csvg class='styles_iconActive__dJx1_ styles_icon__1bYKL search-form-submit-button__icon' width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' d='M13.6667 8.74984C13.6667 11.4652 11.4654 13.6665 8.75002 13.6665C6.03462 13.6665 3.83335 11.4652 3.83335 8.74984C3.83335 6.03444 6.03462 3.83317 8.75002 3.83317C11.4654 3.83317 13.6667 6.03444 13.6667 8.74984ZM12.7965 14.5643C11.6494 15.3641 10.2545 15.8332 8.75002 15.8332C4.838 15.8332 1.66669 12.6619 1.66669 8.74984C1.66669 4.83782 4.838 1.6665 8.75002 1.6665C12.662 1.6665 15.8334 4.83782 15.8334 8.74984C15.8334 10.2544 15.3643 11.6494 14.5643 12.7966L17.9672 16.1994L16.1994 17.9672L12.7965 14.5643Z' fill='%23000'%3E%3C/path%3E%3C/svg%3E")
      center no-repeat;
    transition: background 0.1s ease-out;
    cursor: pointer;

    &:hover,
    &:focus {
      background: $accent-color;
    }
  }

  #suggestions {
    position: relative;
    margin: $margin-global;
    background: $background-color-base;
    border-radius: $border-radius;

    &.loading {
      min-height: $empty-suggestions-height;
    }
  }

  #suggestions__loader {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: rgba($background-color-light, 0.4);
    border-radius: $border-radius;
    z-index: 1;
  }

  #suggestions__loader__spinner {
    width: $spinner-width;
    height: $spinner-width;
    background: url("data:image/svg+xml,%3csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3e %3cpath fill-rule='evenodd' clip-rule='evenodd' d='M38 21.7812C39.1046 21.7812 40 20.8857 40 19.7812C40 16.4227 39.1289 13.1215 37.4716 10.1931C35.8144 7.26482 33.4269 4.80806 30.5394 3.05533C27.6521 1.30268 24.3602 0.311856 20.9779 0.175725C17.5957 0.0396014 14.2337 0.762609 11.2125 2.27704C8.1912 3.79152 5.61034 6.04765 3.71825 8.83228C1.82604 11.6171 0.686423 14.8367 0.410182 18.184C0.133941 21.5313 0.730541 24.892 2.14186 27.9447C3.55312 30.9972 5.73119 33.6384 8.46572 35.618C9.36046 36.2657 10.6109 36.0654 11.2586 35.1707C11.9063 34.2759 11.706 33.0255 10.8113 32.3778C8.62856 30.7978 6.89462 28.693 5.77262 26.2661C4.65068 23.8393 4.17734 21.1702 4.39663 18.513C4.61592 15.8557 5.52077 13.2967 7.02675 11.0803C8.53285 8.86379 10.5905 7.06326 13.005 5.85293C15.4197 4.64253 18.1094 4.06351 20.8171 4.17249C23.5247 4.28147 26.1575 5.07468 28.4639 6.47468C30.7701 7.87459 32.6721 9.83382 33.9904 12.1632C35.3087 14.4925 36 17.1152 36 19.7812C36 20.8857 36.8954 21.7812 38 21.7812Z' fill='url(%23paint0_linear_2273_385542)'/%3e %3cpath fill-rule='evenodd' clip-rule='evenodd' d='M38 21.7812C39.1046 21.7812 40 20.8857 40 19.7812C40 16.4227 39.1289 13.1215 37.4716 10.1931C35.8144 7.26482 33.4269 4.80806 30.5394 3.05533C27.6521 1.30268 24.3602 0.311856 20.9779 0.175725C17.5957 0.0396014 14.2337 0.762609 11.2125 2.27704C8.1912 3.79152 5.61034 6.04765 3.71825 8.83228C1.82604 11.6171 0.686423 14.8367 0.410182 18.184C0.133941 21.5313 0.730541 24.892 2.14186 27.9447C3.55312 30.9972 5.73119 33.6384 8.46572 35.618C9.36046 36.2657 10.6109 36.0654 11.2586 35.1707C11.9063 34.2759 11.706 33.0255 10.8113 32.3778C8.62856 30.7978 6.89462 28.693 5.77262 26.2661C4.65068 23.8393 4.17734 21.1702 4.39663 18.513C4.61592 15.8557 5.52077 13.2967 7.02675 11.0803C8.53285 8.86379 10.5905 7.06326 13.005 5.85293C15.4197 4.64253 18.1094 4.06351 20.8171 4.17249C23.5247 4.28147 26.1575 5.07468 28.4639 6.47468C30.7701 7.87459 32.6721 9.83382 33.9904 12.1632C35.3087 14.4925 36 17.1152 36 19.7812C36 20.8857 36.8954 21.7812 38 21.7812Z' fill='url(%23paint1_linear_2273_385542)'/%3e %3cdefs%3e %3clinearGradient id='paint0_linear_2273_385542' x1='17.5182' y1='3.23439' x2='31.7837' y2='3.84393' gradientUnits='userSpaceOnUse'%3e %3cstop stop-color='%23FF5500' stop-opacity='0'/%3e %3cstop offset='0.274076' stop-color='%23FF5500' stop-opacity='0.12'/%3e %3cstop offset='1' stop-color='%23FF5500'/%3e %3c/linearGradient%3e %3clinearGradient id='paint1_linear_2273_385542' x1='21.1721' y1='29.0773' x2='10.2583' y2='5.10359' gradientUnits='userSpaceOnUse'%3e %3cstop stop-color='%23FF5500' stop-opacity='0'/%3e %3cstop offset='1' stop-color='%23FF5500'/%3e %3c/linearGradient%3e %3c/defs%3e%3c/svg%3e")
      center / contain no-repeat;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  #suggestions__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: $empty-suggestions-height;
    color: $font-color-light;
    font-size: $font-size-primary;
  }

  .suggestions__section {
    padding-bottom: $spacing-vertical-lg;
    border-bottom: 1px solid $background-color-light;
  }

  .suggestions__section__header {
    padding: $spacing-vertical-lg $spacing-horizontal-lg $spacing-vertical-sm;
    color: $font-color-light;
    font-size: $font-size-secondary;
  }

  #suggestions__show-all-link {
    position: relative;
    display: block;
    padding: $spacing-vertical-lg $spacing-horizontal-lg;
    outline: none;
    background: $background-color-light;
    border-radius: 0 0 $border-radius $border-radius;
    color: $font-color-light;
    font-size: $font-size-secondary;
    text-decoration: none;
    transition: background 0.1s ease-out;

    &:hover,
    &:focus {
      background: $background-color-dark;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: $icon-width-small;
      width: $icon-width-small;
      height: 100%;
      background: $font-color-light;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' x='0' y='0' width='100' height='100' viewBox='0 0 48 48'%3E%3Cpath d='M 40.960938 4.9804688 A 2.0002 2.0002 0 0 0 40.740234 5 L 28 5 A 2.0002 2.0002 0 1 0 28 9 L 36.171875 9 L 22.585938 22.585938 A 2.0002 2.0002 0 1 0 25.414062 25.414062 L 39 11.828125 L 39 20 A 2.0002 2.0002 0 1 0 43 20 L 43 7.2460938 A 2.0002 2.0002 0 0 0 40.960938 4.9804688 z M 12.5 8 C 8.3826878 8 5 11.382688 5 15.5 L 5 35.5 C 5 39.617312 8.3826878 43 12.5 43 L 32.5 43 C 36.617312 43 40 39.617312 40 35.5 L 40 26 A 2.0002 2.0002 0 1 0 36 26 L 36 35.5 C 36 37.446688 34.446688 39 32.5 39 L 12.5 39 C 10.553312 39 9 37.446688 9 35.5 L 9 15.5 C 9 13.553312 10.553312 12 12.5 12 L 22 12 A 2.0002 2.0002 0 1 0 22 8 L 12.5 8 z'%3E%3C/path%3E%3C/svg%3E")
        center / contain no-repeat;
    }
  }
</style>
