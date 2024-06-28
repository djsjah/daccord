interface IPostCreate {
  title: string;
  access: 'public' | 'private';
  content: string;
  tags?: string[];
};
export default IPostCreate;
