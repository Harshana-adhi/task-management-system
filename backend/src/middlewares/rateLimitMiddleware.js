const rateLimit = require('express-rate-limit');

// Generous threshold deliberately — this is a university project where
// the same handful of IPs (classmates, instructor, grader) will be
// testing/demoing repeatedly. A strict production-grade limit (e.g. 5
// per 15 min) would lock out legitimate use during grading. This still
// meaningfully blocks realistic brute-force attempts while staying
// usable for demo purposes.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too Many Requests',
        message: 'Too many login attempts. Please try again in a few minutes.'
    }
});

// Slightly tighter than loginLimiter since each hit sends a real email via
// Resend (a metered/paid resource), not just a DB lookup — still generous
// enough that demo/grading traffic from a handful of IPs won't get blocked.
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too Many Requests',
        message: 'Too many password reset requests. Please try again in a few minutes.'
    }
});

module.exports = { loginLimiter, forgotPasswordLimiter };