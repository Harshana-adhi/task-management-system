const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'Current password is required',
        'any.required': 'Current password is required',
    }),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Z])(?=.*[0-9])/)
        .required()
        .messages({
            'string.min': 'New password must be at least 8 characters',
            'string.pattern.base': 'New password must contain at least one uppercase letter and one number',
            'string.empty': 'New password is required',
            'any.required': 'New password is required',
        }),
});

module.exports = { loginSchema, changePasswordSchema };