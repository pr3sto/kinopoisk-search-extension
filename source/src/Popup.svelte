<script context="module">
  function getKpSearchUrl(searchText) {
    return (
      "https://www.kinopoisk.ru/index.php?kp_query=" +
      encodeURIComponent(searchText)
    );
  }

  function getKpSuggestionsRequestUrl(searchText) {
    return (
      "https://www.kinopoisk.ru/api/suggest/v2/?query=" +
      encodeURIComponent(searchText)
    );
  }

  function isButtonEnter(event) {
    return (
      event.key === "Enter" || event.code === "Enter" || event.keyCode === 13
    );
  }

  function isButtonDown(event) {
    return (
      event.key === "ArrowDown" ||
      event.code === "ArrowDown" ||
      event.keyCode === 40
    );
  }

  function isButtonUp(event) {
    return (
      event.key === "ArrowUp" ||
      event.code === "ArrowUp" ||
      event.keyCode === 38
    );
  }

  function get(obj, key) {
    return key.split(".").reduce(function (o, x) {
      return typeof o == "undefined" || o === null ? o : o[x];
    }, obj);
  }

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
</script>

<script>
  import { onMount } from "svelte";
  import SuggestionItem from "./SuggestionItem.svelte";

  // localization
  let firstSuggestionHeader = chrome.i18n.getMessage("firstSuggestionHeader");
  let searchPlaceholder = chrome.i18n.getMessage("searchPlaceholder");
  let filmSuggestionHeader = chrome.i18n.getMessage("filmSuggestionHeader");
  let peopleSuggestionHeader = chrome.i18n.getMessage("peopleSuggestionHeader");
  let allResultsSuggestionHeader = chrome.i18n.getMessage(
    "allResultsSuggestionHeader"
  );

  // suggestion items
  let firstItem = null;
  let filmItems = [];
  let personItems = [];
  let allResultsUrl = "";

  let searchRequestTimeout;
  let searchInput;
  let arrowNavigationItemsIds = [];

  function handleKeydown(event) {
    // arrow navigation
    if (isButtonUp(event) || isButtonDown(event)) {
      if (arrowNavigationItemsIds.length > 1) {
        let position = arrowNavigationItemsIds.indexOf(event.target.id);

        if (isButtonUp(event) && position > 0) {
          let id = arrowNavigationItemsIds[position - 1];
          document.getElementById(id).focus();
        }
        if (
          isButtonDown(event) &&
          position != -1 &&
          position < arrowNavigationItemsIds.length
        ) {
          let id = arrowNavigationItemsIds[position + 1];
          document.getElementById(id).focus();
        }
      }
    }
    event.preventDefault;
  }

  function openKinopoisk() {
    if (searchInput.value) {
      chrome.tabs.create({ url: getKpSearchUrl(searchInput.value) });
    } else {
      searchInput.focus();
    }
  }

  function inputKeyup(event) {
    if (isButtonEnter(event)) {
      event.preventDefault();
      openKinopoisk();
    }
  }

  function updateSuggestions() {
    firstItem = null;
    filmItems = [];
    personItems = [];

    if (searchInput.value.length > 1) {
      if (searchRequestTimeout) {
        clearTimeout(searchRequestTimeout);
      }
      searchRequestTimeout = setTimeout(
        requestSuggestions(searchInput.value),
        200
      );
    } else {
      clearTimeout(searchRequestTimeout);
    }
  }

  function requestSuggestions(searchText) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", getKpSuggestionsRequestUrl(searchText));
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");
    xhr.onload = function () {
      if (xhr.status == 200) {
        createSuggestions(searchText, JSON.parse(xhr.responseText));
      }
    };
    xhr.send();
  }

  function createSuggestions(searchText, jsonResponse) {
    // incorrect json format or empty
    if (!jsonResponse || !jsonResponse.suggest || !jsonResponse.suggest.top) {
      return;
    }

    // incorrect json format or empty
    let jsonSuggestions = jsonResponse.suggest.top;
    if (
      !jsonSuggestions.topResult &&
      (!jsonSuggestions.movies || jsonSuggestions.movies.length == 0) &&
      (!jsonSuggestions.persons || jsonSuggestions.persons.length == 0)
    ) {
      return;
    }

    arrowNavigationItemsIds = ["inputs__searchbar"];

    firstItem = null;
    filmItems = [];
    personItems = [];

    // first suggestion
    if (jsonSuggestions.topResult) {
      let first = get(jsonSuggestions, "topResult.global");
      if (first) {
        if (first.__typename == "TvSeries" || first.__typename == "Film") {
          firstItem = createFilmItem(first);
        } else if (first.__typename == "Person") {
          firstItem = createPersonItem(first);
        }
      }
      if (firstItem) {
        arrowNavigationItemsIds.push(firstItem.id);
      }
    }

    // film suggestions
    if (jsonSuggestions.movies && jsonSuggestions.movies.length > 0) {
      jsonSuggestions.movies.forEach(function (film) {
        let filmItem = createFilmItem(film.movie);
        arrowNavigationItemsIds.push(filmItem.id);
        filmItems = [...filmItems, filmItem];
      });
    }

    // people suggestions
    if (jsonSuggestions.persons && jsonSuggestions.persons.length > 0) {
      jsonSuggestions.persons.forEach(function (person) {
        let personItem = createPersonItem(person.person);
        arrowNavigationItemsIds.push(personItem.id);
        personItems = [...personItems, personItem];
      });
    }

    arrowNavigationItemsIds.push("link-all-results");

    allResultsUrl = getKpSearchUrl(searchText);
  }

  function createFilmItem(json) {
    let url = get(json, "id");
    if (url) {
      url = "https://www.kinopoisk.ru/film/" + url;
    }
    let imgUrl = get(json, "poster.avatarsUrl");
    if (imgUrl) {
      imgUrl = "https:" + imgUrl + "/40x60";
    }
    let rating = get(json, "rating.kinopoisk.value");
    if (rating) {
      rating = rating.toFixed(1);
    }

    let subname = get(json, "title.original");
    if (!subname) {
      subname = "";
    }
    let isSerial = get(json, "__typename") == "TvSeries";
    if (isSerial) {
      if (subname.length > 0) {
        subname += ", ";
      }
      subname += chrome.i18n.getMessage("spanIsSerial");
    }
    let year = get(json, "productionYear");
    if (!year) {
      year = get(json, "releaseYears");
      if (year && Array.isArray(year) && year.length == 1) {
        year =
          (year[0].start ? year[0].start : "...") +
          " - " +
          (year[0].end ? year[0].end : "...");
      }
    }
    if (year) {
      if (subname.length > 0) {
        subname += ", ";
      }
      subname += year;
    }

    let name = get(json, "title.russian");

    let avaliableOnline = get(json, "onlineViewOptions.isAvailableOnline");

    return {
      id: uuid(),
      url: url ? url : null,
      imgUrl: imgUrl ? imgUrl : null,
      name: name ? name : subname,
      subname: subname ? subname : null,
      avaliableOnline: avaliableOnline ? avaliableOnline : null,
      rating: rating ? rating : null,
      showRating: true,
    };
  }

  function createPersonItem(json) {
    let url = get(json, "id");
    if (url) {
      url = "https://www.kinopoisk.ru/name/" + url;
    }
    let imgUrl = get(json, "poster.avatarsUrl");
    if (imgUrl) {
      imgUrl = "https:" + imgUrl + "/40x60";
    }

    let subname = get(json, "originalName");
    if (!subname) {
      subname = "";
    }
    let year = get(json, "birthDate");
    if (year) {
      year = new Date(year).getFullYear();
      if (subname.length > 0) {
        subname += ", ";
      }
      subname += year;
    }

    let name = get(json, "name");

    return {
      id: uuid(),
      url: url ? url : null,
      imgUrl: imgUrl ? imgUrl : null,
      name: name ? name : subname,
      subname: subname ? subname : null,
      rating: null,
      showRating: false,
    };
  }

  onMount(() => {
    searchInput.focus();
  });
