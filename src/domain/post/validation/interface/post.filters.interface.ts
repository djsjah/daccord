import { IPostSearchSettings } from './post.search.interface';

export interface IPostFiltersSettings {
  search: IPostSearchSettings;
};

export interface IPostSearchFilter {
  wordSearch?: string;
  phraseSearch?: string;
};

export interface IPostFilters {
  title?: IPostSearchFilter;
  content?: IPostSearchFilter;
};


