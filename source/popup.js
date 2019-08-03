var searchRequestTimeout;

document.addEventListener('DOMContentLoaded', function () {
    localizePageUI();

    var searchButton = document.getElementById("btnSearch");
    var searchInput = document.getElementById("inputSearch");

    // Search icon click
    searchButton.addEventListener("click", function () {
        if (searchInput.value) {
            openInNewTab(getKpSearchUrl(searchInput.value))
        } else {
            searchInput.focus();
        }
    });
    // Enter button click
    searchInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            searchButton.click();
        }
    });
    // on text typing
    searchInput.addEventListener("input", function () {
        if (searchInput.value.length > 1) {
            if (searchRequestTimeout) {
                clearTimeout(searchRequestTimeout);
            }

            searchRequestTimeout = setTimeout(function () {
                requestSuggestions(searchInput.value)
            }, 200);
        } else {
            resetSuggestionsUI();
        }
    });

    searchInput.focus();
});

/**
 * Requests suggestions from kinopoisk and build UI for them
 *
 * @param {string} searchText search request text
 */
function requestSuggestions(searchText) {
    xhr = new XMLHttpRequest();
    xhr.open('GET', getKpSearchSuggestionsUrl(searchText));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status == 200) {
            createSuggestionsUI(searchText, JSON.parse(xhr.responseText));
        }
    };
    xhr.send();
}

/**
 * Resets UI for suggestion
 */
function resetSuggestionsUI() {
    document.getElementById("divFirstSuggestion").innerHTML = "";
    document.getElementById("divFilmSuggestions").innerHTML = "";
    document.getElementById("divPeopleSuggestions").innerHTML = "";
    setVisibility(document.getElementById("divSuggestions"), false);
}

/**
 * Creates UI for suggestions
 *
 * @param {string} searchText search request text
 * @param {array} suggestions array of suggestion items
 */
function createSuggestionsUI(searchText, suggestions) {
    resetSuggestionsUI();

    if (suggestions.length == 0) {
        return;
    }

    var indexFirstSuggestion = suggestions.findIndex(obj => obj.type == "first");
    var indexFilmSuggestion = suggestions.findIndex(obj => obj.type == "film");
    var indexPeopleSuggestion = suggestions.findIndex(obj => obj.type == "people");

    // first suggestion
    var divFirstElement = document.getElementById("divFirstSuggestion");
    if (indexFirstSuggestion != -1) {
        setVisibility(divFirstElement.parentElement, true);

        var first = suggestions[indexFirstSuggestion];
        appendSuggestionItem(divFirstElement, first);
    } else {
        setVisibility(divFirstElement.parentElement, false);
    }

    // film suggestions
    var divFilmsElement = document.getElementById("divFilmSuggestions");
    if (indexFilmSuggestion != -1) {
        setVisibility(divFilmsElement.parentElement, true);

        if (indexPeopleSuggestion != -1) {
            var films = suggestions.slice(indexFilmSuggestion, indexPeopleSuggestion);
            films.forEach(function (film) {
                appendSuggestionItem(divFilmsElement, film);
            });
        } else {
            var films = suggestions.slice(indexFilmSuggestion);
            films.forEach(function (film) {
                appendSuggestionItem(divFilmsElement, film);
            });
        }
    } else {
        setVisibility(divFilmsElement.parentElement, false);
    }

    // people suggestions
    var divPeopleElement = document.getElementById("divPeopleSuggestions");
    if (indexPeopleSuggestion != -1) {
        setVisibility(divPeopleElement.parentElement, true);

        var people = suggestions.slice(indexPeopleSuggestion);
        people.forEach(function (person) {
            appendSuggestionItem(divPeopleElement, person);
        });
    } else {
        setVisibility(divPeopleElement.parentElement, false);
    }

    document.getElementById("aSuggestionsAllResults").href = getKpSearchUrl(searchText);
    setVisibility(document.getElementById("divSuggestions"), true);
}

/**
 * Creates and appends suggestion to html element
 *
 * @param {Element} element html element
 * @param {any} item suggestion item
 */
function appendSuggestionItem(element, item) {
    var a = document.createElement("a");
    a.href = getKpItemUrl(item.link);
    a.target = "_blank";
    a.className = "aSuggestionItem";

    var spanContent = document.createElement("span");
    spanContent.className = "spanSuggestionContent";

    var spanNames = document.createElement("span");
    spanNames.className = "spanSuggestionNames";

    if (item.rus) {
        var spanName = document.createElement("span");
        spanName.className = "spanSuggestionName";
        spanName.innerHTML = item.rus;
        spanNames.appendChild(spanName);
    }

    if (item.name) {
        var spanSubname = document.createElement("span");
        if (item.is_serial || item.year) {
            spanSubname.className = "spanAddCommaSign";
        }
        spanSubname.innerHTML = item.name;
        spanNames.appendChild(spanSubname);
    }

    if (item.is_serial) {
        var spanSerial = document.createElement("span");
        if (item.year) {
            spanSerial.className = "spanAddCommaSign";
        }
        spanSerial.innerHTML = chrome.i18n.getMessage("spanIsSerial");
        spanNames.appendChild(spanSerial);
    }

    spanContent.appendChild(spanNames);

    if (item.year) {
        var spanYear = document.createElement("span");
        spanYear.innerHTML = item.year;
        spanContent.appendChild(spanYear);
    }

    a.appendChild(spanContent);

    if (item.ur_rating != undefined) {
        var spanRating = document.createElement("span");
        spanRating.className = "spanSuggestionItemRating";

        if (item.ur_rating != 0) {
            spanRating.innerHTML = item.ur_rating;
            if (item.ur_rating < 5) {
                spanRating.classList.add("negativRating");
            } else if (item.ur_rating >= 7) {
                spanRating.classList.add("positivRating");
            }
        } else {
            spanRating.innerHTML = "&mdash;";
        }

        a.appendChild(spanRating);
    }

    element.appendChild(a);
}

/**
 * Localizes page using chrome.i18n.getMessage()
 */
function localizePageUI() {
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++) {
        var obj = objects[j];

        var oldHtml = obj.innerHTML.toString();
        var newHtml = oldHtml.replace(/__MSG_(\w+)__/g, function (match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if (newHtml != oldHtml) {
            obj.innerHTML = newHtml;
        }
    }
}

/**
 * Sets element's visibility
 *
 * @param {Element} element id of an html element
 * @param {boolean} visiblity visibility
 */
function setVisibility(element, visiblity) {
    if (visiblity) {
        element.removeAttribute("hidden");
    } else {
        element.setAttribute("hidden", true);
    }
}

/**
 * Creates kinopoisk item url
 *
 * @param {string} itemUrl url on a kinopoisk item
 */
function getKpItemUrl(itemUrl) {
    return "https://www.kinopoisk.ru" + itemUrl;
}

/**
 * Creates kinopoisk search request url
 *
 * @param {string} searchText search request text
 */
function getKpSearchUrl(searchText) {
    return "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(searchText);
}

/**
 * Creates kinopoisk suggestions request url
 *
 * @param {string} searchText search request text
 */
function getKpSearchSuggestionsUrl(searchText) {
    return "https://www.kinopoisk.ru/handler_search.php?topsuggest=true&q=" + encodeURIComponent(searchText);
}

/**
 * Opens page in new tab
 *
 * @param {string} url url of a page
 */
function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}
