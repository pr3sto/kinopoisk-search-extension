/**
 * Creates kinopoisk item url
 *
 * @param {string} route url on a kinopoisk item
 *
 * @returns {string}
 */
function getKpItemUrl(route) {
    return "https://www.kinopoisk.ru/" + route;
}

/**
 * Creates kinopoisk search request url
 *
 * @param {string} searchText search request
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
    return "https://www.kinopoisk.ru/api/suggest/v2/?query=" + encodeURIComponent(searchText);
}
