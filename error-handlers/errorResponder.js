export const errorResponder = (error, req, res, next) => {
  let status = null;
  switch (error.statusCode) {
    case 401:
      status = 401;
      break;
    case 404:
      status = 404;
      break;
    case 409:
      status = 409;
      break;
    default:
      status = 500;
  }
  res.header("Content-Type", "application/json");
  res.status(status).send({ error: error.message });
};
