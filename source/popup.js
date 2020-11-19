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
            var span = document.createElement("span");
            span.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

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
            icon.className = "spanSuggestionItemBookmarkDropdownIcon";

            span.appendChild(icon);
            span.innerHTML += folder.title;

            divBookmarkDroppdownContent.appendChild(span);
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
        if (isButtonEnter(event)) {
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
            clearTimeout(searchRequestTimeout);
            resetSuggestionsUI();
        }
    });

    // arrow keys navigation
    document.addEventListener("keydown", function (event) {
        if (isButtonUp(event) || isButtonDown(event)) {
            // get the next and prev navigation options for this element
            var element = event.target;
            var next = element.dataset.next;
            var prev = element.dataset.prev;

            // up arrow was pressed and a prev element is defined
            if (isButtonUp(event) && prev != undefined) {
                document.getElementById(prev).focus();
            }
            // down arrow was pressed and a next element is defined
            if (isButtonDown(event) && next != undefined) {
                document.getElementById(next).focus();
            }

            event.preventDefault;
        }
    });

    searchInput.focus();
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
 * @param {any} bookmarkNode bookmark node element
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
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");
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
 * @param {any} jsonResponse kinopoisk response json object
 */
function createSuggestionsUI(searchText, jsonResponse) {
    resetSuggestionsUI();

    if (!jsonResponse || !jsonResponse.suggest || !jsonResponse.suggest.top) {
        return;
    }
    var jsonSuggestions = jsonResponse.suggest.top;
    if (!jsonSuggestions.topResult &&
        (!jsonSuggestions.movies || jsonSuggestions.movies.length == 0) &&
        (!jsonSuggestions.persons || jsonSuggestions.persons.length == 0)) {
            return;
        }


    var arrowNavigationItemsIds = ["inputSearch"];

    // first suggestion
    var divFirstElement = document.getElementById("divFirstSuggestion");
    if (jsonSuggestions.topResult) {
        var firstItem = null;
        var first = get(jsonSuggestions, "topResult.global");
        if (first) {
            if (first.__typename == "TvSeries" || first.__typename == "Film") {
                firstItem = createFilmItem(first);
            } else if (first.__typename == "Person") {
                firstItem = createPersonItem(first);
            }
        }

        if (firstItem) {
            setVisibility(divFirstElement.parentElement, true);
            var id = appendSuggestionItem(divFirstElement, firstItem);
            arrowNavigationItemsIds.push(id);
        } else {
            setVisibility(divFirstElement.parentElement, false);
        }
    } else {
        setVisibility(divFirstElement.parentElement, false);
    }

    // film suggestions
    var divFilmsElement = document.getElementById("divFilmSuggestions");
    if (jsonSuggestions.movies && jsonSuggestions.movies.length > 0) {
        setVisibility(divFilmsElement.parentElement, true);
        jsonSuggestions.movies.forEach(function (film) {
            var filmItem = createFilmItem(film.movie);
            var id = appendSuggestionItem(divFilmsElement, filmItem);
            arrowNavigationItemsIds.push(id);
        });
    } else {
        setVisibility(divFilmsElement.parentElement, false);
    }

    // people suggestions
    var divPeopleElement = document.getElementById("divPeopleSuggestions");
    if (jsonSuggestions.persons && jsonSuggestions.persons.length > 0) {
        setVisibility(divPeopleElement.parentElement, true);
        jsonSuggestions.persons.forEach(function (person) {
            var personItem = createPersonItem(person.person);
            var id = appendSuggestionItem(divPeopleElement, personItem);
            arrowNavigationItemsIds.push(id);
        });
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
 * Creates a film item
 *
 * @param {any} json json object returned from kinopoisk API
 *
 * @returns {any}
 */
function createFilmItem(json) {
    var imgLink = get(json, "poster.avatarsUrl");
    if (imgLink) {
        imgLink ="https:" + imgLink + "/40x60";
    }
    var year = get(json, "productionYear");
    if (!year) {
        year = get(json, "releaseYears");
        if (year && Array.isArray(year) && year.length == 1) {
            year = year[0].start + " &#8211; " + year[0].end;
        }
    }
    var rating = get(json, "rating.kinopoisk.value");
    if (rating) {
        rating = rating.toFixed(1);
    }
    var link = get(json, "id");
    if (link) {
        link = "film/" + link;
    }
    var name = get(json, "title.russian");
    var subname = get(json, "title.original");
    var isSerial = get(json, "__typename") == "TvSeries";

    return {
        link: link ? link : null,
        imgLink: imgLink ? imgLink : null,
        name: name ? name : null,
        subname: subname ? subname : null,
        year: year ? year : null,
        rating: rating ? rating : null,
        isSerial: isSerial
    };
}

/**
 * Creates a person item
 *
 * @param {any} json json object returned from kinopoisk API
 *
 * @returns {any}
 */
function createPersonItem(json) {
    var imgLink = get(json, "poster.avatarsUrl");
    if (imgLink) {
        imgLink ="https:" + imgLink + "/40x60";
    }
    var year = get(json, "birthDate");
    if (year) {
        year = (new Date(year).getFullYear());
    }
    var link = get(json, "id");
    if (link) {
        link = "name/" + link;
    }
    var name = get(json, "name");
    var subname = get(json, "originalName");

    return {
        link: link ? link : null,
        imgLink: imgLink ? imgLink : null,
        name: name ? name : null,
        subname: subname ? subname : null,
        year: year ? year : null,
        rating: null,
        isSerial: false
    };
}

/**
 * Creates and appends suggestion to html element
 *
 * @param {HTMLElement} element html element
 * @param {any} item suggestion item
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

    if (item.imgLink) {
        var img = document.createElement("img");
        img.src = item.imgLink;
        divContentImage.appendChild(img);
    } else {
        var img = document.createElement("div");
        img.className = "divSuggestionContentImagePlaceholder";
        divContentImage.appendChild(img);
    }

    // main
    var divContentMain = document.createElement("div");
    divContentMain.className = "divSuggestionContentMain";

    if (item.name) {
        var divName = document.createElement("div");
        divName.className = "divSuggestionName";
        divName.innerHTML = item.name;
        divContentMain.appendChild(divName);
    } else if (item.subname) {
        var divName = document.createElement("div");
        divName.className = "divSuggestionName";
        divName.innerHTML = item.subname;
        divContentMain.appendChild(divName);
    }

    var spanSubname = document.createElement("span");
    spanSubname.className = "spanSuggestionContentSubname";

    if (item.subname) {
        spanSubname.innerHTML = item.subname;
    }
    if (item.isSerial) {
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
    var divRating = document.createElement("div");
    divRating.className = "divSuggestionItemRating";

    if (item.rating) {
        divRating.innerHTML = item.rating;
        if (item.rating < 5) {
            divRating.classList.add("negativeRating");
        } else if (item.rating >= 7) {
            divRating.classList.add("positiveRating");
        } else {
            divRating.classList.add("neutralRating");
        }
    } else {
        divRating.innerHTML = "&mdash;";
    }

    a.appendChild(divRating);

    // bookmark
    var divBookmark = document.createElement("div");
    divBookmark.className = "divSuggestionItemBookmark";

    // bookmark button
    var divBookmarkButton = document.createElement("div");
    divBookmarkButton.className = "divSuggestionItemBookmarkButton";
    divBookmarkButton.title = chrome.i18n.getMessage("bookmarkButton");
    divBookmarkButton.addEventListener("click", function (event) {
        event.stopPropagation();
        event.preventDefault();

        var element = event.target;

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
            var title = item.name ? item.name : item.subname;
            divBookmarkDroppdownContent.setAttribute("data-title", title);
            divBookmarkDroppdownContent.setAttribute("data-url", getKpItemUrl(item.link));
            divBookmark.appendChild(divBookmarkDroppdownContent);
        }
    });

    divBookmark.appendChild(divBookmarkButton);

    a.appendChild(divBookmark);

    element.appendChild(a);

    return a.id;
}
