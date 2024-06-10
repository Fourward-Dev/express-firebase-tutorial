// eslint-disable-next-line no-unused-vars
export const errorResponder = (error, req, res, next) => {
  let status = null;
  switch (error.statusCode) {
    case 404:
      status = 404;
      break;
    case 409:
      status = 409;
      break;
    default:
      status = 401;
  }
  res.header("Content-Type", "application/json");
  res.status(status).send({ error: error.message });
};