</script>

<style>
  :global(body) {
    width: 440px;
    margin: 7px;
    background: #444;
  }

  #logo {
    padding: 7px 0px 10px;
  }

  #logo > a > img {
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='15' viewBox='0 0 120 15'%3E %3Cpath fill='%23FFF' fill-rule='evenodd' d='M5.762 9.016H4.704v5.748H0V0h4.704v5.374H5.86L8.447 0h4.782L9.897 6.91l3.841 7.854H8.564L5.762 9.016zm16.05.354h-.274l-2.978 2.618v2.776h-4.508V2.953h4.508v4.449h.391l2.862-2.52v-1.93h4.507v11.812h-4.507V9.37zm13.641 1.22h-3.057v4.174h-4.508V2.953h4.508v4.016h3.057V2.953h4.508v11.81h-4.508v-4.172zm11.955-7.854c.81 0 1.561.125 2.254.374.692.25 1.29.63 1.793 1.142.503.512.898 1.152 1.186 1.92.287.767.431 1.663.431 2.686 0 1.037-.144 1.94-.431 2.707-.288.768-.683 1.404-1.186 1.91a4.794 4.794 0 0 1-1.783 1.131 6.463 6.463 0 0 1-2.225.374h-.607a6.896 6.896 0 0 1-2.313-.374 4.843 4.843 0 0 1-1.822-1.132c-.51-.505-.908-1.141-1.196-1.909-.287-.768-.431-1.67-.431-2.707 0-1.023.144-1.919.431-2.687.288-.767.683-1.407 1.186-1.919a4.722 4.722 0 0 1 1.793-1.142 6.666 6.666 0 0 1 2.273-.374h.647zm-.255 8.465c.497 0 .899-.2 1.206-.6.307-.4.46-.982.46-1.743 0-.76-.153-1.342-.46-1.742-.307-.4-.71-.6-1.206-.6h-.156c-.523 0-.935.2-1.235.6-.3.4-.45.981-.45 1.742s.15 1.342.45 1.742c.3.4.712.6 1.235.6h.156zM53.993 0h12.543v14.764h-4.704V3.839h-3.135v10.925h-4.704V0zm19.794 2.736c.81 0 1.562.125 2.254.374.693.25 1.29.63 1.793 1.142.503.512.899 1.152 1.186 1.92.288.767.431 1.663.431 2.686 0 1.037-.143 1.94-.43 2.707-.288.768-.684 1.404-1.187 1.91a4.794 4.794 0 0 1-1.783 1.131 6.463 6.463 0 0 1-2.224.374h-.608a6.896 6.896 0 0 1-2.313-.374 4.843 4.843 0 0 1-1.822-1.132c-.51-.505-.908-1.141-1.196-1.909-.287-.768-.43-1.67-.43-2.707 0-1.023.143-1.919.43-2.687.288-.767.683-1.407 1.186-1.919a4.722 4.722 0 0 1 1.793-1.142 6.666 6.666 0 0 1 2.274-.374h.646zm-.254 8.465c.496 0 .898-.2 1.205-.6.307-.4.46-.982.46-1.743 0-.76-.153-1.342-.46-1.742-.307-.4-.709-.6-1.205-.6h-.157c-.523 0-.934.2-1.235.6-.3.4-.45.981-.45 1.742s.15 1.342.45 1.742c.3.4.712.6 1.235.6h.157zm14.796-1.83h-.274l-2.98 2.617v2.776h-4.507V2.953h4.508v4.449h.392l2.861-2.52v-1.93h4.508v11.812h-4.508V9.37zm17.697.098c-.039.97-.209 1.804-.51 2.5-.3.695-.698 1.27-1.195 1.722a4.609 4.609 0 0 1-1.744.994 7.205 7.205 0 0 1-2.175.315h-.608c-.836 0-1.61-.128-2.322-.384a4.963 4.963 0 0 1-1.842-1.151c-.516-.512-.918-1.152-1.206-1.92-.287-.767-.424-1.663-.411-2.687.013-1.023.163-1.919.45-2.687.288-.767.683-1.407 1.186-1.919A4.825 4.825 0 0 1 97.442 3.1a6.511 6.511 0 0 1 2.274-.383h.647c.77 0 1.492.108 2.165.324.673.217 1.261.548 1.764.994.503.447.908 1.001 1.215 1.664.307.663.48 1.434.52 2.313h-4.293c-.065-.499-.245-.873-.539-1.122-.293-.25-.656-.374-1.087-.374h-.177c-.51 0-.914.2-1.215.6-.3.4-.45.981-.45 1.742s.15 1.342.45 1.742c.3.4.706.6 1.215.6h.177c.457 0 .836-.147 1.136-.442.301-.295.47-.725.51-1.29h4.272zm6.41.846h-.824v4.449h-4.508V2.953h4.508v4.134h.843l2.273-4.134h4.684l-3.018 5.492L120 14.764h-5.017l-2.548-4.449z'/%3E %3C/svg%3E");
  }

  #inputs {
    position: relative;
    height: 40px;
  }

  #inputs__searchbar {
    box-sizing: border-box;
    padding: 0 40px 0 15px;
    height: 100%;
    width: 100%;
    border: 0px;
    border-radius: 3px;
    background: #f2f2f2;
    font-size: 15px;
  }

  #inputs__button {
    cursor: pointer;
    position: absolute;
    bottom: 0px;
    right: 0px;
    height: 100%;
    width: 40px;
    border: 0px;
    opacity: 0.3;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E %3Cpath fill='%23000' fill-rule='evenodd' d='M12.026 10.626L16 14.6 14.6 16l-3.974-3.974a5.5 5.5 0 1 1 1.4-1.4zM7.5 11.1a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2z'/%3E %3C/svg%3E")
      no-repeat scroll 50% 50% / 20px 20px;
    transition: opacity 0.1s ease-out;
  }

  #inputs__button:hover {
    opacity: 0.5;
  }

  #suggestions {
    margin-top: 5px;
    background: #fff;
    border-radius: 3px;
  }

  .suggestions__section {
    padding-bottom: 10px;
    box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.05);
  }

  .suggestions__section__header {
    padding: 10px 15px 5px;
    color: #aaa;
    font-size: 13px;
    line-height: 15px;
  }

  #link-all-results {
    display: block;
    position: relative;
    padding: 10px 15px;
    background-color: #f2f2f2;
    color: #777;
    font-size: 12px;
    text-decoration: none;
    border-radius: 0 0 3px 3px;
    transition: background-color 0.1s ease-out;
  }

  #link-all-results::after {
    position: absolute;
    right: 15px;
    content: "";
    width: 15px;
    height: 15px;
    opacity: 0.3;
    background: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg version='1.1' viewBox='0 0 7 12' xmlns='http://www.w3.org/2000/svg'%3E%3Ctitle%3ELine%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg transform='translate(-628 -2085)' fill='%23000' fill-rule='nonzero'%3E%3Cg transform='translate(215 1891)'%3E%3Cg transform='translate(0 184)'%3E%3Cg transform='translate(408 8)'%3E%3Cpolygon points='5 13.256 5.7433 14 11.743 8.0018 5.7435 2 5 2.7433 10.257 8.0016'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
  }

  #link-all-results:hover {
    background-color: #e6e6e6;
  }
