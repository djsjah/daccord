interface IPostUpdate {
  title: string;
  access: 'public' | 'private';
  content: string;
  rating: number;
  tags: string[];
};
export default IPostUpdate;
