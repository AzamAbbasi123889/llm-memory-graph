export function notFoundHandler(_req, res) {
  res.status(404).json({
    message: "That endpoint does not exist."
  });
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode >= 500 && statusCode !== 503
      ? "Something went wrong on the server."
      : error.message || "Request failed.";

  res.status(statusCode).json({
    message
  });
}
