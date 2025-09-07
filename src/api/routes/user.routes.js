const userRoutes = [
  {
    method: "POST",
    path: "/users",
    handler: "UserController.createUser",
    authenticate: true,
  },
  {
    method: "POST",
    path: "/users/set-password",
    handler: "UserController.setUserPassword",
    authenticate: false,
  },
  {
    method: "POST",
    path: "/users/change-password",
    handler: "UserController.changeUserPassword",
    authenticate: true,
  },
  {
    method: "POST",
    path: "/users/bulk",
    handler: "UserController.createBulkUsers",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/users/export",
    handler: "UserController.exportUsers",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/users/is-exists",
    handler: "UserController.isUserExists",
    authenticate: false,
  },
  {
    method: "GET",
    path: "/users/:id",
    handler: "UserController.getOneUser",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/users",
    handler: "UserController.getAllUsers",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/users/:id",
    handler: "UserController.updateUser",
    authenticate: true,
  },
  {
    method: "DELETE",
    path: "/users/:id",
    handler: "UserController.deleteUser",
    authenticate: true,
  },
];

module.exports = userRoutes;
