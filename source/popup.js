var searchRequestTimeout;

var divBookmarkDroppdownContent = document.createElement("div");
divBookmarkDroppdownContent.className = "divSuggestionItemBookmarkDropdown";
divBookmarkDroppdownContent.id = "divSuggestionItemBookmarkDropdown";

document.addEventListener("DOMContentLoaded", function () {
    localizePageUI();

    // innitialize dropdown with bookmark folders
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        var bookmarkFolders = listFolders(bookmarkTreeNodes[0]);
        bookmarkFolders.forEach(folder => {
            var div = document.createElement("div");
            div.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                console.log(divBookmarkDroppdownContent.dataset.title);
                console.log(divBookmarkDroppdownContent.dataset.url);

                chrome.bookmarks.create({
                    'parentId': folder.id,
                    'title': divBookmarkDroppdownContent.dataset.title,
                    'url': divBookmarkDroppdownContent.dataset.url
                });

                // close dropdown
                var parent = divBookmarkDroppdownContent.parentElement;
                if (parent) {
                    parent.removeChild(divBookmarkDroppdownContent);
                }
            });

            var icon = document.createElement("span");
            icon.className = "spanBookmarkFolderIcon";

            var span = document.createElement("span");
            span.innerHTML = folder.title;

            div.appendChild(icon);
            div.appendChild(span);
            divBookmarkDroppdownContent.appendChild(div);
        });
    });

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
document.addEventListener("keydown", function (event) {
    if (event.keyCode == '38' || event.keyCode == '40') {
        // get the next and prev navigation options for this element
        var element = event.target;
        var next = element.dataset.next;
        var prev = element.dataset.prev;

        // up arrow was pressed and a prev element is defined
        if (event.keyCode == '38' && prev != undefined) {
            document.getElementById(prev).focus();
        }
        // down arrow was pressed and a next element is defined
        if (event.keyCode == '40' && next != undefined) {
            document.getElementById(next).focus();
        }

        event.preventDefault;
    }
});

/**
 * Localizes page using chrome.i18n.getMessage()
 */
function localizePageUI() {
    var objects = document.getElementsByTagName("html");
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
 * List all folders in chrome bookmarks
 *
 * @param {Element} bookmarkNode bookmark node element
 *
 * @returns {array} array of folders
 */
function listFolders(bookmarkNode) {
    var list = [];

    // not a floder
    if (!bookmarkNode.children) {
        return list;
    }

    // add current folder if it is not a root folder
    if (bookmarkNode.id != 0) {
        list = list.concat({
            id: bookmarkNode.id,
            title: bookmarkNode.title
        });
    }

    // add folders recursively
    for (var i = 0; i < bookmarkNode.children.length; i++) {
        list = list.concat(listFolders(bookmarkNode.children[i]));
    }

    return list;
}

/**
 * Requests suggestions from kinopoisk and build UI for them
 *
 * @param {string} searchText search request text
 */
function requestSuggestions(searchText) {
    xhr = new XMLHttpRequest();
    xhr.open("GET", getKpSearchSuggestionsUrl(searchText));
    xhr.setRequestHeader("Content-Type", "application/json");
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

    var arrowNavigationItemsIds = ["inputSearch"];

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
    arrowNavigationItemsIds.push("aSuggestionsAllResults");
    for (i = 0; i < arrowNavigationItemsIds.length; i++) {
        var element = document.getElementById(arrowNavigationItemsIds[i]);
        if (i != 0) {
            element.setAttribute("data-prev", arrowNavigationItemsIds[i - 1]);
        }
        if (i + 1 < arrowNavigationItemsIds.length) {
            element.setAttribute("data-next", arrowNavigationItemsIds[i + 1]);
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

    var divContent = document.createElement("div");
    divContent.className = "divSuggestionContent";

    // image
    var divContentImage = document.createElement("div");
    divContentImage.className = "divSuggestionContentImage";

    if (item.image) {
        var img = document.createElement("img");
        img.src = item.image;
        divContentImage.appendChild(img);
    } else {
        var img = document.createElement("div");
        img.className = "divSuggestionContentImagePlaceholder";
        divContentImage.appendChild(img);
    }

    // main
    var divContentMain = document.createElement("div");
    divContentMain.className = "divSuggestionContentMain";

    if (item.rus) {
        var divName = document.createElement("div");
        divName.className = "divSuggestionName";
        divName.innerHTML = item.rus;
        divContentMain.appendChild(divName);
    }

    var spanSubname = document.createElement("span");
    spanSubname.className = "spanSuggestionContentSubname";
    if (item.name) {
        spanSubname.innerHTML = item.name;
    }
    if (item.is_serial) {
        if (spanSubname.innerHTML.length > 0) {
            spanSubname.innerHTML += ", ";
        }
        spanSubname.innerHTML += chrome.i18n.getMessage("spanIsSerial");
    }
    if (item.year) {
        if (spanSubname.innerHTML.length > 0) {
            spanSubname.innerHTML += ", ";
        }
        spanSubname.innerHTML += item.year;
    }
    divContentMain.appendChild(spanSubname);

    divContent.appendChild(divContentImage);
    divContent.appendChild(divContentMain);
    a.appendChild(divContent);

    // rating
    if (item.ur_rating != undefined) {
        var divRating = document.createElement("div");
        divRating.className = "divSuggestionItemRating";

        if (item.ur_rating != 0) {
            divRating.innerHTML = item.ur_rating;
            if (item.ur_rating < 5) {
                divRating.classList.add("negativeRating");
            } else if (item.ur_rating >= 7) {
                divRating.classList.add("positiveRating");
            } else {
                divRating.classList.add("neutralRating");
            }
        } else {
            divRating.innerHTML = "&mdash;";
        }

        a.appendChild(divRating);
    }

    // bookmark
    var divBookmark = document.createElement("div");
    divBookmark.className = "divSuggestionItemBookmark";

    // bookmark button
    var divBookmarkButton = document.createElement("div");
    divBookmarkButton.className = "divSuggestionItemBookmarkButton";
    divBookmarkButton.title = chrome.i18n.getMessage("bookmarkButton");
    divBookmarkButton.addEventListener("click", function (event) {
        var element = event.target;
        event.stopPropagation();
        event.preventDefault();

        var buttonCenterX = element.getBoundingClientRect().top + 18;

        // dropdown direction (up or down in relation to button)
        if (buttonCenterX + 150 > document.body.clientHeight) {
            if (buttonCenterX < 150) {
                var pos = 150 - buttonCenterX - 10;
                divBookmarkDroppdownContent.style = "bottom:"+pos+"px;";
            }
            else {
                divBookmarkDroppdownContent.style = "bottom:10px;";
            }
        } else {
            divBookmarkDroppdownContent.style = "top:10px;";
        }

        // add or delete dropdown on button click
        if (divBookmark.lastChild.id == "divSuggestionItemBookmarkDropdown") {
            divBookmark.removeChild(divBookmarkDroppdownContent);
        } else {
            divBookmarkDroppdownContent.setAttribute("data-title", item.rus);
            divBookmarkDroppdownContent.setAttribute("data-url", getKpItemUrl(item.link));
            divBookmark.appendChild(divBookmarkDroppdownContent);
        }
    });

    divBookmark.appendChild(divBookmarkButton);

    a.appendChild(divBookmark);

    element.appendChild(a);

    return a.id;
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
 * @param {string} pageUrl url of a page
 */
function openInNewTab(pageUrl) {
    chrome.tabs.create({
        url: pageUrl
    });
}

/**
 * Generates unique id
 *
 * @returns {string}
 */
function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