</style>

<svelte:window on:keydown={handleKeydown} />

<div id="logo">
  <a href="https://www.kinopoisk.ru/" target="_blank">
    <img alt="https://www.kinopoisk.ru/" />
  </a>
</div>

<div id="inputs">
  <input
    bind:this={searchInput}
    type="text"
    autocomplete="off"
    placeholder={searchPlaceholder}
    id="inputs__searchbar"
    on:input={() => updateSuggestions()}
    on:keyup={(e) => inputKeyup(e)} />
  <input type="button" id="inputs__button" on:click={() => openKinopoisk()} />
</div>

<div id="suggestions">
  {#if firstItem}
    <div class="suggestions__section">
      <div class="suggestions__section__header">{firstSuggestionHeader}</div>
      <SuggestionItem item={firstItem} />
    </div>
  {/if}

  {#if filmItems && filmItems.length}
    <div class="suggestions__section">
      <div class="suggestions__section__header">{filmSuggestionHeader}</div>
      {#each filmItems as item}
        <SuggestionItem {item} />
      {/each}
    </div>
  {/if}

  {#if personItems && personItems.length}
    <div class="suggestions__section">
      <div class="suggestions__section__header">{peopleSuggestionHeader}</div>
      {#each personItems as item}
        <SuggestionItem {item} />
      {/each}
    </div>
  {/if}

  {#if firstItem || (filmItems && filmItems.length) || (personItems && personItems.length)}
    <a
      id="link-all-results"
      href={allResultsUrl}
      target="_blank">{allResultsSuggestionHeader}</a>
  {/if}
</div>
