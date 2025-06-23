<script lang="ts">
  import { bookmarksState } from '../states/bookmarks.svelte';
  import type { BookmarkFolder } from '../types/bookmark-folder';
  import { isButtonEsc } from '../utils/buttons';

  interface Props {
    bookmarkTitle: string;
    bookmarkUrl: string;
  }

  let { bookmarkTitle, bookmarkUrl }: Props = $props();

  // localization
  const i18n_addBookmarkButtonTitle = chrome.i18n.getMessage(
    'addBookmarkButtonTitle',
  );
  const i18n_bookmarkedButtonTitle = chrome.i18n.getMessage(
    'bookmarkedButtonTitle',
  );

  let bookmarkElement: HTMLElement | null = $state(null);
  let bookmarkButton: HTMLElement | null = $state(null);
  let isPopupOpened = $state(false);
  let popupStyle = $state('');
  let showBookmarkedAnimation = $state(false);

  let popupHideTimeout: ReturnType<typeof setTimeout>;

  function handleBookmarkKeydown(event: KeyboardEvent) {
    if (isButtonEsc(event) && isPopupOpened) {
      event.preventDefault();
      event.stopPropagation();
      hidePopup();
      bookmarkButton?.focus();
    }
  }

  function handleBookmarkButtonClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (!event.target) {
      return;
    }

    if (isPopupOpened) {
      hidePopup();
      return;
    }

    const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
    const buttonCenterX = buttonRect.top + buttonRect.height / 2;

    // popup position
    if (buttonCenterX + 200 > document.body.clientHeight) {
      popupStyle =
        buttonCenterX < 200 ? `bottom:${buttonCenterX - 190}px;` : 'bottom:0;';
    } else {
      popupStyle = 'top:0;';
    }

    isPopupOpened = true;
  }

  function handleBookmarkButtonMouseLeave() {
    popupHideTimeout = setTimeout(hidePopup, 500);
  }

  function handlePopupMouseEnter() {
    clearTimeout(popupHideTimeout);
  }

  function handlePopupMouseLeave() {
    hidePopup();
  }

  function handleFocusout(event: FocusEvent) {
    if (!bookmarkElement || !event.relatedTarget) {
      return;
    }

    // hide popup when element outside bookmark receives focus
    if (!bookmarkElement.contains(event.relatedTarget as HTMLElement)) {
      hidePopup();
    }
  }

  function handleBookmarkFolderClick(
    event: MouseEvent,
    folder: BookmarkFolder,
  ) {
    event.stopPropagation();
    event.preventDefault();

    chrome.bookmarks.create({
      parentId: folder.id,
      title: bookmarkTitle,
      url: bookmarkUrl,
    });

    bookmarksState.urls.push(bookmarkUrl);
    showBookmarkedAnimation = true;

    hidePopup();
  }

  function hidePopup() {
    isPopupOpened = false;
  }
</script>

