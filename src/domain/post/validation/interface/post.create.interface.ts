interface IPostCreate {
  title: string;
  access: 'public' | 'private';
  content: string;
  tags?: string[];
  authorId: string;
};
export default IPostCreate;
