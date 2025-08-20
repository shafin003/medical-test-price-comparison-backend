import { isHttpError } from 'http-errors';

const errorHandler = (err, req, res, next) => {
	console.error(err); // Log the full error for debugging

	// Check if this is an error we created intentionally with http-errors
	if (isHttpError(err)) {
		// It's an HttpError, so we can trust its status code and message.
		return res.status(err.statusCode).json({
			success: false,
			status: err.statusCode,
			message: err.message,
		});
	}

	// If it's not an HttpError, it's an unexpected server error.
	// We should not expose the internal error message to the client in production.
	return res.status(500).json({
		success: false,
		status: 500,
		message: err.message,
	});
};

export default errorHandler;
