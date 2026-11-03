export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: formattedErrors[0]?.message || 'Validation error',
        errors: formattedErrors,
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid request data',
    });
  }
};
