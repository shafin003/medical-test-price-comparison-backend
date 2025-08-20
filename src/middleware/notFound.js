import createError from 'http-errors';

/**
 * Middleware to handle requests for routes that do not exist.
 * It creates a 404 error and passes it to the next middleware (the error handler).
 */
const notFound = (req, res, next) => {
	// Create a 404 error with a helpful message and forward it to the error handler
	next(createError(404, `Route not found - Cannot ${req.method} ${req.originalUrl}`));
};

export default notFound;