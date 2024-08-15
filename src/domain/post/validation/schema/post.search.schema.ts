import Joi from 'joi';

export const PostSearchSchema = Joi.alternatives().try(
  Joi.object({
    wordSearch: Joi.string().required()
  }),
  Joi.object({
    phraseSearch: Joi.string().required()
  })
).required();

export const PostFiltersSchema = Joi.alternatives().try(
  Joi.object({
    title: PostSearchSchema
  }),
  Joi.object({
    content: PostSearchSchema
  })
).optional();
