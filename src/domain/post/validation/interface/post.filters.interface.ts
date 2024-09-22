import PostSearchParam from '../enum/post.search.param.enum';

export interface IPostFiltersSettings {
  search: {
    params: PostSearchParam[]
  };
};

export interface IPostESFilter {
  wordSearch?: string;
  phraseSearch?: string;
};

export interface IPostFilters {
  title?: IPostESFilter;
  content?: IPostESFilter;
  revisionGroupId?: string;
};


