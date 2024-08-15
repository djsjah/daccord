import IPostIndex from './post.index.interface';
import PostSearchParam from '../enum/post.search.param';
import ElasticSearchMethod from '../../../../utils/lib/elasticsearch/validation/enum/elasticsearch.method';

export interface IPostSearchSettings {
  params: PostSearchParam[];
  methods: ElasticSearchMethod[];
}

export interface IPostSearch {
  index: string;
  slop: number;
};

export interface IPostSearchRestrict {
  admin: () => void;
  user: (userId: string) => {
    excludes: Array<keyof IPostIndex>,
    term: {
      authorId: string
    }
  };
}
