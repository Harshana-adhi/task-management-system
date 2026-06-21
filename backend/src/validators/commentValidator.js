const Joi = require('joi');

const addCommentSchema = Joi.object({
    task_id: Joi.string().uuid().required().messages({
        'string.guid': 'task_id must be a valid UUID',
        'any.required': 'task_id is required',
    }),
    comment_text: Joi.string().min(1).max(1000).required().messages({
        'string.max': 'Comment cannot exceed 1000 characters',
        'string.empty': 'Comment text is required',
        'any.required': 'Comment text is required',
    }),
});

module.exports = { addCommentSchema };