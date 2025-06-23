type SuggestResponse = {
  suggest: {
    top: {
      topResult: TopResult | null;
      movies: MovieWrapper[];
      persons: PersonWrapper[];
    };
  };
};

type TopResult = {
  global: Movie | TvSeries | Person;
};

type MovieWrapper = {
  movie: Movie | TvSeries;
};

type PersonWrapper = {
  person: Person;
};

type Movie = {
  id: number;
  title: Title;
  rating: Rating;
  gallery: MovieGallery;
  viewOption: ViewOption | null;
  productionYear: number | null;
  __typename: 'Film';
};

type TvSeries = {
  id: number;
  title: Title;
  rating: Rating;
  gallery: MovieGallery;
  viewOption: ViewOption | null;
  releaseYears: YearsRange[];
  __typename: 'TvSeries';
};

type Person = {
  id: number;
  name: string | null;
  originalName: string | null;
  birthDate: string | null;
  poster: Image | null;
  __typename: 'Person';
};

type Title = {
  russian: string | null;
  original: string | null;
};

type Rating = {
  kinopoisk: RatingValue;
};

type RatingValue = {
  value: number | null;
};

type MovieGallery = {
  posters: Posters;
};

type Posters = {
  kpVertical: Image | null;
  hdVertical: Image | null;
};

type Image = {
  avatarsUrl: string | null;
};

type ViewOption = {
  contentPackageToBuy: ContentPackage | null;
};

type ContentPackage = {
  billingFeatureName: string | null;
};

type YearsRange = {
  start: number | null;
  end: number | null;
};

export type {
  ContentPackage,
  Image,
  Movie,
  MovieGallery,
  MovieWrapper,
  Person,
  PersonWrapper,
  Posters,
  Rating,
  RatingValue,
  SuggestResponse,
  Title,
  TopResult,
  TvSeries,
  ViewOption,
  YearsRange,
};
