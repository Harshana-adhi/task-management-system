const Joi = require('joi');

const createTaskSchema = Joi.object({
  project_id: Joi.string().uuid().required().messages({
    'string.guid': 'project_id must be a valid UUID',
    'any.required': 'project_id is required',
  }),
  title: Joi.string().max(200).required().messages({
    'string.max': 'Title cannot exceed 200 characters',
    'string.empty': 'Task title is required',
    'any.required': 'Task title is required',
  }),
  description: Joi.string().optional().allow(''),
  status: Joi.string()
    .valid('To Do', 'In Progress', 'Completed')
    .default('To Do')
    .messages({
      'any.only': 'Status must be one of: To Do, In Progress, Completed',
    }),
  priority: Joi.string().valid('Low', 'Medium', 'High').required().messages({
    'any.only': 'Priority must be one of: Low, Medium, High',
    'any.required': 'Priority is required',
  }),
  due_date: Joi.date().iso().greater('now').optional().messages({
    'date.greater': 'Due date cannot be in the past',
    'date.format': 'Due date must be a valid date',
  }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().optional().allow(''),
  status: Joi.string()
    .valid('To Do', 'In Progress', 'Completed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: To Do, In Progress, Completed',
    }),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional().messages({
    'any.only': 'Priority must be one of: Low, Medium, High',
  }),
  due_date: Joi.date().iso().optional(),
}).min(1).message('At least one field must be provided to update');

module.exports = { createTaskSchema, updateTaskSchema };