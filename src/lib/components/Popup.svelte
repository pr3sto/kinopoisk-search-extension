<script lang="ts">
  import { onMount } from 'svelte';
  import browser from 'webextension-polyfill';
  import {
    getKpChanceUrl,
    getKpSearchUrl,
    getKpSuggestionsAsync,
  } from '../api/kinopoisk';
  import type { Suggestions } from '../types/suggestions';
  import { debounce } from '../utils/debounce';
  import SuggestionItem from './SuggestionItem.svelte';

  // localization
  const i18n_searchPlaceholder = browser.i18n.getMessage('searchPlaceholder');
  const i18n_searchIconTitle = browser.i18n.getMessage('searchIconTitle');
  const i18n_noSuggestionsFound = browser.i18n.getMessage('noSuggestionsFound');
  const i18n_firstSuggestionHeader = browser.i18n.getMessage(
    'firstSuggestionHeader',
  );
  const i18n_movieSuggestionHeader = browser.i18n.getMessage(
    'movieSuggestionHeader',
  );
  const i18n_personSuggestionHeader = browser.i18n.getMessage(
    'personSuggestionHeader',
  );
  const i18n_showAllMessage = browser.i18n.getMessage('showAllMessage');

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

  function handleSearchbarButtonClick() {
    browser.tabs.create({
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

<header id="logo">
  <a href="https://www.kinopoisk.ru/" target="_blank">
    <img alt="https://www.kinopoisk.ru/" />
  </a>
</header>

<search id="searchbar">
  <input
    bind:this={searchInput}
    bind:value={searchText}
    id="searchbar__input"
    type="text"
    autocomplete="off"
    placeholder={i18n_searchPlaceholder}
    oninput={handleSearchbarInput} />
  <button
    id="searchbar__button"
    title={i18n_searchIconTitle}
    aria-label={i18n_searchIconTitle}
    onclick={handleSearchbarButtonClick}></button>
</search>

<main id="suggestions" class={suggestionsLoading ? 'loading' : ''}>
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
        <section class="suggestions__section">
          <h2 class="suggestions__section__header">
            {i18n_firstSuggestionHeader}
          </h2>
          <SuggestionItem item={suggestions.first} />
        </section>
      {/if}
      {#if suggestions.movies.length}
        <section class="suggestions__section">
          <h2 class="suggestions__section__header">
            {i18n_movieSuggestionHeader}
          </h2>
          {#each suggestions.movies as item}
            <SuggestionItem {item} />
          {/each}
        </section>
      {/if}
      {#if suggestions.persons.length}
        <section class="suggestions__section">
          <h2 class="suggestions__section__header">
            {i18n_personSuggestionHeader}
          </h2>
          {#each suggestions.persons as item}
            <SuggestionItem {item} />
          {/each}
        </section>
      {/if}
    {/if}
    <a
      id="suggestions__show-all-link"
      href={getKpSearchUrl(searchText)}
      title={getKpSearchUrl(searchText)}
      target="_blank"
      data-navigation-item>{i18n_showAllMessage}</a>
  {/if}
</main>

<style lang="scss">
  @use '/src/styles/colors.scss' as *;
  @use '/src/styles/dimensions.scss' as *;

  $empty-suggestions-height: 100px;
  $spinner-width: 25px;

  #logo {
    margin-top: $margin-global;
    margin-left: $margin-global;
    margin-right: $margin-global;

    & a {
      display: inline-block;
    }

    & img {
      content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY0IiBoZWlnaHQ9IjM2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNTguODU5IDE4YzAtNS44ODkgMi45NTQtMTAuNiA4LjI4MS0xMC42IDUuMzI4IDAgOC4yODEgNC43MTEgOC4yODEgMTAuNiAwIDUuODktMi45NTQgMTAuNi04LjI4IDEwLjYtNS4zMjggMC04LjI4Mi00LjcxLTguMjgyLTEwLjZabTguMjgxIDcuNjZjMi4wNzIgMCAyLjk1NC0zLjUzNCAyLjk1NC03LjY1MiAwLTQuMTItLjg4OS03LjY1Mi0yLjk1NC03LjY1Mi0yLjA2NSAwLTIuOTU0IDMuNTMzLTIuOTU0IDcuNjUyLS4wMDcgNC4xMTguODgyIDcuNjUyIDIuOTU0IDcuNjUyWk0zLjg0MyA3Ljd2NS41OTZoLjI5NEw3Ljk4IDcuN2g1LjMybC03LjA5OCA2LjQ3NC4yOTQuMjkzTDE5LjUxIDcuNjkzdjQuNzExTDcuOTczIDE2LjUyM3YuMjkybDExLjUzNy0xLjAyOHY0LjQxOUw3Ljk3MyAxOS4xNzh2LjI5M2wxMS41MzcgNC4xMTh2NC43MTJMNi40OTYgMjEuNTI2bC0uMjk0LjI5MyA3LjA5OCA2LjQ3NEg3Ljk4bC0zLjg0My01LjU5NmgtLjI5NHY1LjU5NkgwVjcuNjg2aDMuODQzVjcuN1ptMTkuMjMgMEgyOC4xbC0uMjk0IDEyLjM2M2guMjk0TDM0LjAxNSA3LjdoNC40Mzh2MjAuNjA4aC01LjAyNmwuMjk0LTEyLjM2NGgtLjI5NEwyNy41MSAyOC4zMDloLTQuNDM4VjcuN1ptMjMuOTU1IDBoLTUuMDI2djIwLjYwOGg1LjAyNnYtOS4xM2g0LjEzN3Y5LjEzaDUuMDI2VjcuN2gtNS4wMjZ2Ny45NTJoLTQuMTM3VjcuN1ptNDUuMjUgMGgtMTQuMTl2MjAuNjA4aDUuMDI3VjExLjIzM2g0LjEzN3YxNy4wNzVoNS4wMjZWNy43Wm0yLjY2IDEwLjNjMC01Ljg4OSAyLjk1NC0xMC42IDguMjgyLTEwLjYgNS4zMiAwIDguMjgxIDQuNzExIDguMjgxIDEwLjYgMCA1Ljg5LTIuOTU0IDEwLjYtOC4yODEgMTAuNi01LjMyIDAtOC4yODItNC43MS04LjI4Mi0xMC42Wm04LjI4MiA3LjY2YzIuMDcyIDAgMi45NTQtMy41MzQgMi45NTQtNy42NTIgMC00LjEyLS44ODktNy42NTItMi45NTQtNy42NTItMi4wNzIgMC0yLjk1NCAzLjUzMy0yLjk1NCA3LjY1MiAwIDQuMTE4Ljg4MiA3LjY1MiAyLjk1NCA3LjY1MlpNMTE5LjE4NyA3LjdoLTUuMDI2djIwLjYwOGg0LjQzOGw1LjkxNi0xMi4zNjRoLjI5NGwtLjI5NCAxMi4zNjRoNS4wMjZWNy43aC00LjQzOGwtNS45MTYgMTIuMzYzaC0uMjk0bC4yOTQtMTIuMzYzWm0yMy42NjkgMTMuNTQxIDQuNzMyLjU4NWMtLjg4OSA0LjEyLTIuOTU0IDYuNzc0LTcuMzY0IDYuNzc0LTUuMzIgMC04LjAxNi00LjcxLTguMDE2LTEwLjYgMC01Ljg4OSAyLjY4OS0xMC42IDguMDE2LTEwLjYgNC4zMTcgMCA2LjQ3NSAyLjY0OSA3LjM2NCA2LjQ3NWwtNC43MzIgMS4xNzdjLS4yOTQtMi4wNjMtMS4xNTUtNC43MS0yLjYzMi00LjcxLTEuNzcxIDAtMi42ODkgMy41MzMtMi42ODkgNy42NTEgMCA0LjA5LjkxOCA3LjY1MiAyLjY4OSA3LjY1MiAxLjQ0OS4wMTUgMi4zMy0yLjM0MSAyLjYzMi00LjQwNFptMTEuODMtMTMuNTRoLTQuNzMydjIwLjYwN2g0LjczMnYtOS4xM2guMjk0bDMuNTQ5IDkuMTNIMTY0bC01LjE3Ny0xMC42TDE2My44NDkgNy43aC01LjAyNmwtMy44NDMgOS4xM2gtLjI5NFY3LjdaIiBmaWxsPSIjZmZmIi8+PC9zdmc+Cg==');
    }
  }

  #searchbar {
    position: relative;
    margin-left: $margin-global;
    margin-right: $margin-global;
    margin-bottom: $margin-global;
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
    right: 13px;
    width: $icon-size;
    height: 100%;
    border: none;
    background: $font-color-light;
    mask: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' d='M13.667 8.75a4.917 4.917 0 1 1-9.834 0 4.917 4.917 0 0 1 9.834 0m-.87 5.814a7.083 7.083 0 1 1 1.768-1.768l3.402 3.403-1.768 1.768z' fill='%23000'/%3E%3C/svg%3E")
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
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M38 21.781a2 2 0 0 0 2-2c0-3.358-.871-6.66-2.528-9.588a19.7 19.7 0 0 0-6.933-7.138 20 20 0 0 0-19.327-.778 19.76 19.76 0 0 0-7.494 6.555 19.44 19.44 0 0 0-1.576 19.112 19.67 19.67 0 0 0 6.324 7.674 2 2 0 0 0 2.345-3.24 15.66 15.66 0 0 1-5.038-6.112A15.44 15.44 0 0 1 7.027 11.08a15.76 15.76 0 0 1 5.978-5.227 16 16 0 0 1 15.459.622 15.7 15.7 0 0 1 5.526 5.688A15.46 15.46 0 0 1 36 19.781a2 2 0 0 0 2 2' fill='url(%23a)'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M38 21.781a2 2 0 0 0 2-2c0-3.358-.871-6.66-2.528-9.588a19.7 19.7 0 0 0-6.933-7.138 20 20 0 0 0-19.327-.778 19.76 19.76 0 0 0-7.494 6.555 19.44 19.44 0 0 0-1.576 19.112 19.67 19.67 0 0 0 6.324 7.674 2 2 0 0 0 2.345-3.24 15.66 15.66 0 0 1-5.038-6.112A15.44 15.44 0 0 1 7.027 11.08a15.76 15.76 0 0 1 5.978-5.227 16 16 0 0 1 15.459.622 15.7 15.7 0 0 1 5.526 5.688A15.46 15.46 0 0 1 36 19.781a2 2 0 0 0 2 2' fill='url(%23b)'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='17.518' y1='3.234' x2='31.784' y2='3.844' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23F50' stop-opacity='0'/%3E%3Cstop offset='.274' stop-color='%23F50' stop-opacity='.12'/%3E%3Cstop offset='1' stop-color='%23F50'/%3E%3C/linearGradient%3E%3ClinearGradient id='b' x1='21.172' y1='29.077' x2='10.258' y2='5.104' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23F50' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23F50'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")
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
      right: $icon-size-sm;
      width: $icon-size-sm;
      height: 100%;
      background: $font-color-light;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 48 48'%3E%3Cpath d='M40.96 4.98a2 2 0 0 0-.22.02H28a2 2 0 1 0 0 4h8.172L22.586 22.586a2 2 0 1 0 2.828 2.828L39 11.828V20a2 2 0 1 0 4 0V7.246a2 2 0 0 0-2.04-2.266M12.5 8C8.383 8 5 11.383 5 15.5v20c0 4.117 3.383 7.5 7.5 7.5h20c4.117 0 7.5-3.383 7.5-7.5V26a2 2 0 1 0-4 0v9.5c0 1.947-1.553 3.5-3.5 3.5h-20A3.483 3.483 0 0 1 9 35.5v-20c0-1.947 1.553-3.5 3.5-3.5H22a2 2 0 1 0 0-4z'/%3E%3C/svg%3E")
        center / contain no-repeat;
    }
  }
</style>
