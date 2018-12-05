/*
  This is the authentication/authorization service
  It uses the WebAuth API from auth0-js SDK to make standard OAuth 2.0 calls to Auth0
  We use OAuth 2.0 implicit grant as we cannot maintain client_secret
*/
import auth0 from 'auth0-js'
import { AUTH_CONFIG } from './auth0-variables'
import EventEmitter from 'eventemitter3'
import router from './../router'
import IdTokenVerifier from 'idtoken-verifier'

export default class AuthService {
  // global authn state
  authenticated = this.isAuthenticated()
  // auth state/event notifier
  authNotifier = new EventEmitter()

  constructor () {
    this.login = this.login.bind(this)
    this.setSession = this.setSession.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
  }

  // generating and providing nonce explicitly instead of using auto generated nonce
  // as I dont know a way of getting the auto-generated nonce for id_token verification purposes
  generateNonce () {
    var bytes = new Uint8Array(16)
    var random = window.crypto.getRandomValues(bytes)
    var result = []
    var charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~'
    random.forEach(function (c) {
      result.push(charset[c % charset.length])
    })
    var nonce = result.join('')
    // store nonce in session for id_token verification
    sessionStorage.setItem('po_nonce', nonce)
    return nonce
  }

  // init auth-js authz call
  auth0 = new auth0.WebAuth({
    // standard OAuth 2.0 authz params
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    responseType: 'token id_token',
    scope: 'openid po:read po:write po:delete',
    audience: AUTH_CONFIG.apiUrl
  })

  // initial authz call for login
  login () {
    this.auth0.authorize({nonce: this.generateNonce()})
  }

  // handle hash fragments in authz response
  handleAuthentication () {
    this.auth0.parseHash({nonce: sessionStorage.getItem('po_nonce')}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        // initial checks on authz response look alright
        // do further checks and et session info
        this.setSession(authResult)
        // keep use on home page and display additional information
        router.replace('home')
      } else if (err) {
        // some error occurred
        router.replace('home')
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }

  // check id_token, finalize authn state and store session info
  setSession (authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )

    // initialize id_token verifier API
    var verifier = new IdTokenVerifier({
      // use standard OIDC standard keyset endpoint for JWT signature verification
      jwksURI: AUTH_CONFIG.jwksUri,
      // make sure issuer is as expected
      issuer: AUTH_CONFIG.idTokenIssuer,
      // make sure we are the intended consumer
      audience: AUTH_CONFIG.idTokenAudience
      // pending! - verify at_hash - adds extra security -
      // - by binding access_token and id_token together
    })

    // just aliasing to make this visible in closure
    var authService = this

    // verify id_token
    verifier.verify(authResult.idToken, sessionStorage.getItem('po_nonce'),
      function (error, payload) {
        if (error) {
          console.log('error verifying id_token: ' + error)
        } else {
          // id_token is all good, store session information
          console.log('success verifying id_token: ' + JSON.stringify(payload))
          sessionStorage.setItem('access_token', authResult.accessToken)
          sessionStorage.setItem('id_token', authResult.idToken)
          sessionStorage.setItem('expires_at', expiresAt)
          sessionStorage.setItem('job_title', payload['http://jv-techex.com/title'].toLowerCase())
          sessionStorage.setItem('nickname', payload['http://jv-techex.com/nickName'])
          authService.authNotifier.emit('authChange', { authenticated: true })
          authService.scheduleRenewal()
        }
      })
  }

  logout () {
    // remove tokens and session info from session-storage
    // better approach would be to use vuex for state management
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('id_token')
    sessionStorage.removeItem('expires_at')
    sessionStorage.removeItem('po_nonce')
    sessionStorage.removeItem('nickname')
    sessionStorage.removeItem('job_title')
    this.userProfile = null
    this.authNotifier.emit('authChange', false)

    // single logout from this app and Auth0
    this.auth0.logout({
      returnTo: 'http://po-ui.jv-techex.com/home'
    })

    // navigate to the home route
    router.replace('home')
  }

  // authn status check
  isAuthenticated () {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(sessionStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  // perform silent authentication
  renewToken () {
    this.auth0.authorize({
      prompt: 'none',
      nonce: this.generateNonce()
    })
  }

  // schedule access token renewal (we do not have refresh_token)
  // use silent authentication
  scheduleRenewal () {
    var expiresAt = JSON.parse(sessionStorage.getItem('expires_at'))
    var delay = expiresAt - Date.now()
    if (delay > 0) {
      var authService = this
      setTimeout(function () {
        authService.renewToken()
      }, delay)
    }
    console.log('access_token silent renewal scheduled after: ' + Math.round(delay / 1000 / 60) + ' mins')
  }
}
