const organizationRoutes = [
  {
    method: "POST",
    path: "/organizations",
    handler: "OrganizationController.createOrganization",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/organizations/export",
    handler: "OrganizationController.exportOrganizations",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/organizations/:id",
    handler: "OrganizationController.getOneOrganization",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/organizations",
    handler: "OrganizationController.getAllOrganizations",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/organizations/:id",
    handler: "OrganizationController.updateOrganization",
    authenticate: true,
  },
  {
    method: "DELETE",
    path: "/organizations/:id",
    handler: "OrganizationController.deleteOrganization",
    authenticate: true,
  },
];

module.exports = organizationRoutes;
