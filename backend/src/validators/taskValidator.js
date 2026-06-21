const Joi = require('joi');

const createTaskSchema = Joi.object({
    projectId: Joi.string().uuid().required().messages({
        'string.guid': 'projectId must be a valid UUID',
        'any.required': 'projectId is required',
    }),
    title: Joi.string().max(200).required().messages({
        'string.max': 'Title cannot exceed 200 characters',
        'string.empty': 'Task title is required',
        'any.required': 'Task title is required',
    }),
    description: Joi.string().optional().allow(''),
    priority: Joi.string().valid('Low', 'Medium', 'High').required().messages({
        'any.only': 'Priority must be one of: Low, Medium, High',
        'any.required': 'Priority is required',
    }),
    dueDate: Joi.date().iso().optional().messages({
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

const updateTaskStatusSchema = Joi.object({
    status: Joi.string()
        .valid('To Do', 'In Progress', 'Completed')
        .required()
        .messages({
            'any.only': 'Status must be one of: To Do, In Progress, Completed',
            'any.required': 'Status is required',
        }),
});

const assignTaskSchema = Joi.object({
    userId: Joi.string().uuid().required().messages({
        'string.guid': 'userId must be a valid UUID',
        'any.required': 'userId is required',
    }),
});

module.exports = { createTaskSchema, updateTaskSchema, updateTaskStatusSchema, assignTaskSchema };