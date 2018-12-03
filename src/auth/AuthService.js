import auth0 from 'auth0-js'
import { AUTH_CONFIG } from './auth0-variables'
import EventEmitter from 'eventemitter3'
import router from './../router'
import IdTokenVerifier from 'idtoken-verifier'

export default class AuthService {
  authenticated = this.isAuthenticated()
  authNotifier = new EventEmitter()

  constructor () {
    this.login = this.login.bind(this)
    this.setSession = this.setSession.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
  }

  generateNonce () {
    var bytes = new Uint8Array(16)
    var random = window.crypto.getRandomValues(bytes)
    var result = []
    var charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~'
    random.forEach(function (c) {
      result.push(charset[c % charset.length])
    })
    var nonce = result.join('')
    sessionStorage.setItem('po_nonce', nonce)
    return nonce
  }

  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    responseType: 'token id_token',
    scope: 'openid po:read po:write po:delete',
    audience: AUTH_CONFIG.apiUrl
  })

  login () {
    this.auth0.authorize({nonce: this.generateNonce()})
  }

  handleAuthentication () {
    this.auth0.parseHash({nonce: sessionStorage.getItem('po_nonce')}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        router.replace('home')
      } else if (err) {
        router.replace('home')
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }

  setSession (authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )

    var verifier = new IdTokenVerifier({
      jwksURI: AUTH_CONFIG.jwksUri,
      issuer: AUTH_CONFIG.idTokenIssuer,
      audience: AUTH_CONFIG.idTokenAudience
    })

    var authService = this // just aliasing to make this visible in closure
    verifier.verify(authResult.idToken, sessionStorage.getItem('po_nonce'),
      function (error, payload) {
        if (error) {
          console.log('error verifying id_token: ' + error)
        } else {
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
    // Clear access token and ID token from local storage
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('id_token')
    sessionStorage.removeItem('expires_at')
    sessionStorage.removeItem('po_nonce')
    sessionStorage.removeItem('nickname')
    sessionStorage.removeItem('job_title')
    this.userProfile = null
    this.authNotifier.emit('authChange', false)

    this.auth0.logout({
      returnTo: 'http://po-ui.jv-techex.com/home'
    })

    // navigate to the home route
    router.replace('home')
  }

  isAuthenticated () {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(sessionStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  renewToken () {
    this.auth0.authorize({
      prompt: 'none',
      nonce: this.generateNonce()
    })
  }

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
