type Suggestions = {
  first: MovieItem | PersonItem | null;
  movies: MovieItem[];
  persons: PersonItem[];
};

type MovieItem = {
  id: string;
  url: string;
  imgUrl: string | null;
  name: string;
  subname: string;
  viewOption: string | null;
  rating: number | null;
  __typename: 'MovieItem';
};

type PersonItem = {
  id: string;
  url: string;
  imgUrl: string | null;
  name: string;
  subname: string;
  __typename: 'PersonItem';
};

export type { MovieItem, PersonItem, Suggestions };
