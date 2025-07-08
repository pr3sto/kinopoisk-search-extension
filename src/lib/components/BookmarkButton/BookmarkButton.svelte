<script lang="ts">
  import browser from 'webextension-polyfill';
  import bookmarks, { type BookmarkFolder } from './bookmarks.svelte';
  import FoldersTree from './FoldersTree.svelte';

  interface Props {
    bookmarkTitle: string;
    bookmarkUrl: string;
  }

  let { bookmarkTitle, bookmarkUrl }: Props = $props();

  // localization
  const i18n_addBookmarkButtonTitle = browser.i18n.getMessage(
    'addBookmarkButtonTitle',
  );
  const i18n_bookmarkedButtonTitle = browser.i18n.getMessage(
    'bookmarkedButtonTitle',
  );

  let bookmarkButton: HTMLElement | null = $state(null);
  let popoverElement: HTMLElement | null = $state(null);
  let isPopoverOpened = $state(false);
  let popoverStyle = $state('');
  let showBookmarkedAnimation = $state(false);

  let popoverHideTimeout: ReturnType<typeof setTimeout>;

  function handleBookmarkButtonClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (!event.target) {
      return;
    }

    if (isPopoverOpened) {
      hidePopover();
      return;
    }

    const buttonRect = (event.target as HTMLElement).getBoundingClientRect();

    // popover position
    if (buttonRect.top + 200 > document.body.clientHeight) {
      popoverStyle =
        buttonRect.top < 200
          ? `bottom:${buttonRect.top - 190}px;`
          : 'bottom:0;';
    } else {
      popoverStyle = 'top:0;';
    }

    isPopoverOpened = true;
  }

  function handleBookmarkButtonMouseEnter() {
    clearTimeout(popoverHideTimeout);
  }

  function handleBookmarkButtonMouseLeave() {
    popoverHideTimeout = setTimeout(hidePopover, 300);
  }

  function handlePopoverMouseEnter() {
    clearTimeout(popoverHideTimeout);
  }

  function handlePopoverMouseLeave() {
    popoverHideTimeout = setTimeout(hidePopover, 100);
  }

  function handleFocusout(event: FocusEvent) {
    if (!popoverElement || !event.relatedTarget) {
      return;
    }

    // hide popover when element outside receives focus
    if (!popoverElement.contains(event.relatedTarget as HTMLElement)) {
      hidePopover();
    }
  }

  function createBookmark(folder: BookmarkFolder) {
    browser.bookmarks
      .create({
        parentId: folder.id,
        title: bookmarkTitle,
        url: bookmarkUrl,
      })
      .then((node) => {
        if (node.url) {
          bookmarks.urls.push(node.url);
          showBookmarkedAnimation = true;
        }
      });

    hidePopover();
  }

  function hidePopover() {
    isPopoverOpened = false;
  }
</script>

{#if bookmarks.rootFolder !== null}
  <div class="bookmark">
    <button
      bind:this={bookmarkButton}
      disabled={bookmarks.urls.includes(bookmarkUrl)}
      class="bookmark__button"
      title={bookmarks.urls.includes(bookmarkUrl)
        ? i18n_bookmarkedButtonTitle
        : i18n_addBookmarkButtonTitle}
      aria-label={bookmarks.urls.includes(bookmarkUrl)
        ? i18n_bookmarkedButtonTitle
        : i18n_addBookmarkButtonTitle}
      onclick={handleBookmarkButtonClick}
      onmouseenter={handleBookmarkButtonMouseEnter}
      onmouseleave={handleBookmarkButtonMouseLeave}
      onfocusout={handleFocusout}></button>
    {#if showBookmarkedAnimation}
      <span class="bookmark__button__animation"></span>
    {/if}
    {#if isPopoverOpened}
      <div
        bind:this={popoverElement}
        class="bookmark__popover"
        style={popoverStyle}
        role="dialog"
        tabindex="-1"
        onmouseenter={handlePopoverMouseEnter}
        onmouseleave={handlePopoverMouseLeave}
        onfocusout={handleFocusout}>
        <FoldersTree
          isRoot={true}
          folders={bookmarks.rootFolder.children}
          onFolderClick={createBookmark} />
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  @use '../../styles/colors.scss' as *;
  @use '../../styles/dimensions.scss' as *;

  $bookmark-popover-width: 200px;
  $bookmark-popover-height: 200px;

  .bookmark {
    position: relative;
  }

  .bookmark__button {
    width: $icon-width-regular;
    height: 100%;
    border: none;
    background: $font-color-light;
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

  .bookmark__popover {
    position: absolute;
    right: 150%;
    max-width: $bookmark-popover-width;
    max-height: $bookmark-popover-height;
    background-color: $background-color-base;
    border-radius: $border-radius;
    box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.2);
    overflow-y: scroll;
    z-index: 1;
    animation: opacity 0.1s ease-out;
  }

  @keyframes opacity {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
