/**
 * Basic request body validation helper.
 * Accepts an array of required field names and returns middleware that
 * responds with 400 if any of them are missing from req.body.
 *
 * Usage:
 *   router.post('/register', validateBody(['email', 'password', 'name']), handler);
 */
export function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '',
    );

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: missing.map((field) => `${field} is required`),
      });
    }

    next();
  };
}

export default validateBody;
