const Joi = require('joi');

const createUserSchema = Joi.object({
  full_name: Joi.string().max(100).required().messages({
    'string.max': 'Full name cannot exceed 100 characters',
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().max(255).required().messages({
    'string.email': 'Please enter a valid email address',
    'string.max': 'Email cannot exceed 255 characters',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  role_id: Joi.number().integer().required().messages({
    'number.base': 'role_id must be a number',
    'any.required': 'role_id is required',
  }),
});

const updateUserSchema = Joi.object({
  full_name: Joi.string().max(100).optional(),
  email: Joi.string().email().max(255).optional(),
  role_id: Joi.number().integer().optional(),
  is_active: Joi.boolean().optional(),
}).min(1).message('At least one field must be provided to update');

module.exports = { createUserSchema, updateUserSchema };