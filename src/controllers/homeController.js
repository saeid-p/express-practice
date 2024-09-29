const routeHandler = (req, res) => {
  const responseBody = {
    version: "1.0.0",
    appName: "User management system.",
  };
  return res.json(responseBody);
};

const BASE_ROUTE = "/";
export default (app) => {
  app.get(BASE_ROUTE, routeHandler);
};
