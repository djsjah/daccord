import Joi from 'joi';

const PostGetSchema = Joi.string().uuid().required();
export default PostGetSchema;
