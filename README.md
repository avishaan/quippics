quippics
========

ExpressJS, Mongoose, Node, Passport, Image voting ranking rating backend API.

The following is a general backend method to upload, rank, score, and comment
on submissions to a challenge.

Technology/Players
----------------------
- Express as the web application framework.
- Node.js as the server platform.
- Passport as the authentication middleware.
- Jasmine as the testing framework.
- Mongoose as the object modeler for Node.js.
- MongoDB as the x-platform document based noSQL database.

Domains
----------------------
Each environment is found at a different route. This is to allow fast development
without disturbing production. The environments are as such in the following table.

| Env Type | Domain | Description                |
-----------|--------|-----------------------------
|Dev    | quippics-dev.herokuapp.com  | Should be used to develop the latest version of the app|
|       | dev.quippics.us (preferred) |       |
|Test   | quippics-test.herokuapp.com | Should be used for beta testing. Bugs should be fixed to prepare for prod|
|       | test.quippics.us (preferred)|       |
|Prod   | epic-api.herokuapp.com      | Should be used for production environment. Only changes at this point are for bug fixes|
|(Master)| prod.quippics.us (preferred)|       |


Documentation
----------------------
Each route takes the format of domain/version/route
The route is located in the route documentation.
The version differences are specified in each route.
Route Example: `dev.quippics.us/api/v1/register`

- Route Documentation
  - [Information on Challenge Routes](./docs/challengesRoute.md)
  - [Information on Submission Routes](./docs/submissionsRoute.md)
  - [Information on User Routes](./docs/usersRoute.md)
  - [Information on Friendship Routes](./docs/friendshipsRoute.md)
  - [Information on Ballot Routes](./docs/ballotsRoute.md)
  - [Information on Comment Routes](./docs/commentsRoute.md)
  - [Information on Activity Routes](./docs/activitiesRoute.md)
  - [Information on Apple Notifications Routes](./docs/apnsRoute.md)
- [Connecting Routes to Interface (Right Click and Save-As)](./docs/InterfaceRouteInfo.pdf)


Test Cases
----------------------
Test cases are bundled into logical groups