{#if bookmarksState.folders.length}
  <div
    bind:this={bookmarkElement}
    class="bookmark"
    role="button"
    tabindex="-1"
    onfocusout={handleFocusout}
    onkeydown={handleBookmarkKeydown}>
    <button
      bind:this={bookmarkButton}
      disabled={bookmarksState.urls.includes(bookmarkUrl)}
      class="bookmark__button"
      title={bookmarksState.urls.includes(bookmarkUrl)
        ? i18n_bookmarkedButtonTitle
        : i18n_addBookmarkButtonTitle}
      aria-label={bookmarksState.urls.includes(bookmarkUrl)
        ? i18n_bookmarkedButtonTitle
        : i18n_addBookmarkButtonTitle}
      onclick={handleBookmarkButtonClick}
      onmouseleave={handleBookmarkButtonMouseLeave}></button>
    {#if showBookmarkedAnimation}
      <span class="bookmark__button__animation"></span>
    {/if}
    {#if isPopupOpened}
      <div
        class="bookmark__popup"
        style={popupStyle}
        role="dialog"
        tabindex="-1"
        onmouseenter={handlePopupMouseEnter}
        onmouseleave={handlePopupMouseLeave}>
        {#each bookmarksState.folders as folder}
          <button
            class="bookmark__popup__folder"
            title={folder.title}
            data-navigation-item
            onclick={(e) => handleBookmarkFolderClick(e, folder)}>
            <span>
              <span class="bookmark__popup__folder__icon"></span>
              {folder.title}
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  @use '../styles/colors.scss' as *;

  .bookmark {
    position: relative;
  }

  .bookmark__button {
    width: 20px;
    height: 100%;
    border: none;
    background: $light-font-color;
    mask: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m265 0h-200c-8.284 0-15 6.716-15 15v300c0 5.766 3.305 11.022 8.502 13.52s11.365 1.796 15.868-1.807l90.63-72.503 90.63 72.503c2.712 2.17 6.027 3.287 9.372 3.287 2.208 0 4.43-0.487 6.496-1.48 5.197-2.497 8.502-7.753 8.502-13.52v-300c0-8.284-6.716-15-15-15zm-15 283.79-75.63-60.503c-2.739-2.191-6.055-3.287-9.37-3.287s-6.631 1.096-9.37 3.287l-75.63 60.503v-253.79h170v253.79z'/%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
    transition: background 0.1s ease-out;
    cursor: pointer;

    &:hover,
    &:focus {
      background: $accent-color;
    }

    &:disabled {
      background: $accent-color;
      mask: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m265 0h-200c-8.284 0-15 6.716-15 15v300c0 5.766 3.305 11.022 8.502 13.52s11.365 1.796 15.868-1.807l90.63-72.503 90.63 72.503c2.712 2.17 6.027 3.287 9.372 3.287 2.208 0 4.43-0.487 6.496-1.48 5.197-2.497 8.502-7.753 8.502-13.52v-300c0-8.284-6.716-15-15-15z' fill='%23f60'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='332' height='332' fill='none'/%3E%3C/g%3E%3C/svg%3E%0A")
        center no-repeat;
      cursor: default;
    }
  }

  .bookmark__button__animation {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 1;
    background: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m265 0h-200c-8.284 0-15 6.716-15 15v300c0 5.766 3.305 11.022 8.502 13.52s11.365 1.796 15.868-1.807l90.63-72.503 90.63 72.503c2.712 2.17 6.027 3.287 9.372 3.287 2.208 0 4.43-0.487 6.496-1.48 5.197-2.497 8.502-7.753 8.502-13.52v-300c0-8.284-6.716-15-15-15z' fill='%23f60'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='332' height='332' fill='none'/%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
    animation: scale 0.7s cubic-bezier(0.26, 0.86, 0.63, 1);
    pointer-events: none;
  }

  @keyframes scale {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .bookmark__popup {
    position: absolute;
    right: 30px;
    max-width: 200px;
    max-height: 200px;
    background-color: $base-background-color;
    border-radius: 7px;
    box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.2);
    overflow-y: scroll;
    z-index: 1;
  }

  .bookmark__popup__folder {
    display: flex;
    width: 100%;
    background: $base-background-color;
    border: none;
    outline: none;
    text-align: start;
    transition: background 0.1s ease-out;
    cursor: pointer;

    &:hover,
    &:focus-within {
      background: $light-background-color;
    }

    & > span {
      padding: 5px 10px;
      font-size: 15px;
      color: $dark-font-color;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .bookmark__popup__folder__icon {
    display: inline-block;
    vertical-align: text-bottom;
    margin-right: 5px;
    width: 20px;
    height: 1em;
    background: $light-font-color;
    mask: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 445.96 445.96' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m336.06 173.98h-141.67l-10.324-70.317c-2.397-16.325-17.858-29.682-34.358-29.682h-123.75c-16.5 0-28.039 13.357-25.642 29.682l39.392 268.32h367.5l-35.047-168.63c-3.358-16.155-19.605-29.372-36.105-29.372z'/%3E%3Cpath d='m420.35 103.98h-205.92l5.872 39.999h115.75c14.855 0 29.74 5.454 41.913 15.357s20.541 23.367 23.564 37.911l19.05 91.658 25.002-155.31c2.623-16.29-8.731-29.619-25.231-29.619z'/%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
  }
</style>
