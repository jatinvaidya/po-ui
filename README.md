# Purchase Order Management UI

This is a simple CRUD application for OIDC & OAuth2.0 demonstration purposes. This extends the Auth0 VueJS sample application. This SPA application is essentially an **OAuth 2.0 Client Application** and **OpenID-Connect Relying Party** that accesses an **OAuth 2.0 Protected Resource Server (API)**.
<br>
<br>

## Configuration Details
<hr>

| Item                         | Value                 | 
| -----------------------------|-----------------------|
|OAuth 2.0 Authorization Server| `jv-techex.auth0.com` | 
|OpenID-Connect Provider       | `jv-techex.auth0.com` | 
|Client Application on Auth0   | `po-ui`               |
|API Application on Auth0      | `po-api`              |
|OIDC flow type                | `implicit`            |

The `src/auth/auth0-variables.js` file contains the above configuration properties.
<br>
<br>

## Backend API Details
<hr>

Details for Backend API that this SPA accesses are covered [here](https://github.com/jatinvaidya/po-api).  
<br>
<br>

## Auth0 Rules
<hr>

The Access Control requirements for this solution are as follows:

| Job Title  | Business Permissions    | OAuth 2.0 Scopes    |
| -----------| ----------------------- |---------------------|
| clerk      | List Orders             | po:read             |
| supervisor | Edit Orders (& above)   | po:write (& above)  |
| executive  | Delete Orders (& above) | po:delete (& above) |

To meet these requirements, following two Auth0 rules have been configured for this SPA:

1. **Enrich ID token with Title Claim**
   
   *This rule facilitates access control at UI layer.*  

   It enriches the `id_token` sent to the SPA with claim for user's job title
   Claim Name: `http://jv-techex.com/title`
   Possible Claim Values: { `clerk`, `supervisor`, `executive` } (one of these)  
   Post authentication, the SPA extracts the said claim and decides which UI controls to show or hide.  

2. **Check Access Token for Authorized Scopes**
   
   *This rule facilitates access control at API layer.*  

   Before authentication, the SPA obviously does not know the user's job title. So, it requests all above scopes on the authorization call, along with `openid` scope. This rule edits the scopes offered in the `access_token` to ensure they map the allowable scopes for user's job title.
<br>
<br>

## id_token Verification   
<hr>

This SPA verifies id_token before *consuming* it. A [library](https://github.com/auth0/idtoken-verifier) is used for this purpose.

Verification includes:
- digital signature
- issuer claim
- audience claim
- nonce
<br>
<br>

## access_token renewal
<hr>

If the access_token expires, the user if still actively working on the application interface, will face interruption
as the SPA will no longer be able to call the po-api on behalf of the user. We need to renew the access_token just before expiration.
Also, since we are using `implicit` grant, we do not have `refresh_token` which can be used for renewing `access_token`. 
Therefore, we use a workaround by silently sending a new authorization request with `prompt=none` which means if the Auth0 session cookie
is still active then we will ge a new `access_token`.

## Logout

Authenticated user may choose to `logout` by clicking the logout button which will do the following:
- End SPA session by clearing browser `session storage` of `access_token`, `id_token` and any other temporary data
- End Auth0 session by calling Auth0 `logout` API and redirect the user back to `/home`

## Running Locally
<hr>

Clone the repo

```bash
cd po-ui
npm install && npm run dev
```

The application will be served at `http://po-ui.jv-techex.com:80`.  
*I have defined a `hosts` file entry to point `po-ui.jv-techex.com` to `127.0.0.1`*
