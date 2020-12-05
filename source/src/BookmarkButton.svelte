<script>
  import { bookmarkFolders } from "./bookmarks.js";

  export let bookmarkTitle;
  export let bookmarkUrl;

  // timeout for hiding popup
  let popupHideTimeout;

  let isPopupVisible = false;
  let popupStyle = "";
  let buttonTitle = chrome.i18n.getMessage("bookmarkButton");
  let bookmarkSaved = false;

  function showPopup(event) {
    event.stopPropagation();
    event.preventDefault();

    let buttonCenterX = event.target.getBoundingClientRect().top + 18;

    // dropdown direction (up or down in a relation to a button)
    if (buttonCenterX + 150 > document.body.clientHeight) {
      if (buttonCenterX < 150) {
        let pos = 150 - buttonCenterX - 10;
        popupStyle = "bottom:" + pos + "px;";
      } else {
        popupStyle = "bottom:10px;";
      }
    } else {
      popupStyle = "top:10px;";
    }

    isPopupVisible = !isPopupVisible;
  }

  function saveBookmark(event, folder) {
    event.preventDefault();
    event.stopPropagation();

    chrome.bookmarks.create({
      parentId: folder.id,
      title: bookmarkTitle,
      url: bookmarkUrl,
    });

    isPopupVisible = false;

    bookmarkSaved = true;
    setTimeout(function () {
      bookmarkSaved = false;
    }, 700);
  }

  function setPopupHideTimeout() {
    popupHideTimeout = setTimeout(hidePopup, 500);
  }

  function clearPopupHideTimeout() {
    clearTimeout(popupHideTimeout);
  }

  function hidePopup() {
    isPopupVisible = false;
  }
</script>

<style>
  .bookmark {
    position: relative;
  }

  .bookmark__saved {
    position: absolute;
    background: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m265 0h-200c-8.284 0-15 6.716-15 15v300c0 5.766 3.305 11.022 8.502 13.52s11.365 1.796 15.868-1.807l90.63-72.503 90.63 72.503c2.712 2.17 6.027 3.287 9.372 3.287 2.208 0 4.43-0.487 6.496-1.48 5.197-2.497 8.502-7.753 8.502-13.52v-300c0-8.284-6.716-15-15-15z' fill='%23f60'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='332' height='332' fill='none'/%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
    opacity: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    animation: scale 0.7s cubic-bezier(0.26, 0.86, 0.63, 1);
    z-index: 101;
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

  .bookmark__button {
    background: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 330 330' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m265 0h-200c-8.284 0-15 6.716-15 15v300c0 5.766 3.305 11.022 8.502 13.52s11.365 1.796 15.868-1.807l90.63-72.503 90.63 72.503c2.712 2.17 6.027 3.287 9.372 3.287 2.208 0 4.43-0.487 6.496-1.48 5.197-2.497 8.502-7.753 8.502-13.52v-300c0-8.284-6.716-15-15-15zm-15 283.79-75.63-60.503c-2.739-2.191-6.055-3.287-9.37-3.287s-6.631 1.096-9.37 3.287l-75.63 60.503v-253.79h170v253.79z'/%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
    opacity: 0.3;
    width: 20px;
    height: 36px;
    transition: opacity 0.1s ease-out;
  }

  .bookmark__button:hover {
    opacity: 0.5;
  }

  .bookmark__popup {
    position: absolute;
    right: 30px;
    background-color: #fff;
    max-width: 200px;
    max-height: 150px;
    overflow-y: scroll;
    box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.2);
    z-index: 100;
  }

  .bookmark__popup > span {
    display: block;
    padding: 5px 15px;
    width: calc(100% - 30px);
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bookmark__popup > span:hover {
    background-color: #f2f2f2;
  }

  .bookmark__popup__icon {
    display: inline-block;
    background: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 445.96 445.96' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m336.06 173.98h-141.67l-10.324-70.317c-2.397-16.325-17.858-29.682-34.358-29.682h-123.75c-16.5 0-28.039 13.357-25.642 29.682l39.392 268.32h367.5l-35.047-168.63c-3.358-16.155-19.605-29.372-36.105-29.372z'/%3E%3Cpath d='m420.35 103.98h-205.92l5.872 39.999h115.75c14.855 0 29.74 5.454 41.913 15.357s20.541 23.367 23.564 37.911l19.05 91.658 25.002-155.31c2.623-16.29-8.731-29.619-25.231-29.619z'/%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
    opacity: 0.3;
    margin-right: 5px;
    width: 20px;
    height: 1em;
    vertical-align: text-bottom;
  }
</style>

{#if bookmarkFolders && bookmarkFolders.length > 0}
  <div class="bookmark">
    {#if bookmarkSaved}
      <div class="bookmark__saved" />
    {/if}
    <div
      class="bookmark__button"
      title={buttonTitle}
      on:click={(e) => showPopup(e)}
      on:mouseleave={setPopupHideTimeout} />
    {#if isPopupVisible}
      <div
        class="bookmark__popup"
        style={popupStyle}
        on:mouseenter={clearPopupHideTimeout}
        on:mouseleave={hidePopup}>
        {#each bookmarkFolders as folder}
          <span on:click={(e) => saveBookmark(e, folder)}>
            <span class="bookmark__popup__icon" />
            {folder.title}
          </span>
        {/each}
      </div>
    {/if}
  </div>
{/if}
