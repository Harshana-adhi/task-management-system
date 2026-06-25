const Joi = require('joi');

const createProjectSchema = Joi.object({
    projectName: Joi.string().max(150).required().messages({
        'string.max': 'Project name cannot exceed 150 characters',
        'string.empty': 'Project name is required',
        'any.required': 'Project name is required',
    }),
    description: Joi.string().optional().allow(''),
});

const updateProjectSchema = Joi.object({
    projectName: Joi.string().max(150).required().messages({
        'string.max': 'Project name cannot exceed 150 characters',
        'string.empty': 'Project name is required',
        'any.required': 'Project name is required',
    }),
    description: Joi.string().optional().allow(''),
});

const addMemberSchema = Joi.object({
    userId: Joi.string().uuid().required().messages({
        'string.guid': 'userId must be a valid UUID',
        'any.required': 'userId is required',
    }),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };