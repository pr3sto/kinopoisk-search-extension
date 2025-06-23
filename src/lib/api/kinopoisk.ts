import type { MovieItem, PersonItem, Suggestions } from '../types/suggestions';
import type {
  Movie,
  Person,
  SuggestResponse,
  TvSeries,
} from './types/kinopoisk';

export function getKpChanceUrl(): string {
  return 'https://www.kinopoisk.ru/chance/';
}

export function getKpSearchUrl(searchText: string): string {
  return `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(searchText)}`;
}

export async function getKpSuggestionsAsync(
  searchText: string,
  signal: AbortSignal,
): Promise<Suggestions | null> {
  const url = `https://www.kinopoisk.ru/api/suggest/v2/?query=${encodeURIComponent(searchText)}`;

  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('x-requested-with', 'XMLHttpRequest');

  try {
    const response = await (await fetch(url, { headers, signal })).json();
    if (!response) {
      return null;
    }
    return parseResponse(response);
  } catch (error) {
    console.log(error);
    return null;
  }
}

function parseResponse(response: SuggestResponse): Suggestions | null {
  const { top } = response.suggest;
  if (!top.topResult && top.movies.length === 0 && top.persons.length === 0) {
    return null;
  }

  // first suggestion
  let first: MovieItem | PersonItem | null = null;
  const topResult = top.topResult?.global;
  if (topResult) {
    switch (topResult.__typename) {
      case 'Film':
      case 'TvSeries':
        first = parseMovie(topResult);
        break;
      case 'Person':
        first = parsePerson(topResult);
        break;
    }
  }

  // movies suggestions
  const movies: MovieItem[] = top.movies.map((movieWrapper) =>
    parseMovie(movieWrapper.movie),
  );

  // persons suggestions
  const persons: PersonItem[] = top.persons.map((personWrapper) =>
    parsePerson(personWrapper.person),
  );

  return {
    first,
    movies,
    persons,
  };
}

function parseMovie(movie: Movie | TvSeries): MovieItem {
  const url =
    movie.__typename === 'TvSeries'
      ? `https://www.kinopoisk.ru/series/${movie.id}`
      : `https://www.kinopoisk.ru/film/${movie.id}`;

  let imgUrl = movie.gallery.posters.kpVertical?.avatarsUrl ?? null;
  if (imgUrl) {
    imgUrl = fixImgUrl(imgUrl);
  }

  const name = movie.title.russian ?? movie.title.original ?? '';
  let subname = movie.title.russian ? (movie.title.original ?? '') : '';

  if (movie.__typename === 'TvSeries') {
    if (subname.length > 0) {
      subname += ', ';
    }
    subname += chrome.i18n.getMessage('IsSerialText');

    if (movie.releaseYears.length === 1) {
      const start = movie.releaseYears[0].start ?? '...';
      const end = movie.releaseYears[0].end ?? '...';
      const year = start === end ? start : `${start} - ${end}`;

      if (subname.length > 0) {
        subname += ', ';
      }
      subname += year;
    }
  } else if (movie.__typename === 'Film' && movie.productionYear) {
    if (subname.length > 0) {
      subname += ', ';
    }
    subname += movie.productionYear;
  }

  const rating = movie.rating.kinopoisk.value ?? null;
  const viewOption =
    movie.viewOption?.contentPackageToBuy?.billingFeatureName ?? null;

  return {
    id: movie.id.toString(),
    url: url,
    imgUrl: imgUrl,
    name: name,
    subname: subname,
    viewOption: viewOption,
    rating: rating,
    __typename: 'MovieItem',
  };
}

function parsePerson(person: Person): PersonItem {
  const url = `https://www.kinopoisk.ru/name/${person.id}`;

  let imgUrl = person.poster?.avatarsUrl ?? null;
  if (imgUrl) {
    imgUrl = fixImgUrl(imgUrl);
  }

  const name = person.name ?? person.originalName ?? '';
  let subname = person.name ? (person.originalName ?? '') : '';

  if (person.birthDate) {
    const year = new Date(person.birthDate).getFullYear();
    if (subname.length > 0) {
      subname += ', ';
    }
    subname += year;
  }

  return {
    id: person.id.toString(),
    url: url,
    imgUrl: imgUrl,
    name: name,
    subname: subname,
    __typename: 'PersonItem',
  };
}

function fixImgUrl(url: string): string {
  // remove leading slashes
  url = url.replace(/^\/+/, '');

  // add protocol
  if (!/^https:\/\/.*/.test(url)) {
    url = 'https://' + url;
  }

  // append resolution
  return `${url}/40x60`;
}
