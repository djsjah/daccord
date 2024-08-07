import IUserPayload from '../../../auth/validation/interface/user.payload.interface';

export interface IPostFilters {
  title?: string;
  content?: string;
};

export interface IPostFiltersSettings {
  search: {
    params: string[],
    methods: ISearchMethod[]
  }
};

export interface ISearchType {
  wordSearch?: string;
  phraseSearch?: string;
};

export interface ISearchMethod {
  name: 'wordSearch' | 'phraseSearch',
  method: (user: IUserPayload, searchParam: 'title' | 'content', searchString: string) => Promise<unknown[]>
};
