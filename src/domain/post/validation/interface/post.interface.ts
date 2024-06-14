interface IPost {
  title: string;
  access: string;
  content: string;
  rating?: number;
  tags?: string[];
  authorId: string;
};
export default IPost;
