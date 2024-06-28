interface IPostUpdate {
  title: string;
  access: 'public' | 'private';
  content: string;
  tags: string[];
};
export default IPostUpdate;
