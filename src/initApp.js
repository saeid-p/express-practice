import express from "express";
import initDatabase from "./db/init.db.js";
import routes from "./controllers/index.js";

const appPort = process.env.PORT || 3000;

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
};

const registerRoutes = (app) => {
  Object.entries(routes).forEach((router) => {
    const [, callback] = router;
    callback(app);
  });
};

/** Initializes an express app and registers the middlewares. */
export default async () => {
  const app = express();  
  app.use(express.json());

  await initDatabase();

  registerRoutes(app);

  app.use(errorHandler);
  app.listen(appPort, () => console.log("Listening!"));
};
