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

// arrow keys navigation
document.addEventListener('keydown', function(e) {
    if (e.keyCode == '38' || e.keyCode == '40') {
        // get the next and prev navigation options for this element
        var srcElement = e.target;
        var next = srcElement.dataset.next;
        var prev = srcElement.dataset.prev;

        // up arrow was pressed and a prev element is defined
        if (e.keyCode == '38' && prev != undefined) {
            document.getElementById(prev).focus();
        }
        // down arrow was pressed and a next element is defined
        if (e.keyCode == '40' && next != undefined) {
            document.getElementById(next).focus();
        }

        e.preventDefault;
    }
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

    var arrowNavigationItemsIds = ['inputSearch'];

    var indexFirstSuggestion = suggestions.findIndex(obj => obj.type == "first");
    var indexFilmSuggestion = suggestions.findIndex(obj => obj.type == "film");
    var indexPeopleSuggestion = suggestions.findIndex(obj => obj.type == "people");
    var indexCinemaSuggestion = suggestions.findIndex(obj => obj.type == "cinema");

    // first suggestion
    var divFirstElement = document.getElementById("divFirstSuggestion");
    if (indexFirstSuggestion != -1) {
        setVisibility(divFirstElement.parentElement, true);

        var first = suggestions[indexFirstSuggestion];
        var id = appendSuggestionItem(divFirstElement, first);
        arrowNavigationItemsIds.push(id);
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
                var id = appendSuggestionItem(divFilmsElement, film);
                arrowNavigationItemsIds.push(id);
            });
        } else {
            var films = suggestions.slice(indexFilmSuggestion);
            films.forEach(function (film) {
                var id = appendSuggestionItem(divFilmsElement, film);
                arrowNavigationItemsIds.push(id);
            });
        }
    } else {
        setVisibility(divFilmsElement.parentElement, false);
    }

    // people suggestions
    var divPeopleElement = document.getElementById("divPeopleSuggestions");
    if (indexPeopleSuggestion != -1) {
        setVisibility(divPeopleElement.parentElement, true);

        if (indexCinemaSuggestion != -1) {
            var people = suggestions.slice(indexPeopleSuggestion, indexCinemaSuggestion);
            people.forEach(function (person) {
                var id = appendSuggestionItem(divPeopleElement, person);
                arrowNavigationItemsIds.push(id);
            });
        } else {
            var people = suggestions.slice(indexPeopleSuggestion);
            people.forEach(function (person) {
                var id = appendSuggestionItem(divPeopleElement, person);
                arrowNavigationItemsIds.push(id);
            });
        }
    } else {
        setVisibility(divPeopleElement.parentElement, false);
    }

    // setup navigation attributes
    arrowNavigationItemsIds.push('aSuggestionsAllResults');
    for (i = 0; i < arrowNavigationItemsIds.length; i++) {
        var element = document.getElementById(arrowNavigationItemsIds[i]);
        if (i != 0) {
            element.setAttribute('data-prev', arrowNavigationItemsIds[i-1]);
        }
        if (i + 1 < arrowNavigationItemsIds.length) {
            element.setAttribute('data-next', arrowNavigationItemsIds[i+1])
        }
    }

    document.getElementById("aSuggestionsAllResults").href = getKpSearchUrl(searchText);
    setVisibility(document.getElementById("divSuggestions"), true);
}

/**
 * Creates and appends suggestion to html element
 *
 * @param {Element} element html element
 * @param {any} item suggestion item
 * @param {string} id unique id of an item
 *
 * @returns {string} id of an element
 */
function appendSuggestionItem(element, item) {
    var a = document.createElement("a");
    a.href = getKpItemUrl(item.link);
    a.target = "_blank";
    a.className = "aSuggestionItem";
    a.id = uuid();

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

    return a.id;
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
 *
 * @returns {string}
 */
function getKpItemUrl(itemUrl) {
    return "https://www.kinopoisk.ru" + itemUrl;
}

/**
 * Creates kinopoisk search request url
 *
 * @param {string} searchText search request text
 *
 * @returns {string}
 */
function getKpSearchUrl(searchText) {
    return "https://www.kinopoisk.ru/index.php?kp_query=" + encodeURIComponent(searchText);
}

/**
 * Creates kinopoisk suggestions request url
 *
 * @param {string} searchText search request text
 *
 * @returns {string}
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

/**
 * Generates unique id
 *
 * @returns {string}
 */
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
