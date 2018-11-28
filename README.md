# Purchase Order Management UI

This is a simple CRUD application for OIDC & OAuth2.0 demonstration purposes. 
This extends the Auth0 VueJS sample application.

This SPA application is essentially an **OAuth 2.0 Client Application** and **OpenID-Connect Relying Party** that accesses an **OAuth 2.0 Protected Resource Server (API)**.

## Configuration Details

**OAuth 2.0 Authorization Server**: `jv-techex.auth0.com`  
**OpenID-Connect Provider**: `jv-techex.auth0.com`  
**Client Application on Auth0**: `po-ui`  
**API Application on Auth0**: `po-api`  

The `src/auth/auth0-variables.js` file contains the above configuration properties.

Clone the repo

```bash
cd po-ui
npm install
```

## Run the Application

```bash
npm start dev
```

The application will be served at `http://localhost:80`.

