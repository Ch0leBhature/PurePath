import Joi from "joi";

export const routeAnalyzeSchema = Joi.object({
  start: Joi.array().length(2).items(Joi.number()).required(),
  end: Joi.array().length(2).items(Joi.number()).required(),
  mode: Joi.string().optional(),
  preset: Joi.string()
    .valid("fastest", "balanced", "eco", "lowest_pollution")
    .optional(),
});

export function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error)
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });
    next();
  };
}
