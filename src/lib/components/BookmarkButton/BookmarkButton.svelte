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
    mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' d='M-1-1h802v602H-1z'/%3E%3Cpath d='M265 0H65c-8.284 0-15 6.716-15 15v300a15 15 0 0 0 24.37 11.713L165 254.21l90.63 72.503a15 15 0 0 0 9.372 3.287A15 15 0 0 0 280 315V15c0-8.284-6.716-15-15-15m-15 283.79-75.63-60.503c-2.739-2.191-6.055-3.287-9.37-3.287s-6.631 1.096-9.37 3.287L80 283.79V30h170z'/%3E%3C/svg%3E")
      center no-repeat;
    transition: background 0.1s ease-out;
    cursor: pointer;

    &:hover,
    &:focus {
      background: $accent-color;
    }

    &:disabled {
      background: $accent-color;
      mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' d='M-1-1h802v602H-1z'/%3E%3Cpath d='M265 0H65c-8.284 0-15 6.716-15 15v300a15 15 0 0 0 24.37 11.713L165 254.21l90.63 72.503a15 15 0 0 0 9.372 3.287A15 15 0 0 0 280 315V15c0-8.284-6.716-15-15-15' fill='%23f60'/%3E%3Cpath fill='none' d='M-1-1h332v332H-1z'/%3E%3C/svg%3E")
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
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' d='M-1-1h802v602H-1z'/%3E%3Cpath d='M265 0H65c-8.284 0-15 6.716-15 15v300a15 15 0 0 0 24.37 11.713L165 254.21l90.63 72.503a15 15 0 0 0 9.372 3.287A15 15 0 0 0 280 315V15c0-8.284-6.716-15-15-15' fill='%23f60'/%3E%3Cpath fill='none' d='M-1-1h332v332H-1z'/%3E%3C/svg%3E")
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
