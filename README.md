# Purchase Order Management UI

This is a simple CRUD application for OIDC & OAuth2.0 demonstration purposes. 
This extends the Auth0 VueJS sample application.

## Getting Started

On Auth0 create a new client in the [dashboard](https://manage.auth0.com). Find the **domain** and **client ID** from the settings area and add the URL for your application to the **Allowed Callback URLs** box.

Clone the repo

```bash
cd po-ui
npm install
```

## Set the Client ID and Domain

Rename the `auth0-variables.js.example` file to `auth0-variables.js` and provide the **client ID** and **domain** there. This file is located in `src/auth/`.

## Run the Application

```bash
npm start dev
```

The application will be served at `http://localhost:80`.

