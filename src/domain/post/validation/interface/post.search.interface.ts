import IPostIndex from './post.index.interface';
import PostESParam from '../enum/post.elasticsearch.param.enum';
import ElasticSearchMethod from '../../../../utils/lib/elasticsearch/validation/enum/elasticsearch.method.enum';

export interface IPostESSettings {
  params: PostESParam[];
  methods: ElasticSearchMethod[];
}

export interface IPostESOptions {
  index: string;
  slop: number;
};

export interface IPostESRestrict {
  admin: () => void;
  user: (userId: string) => {
    excludes: Array<keyof IPostIndex>,
    term: {
      authorId: string
    }
  };
}
