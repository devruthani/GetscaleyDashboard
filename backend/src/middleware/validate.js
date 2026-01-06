import Joi from 'joi'

/**
 * Middleware factory for Joi validation
 * 
 * @param {Object} schema - Joi schema object
 * @param {string} [property='body'] - Request property to validate (body, query, params)
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false })

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ')
      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
      })
    }

    next()
  }
}

// Common schemas can be exported from here or separate files
export const schemas = {
  // Example: ID parameter validation
  idParam: Joi.object({
    id: Joi.string().required(), // or Joi.number().integer()
  }),
}
