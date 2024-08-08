import { IPostSearchSettings } from "./post.search.interface";

export interface IPostFilters {
  title?: string;
  content?: string;
};

export interface IPostFiltersSettings {
  search: IPostSearchSettings
};

export interface IPostSearchFilter {
  wordSearch?: string;
  phraseSearch?: string;
};

