import Joi from 'joi';

export const PostFiltersSchema = Joi.alternatives().try(
  Joi.object({
    title: Joi.string().required()
  }),
  Joi.object({
    content: Joi.string().required()
  })
).optional();

export const PostSearchSchema = Joi.alternatives().try(
  Joi.object({
    wordSearch: Joi.string().required()
  }),
  Joi.object({
    phraseSearch: Joi.string().required()
  })
).required();
