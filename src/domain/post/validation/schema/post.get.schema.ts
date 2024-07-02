import Joi from 'joi';

const PostGetByIdSchema = Joi.string().uuid().required();
export default PostGetByIdSchema;
