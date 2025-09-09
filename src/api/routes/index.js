const express = require("express");
const router = express.Router();
const controllers = require("../controllers");
const { validationMiddleware, authMiddleware } = require("../middlewares");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const collectionRoutes = require("./collection.routes");
const collectionSrNoRoutes = require("./collection-sr-no.routes");
const customerCollectionAccessRoutes = require("./customer-collection-access.routes");
const orderRoutes = require("./order.routes");
const reportRoutes = require("./report.routes");

const routes = [
  ...authRoutes,
  ...userRoutes,
  ...collectionRoutes,
  ...collectionSrNoRoutes,
  ...customerCollectionAccessRoutes,
  ...orderRoutes,
  ...reportRoutes,
];

// Middleware to initialize controllers with organization_slug
const initializeController = (controllerName) => (req, _res, next) => {
  req.controllerInstance = new controllers[controllerName]();

  next();
};

// Applying routes
routes.forEach((route) => {
  const [controllerName, methodName] = route.handler.split(".");

  const controllerMethod = async (req, res, next) => {
    try {
      // Use the controller instance from req
      const controllerInstance = req.controllerInstance;
      await controllerInstance[methodName](req, res, next);
    } catch (error) {
      next(error);
    }
  };

  let middlewares = [];

  if (route.authenticate) {
    middlewares.push(authMiddleware);
    middlewares.push(initializeController(controllerName, methodName));
  } else {
    middlewares.push(initializeController(controllerName, methodName));
  }

  middlewares.push(validationMiddleware(controllerName, methodName));

  router[route.method.toLowerCase()](
    route.path,
    ...middlewares,
    controllerMethod
  );
});

exports.router = router;
