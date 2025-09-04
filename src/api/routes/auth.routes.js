const authRoutes = [
  //   {
  //     method: "POST",
  //     path: "/auth/register",
  //     handler: "AuthController.register",
  //     authenticate: false,
  //   },
  {
    method: "POST",
    path: "/auth/login",
    handler: "AuthController.login",
    authenticate: false,
  },
  {
    method: "POST",
    path: "/auth/logout",
    handler: "AuthController.logout",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/auth/profile",
    handler: "AuthController.getProfile",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/auth/profile",
    handler: "AuthController.updateProfile",
    authenticate: true,
  },
  //   {
  //     method: "POST",
  //     path: "/auth/join-user",
  //     handler: "AuthController.joinUser",
  //     authenticate: false,
  //   },
  //   {
  //     method: "POST",
  //     path: "/auth/resend-verification-email",
  //     handler: "AuthController.resendVerificationEmail",
  //     authenticate: false,
  //   },
  //   {
  //     method: "POST",
  //     path: "/auth/verify-email",
  //     handler: "AuthController.verifyEmail",
  //     authenticate: false,
  //   },
  //   {
  //     method: "POST",
  //     path: "/auth/forgot-password",
  //     handler: "AuthController.forgotPassword",
  //     authenticate: false,
  //   },
  //   {
  //     method: "POST",
  //     path: "/auth/reset-password",
  //     handler: "AuthController.resetPassword",
  //     authenticate: false,
  //   },
];

module.exports = authRoutes;
