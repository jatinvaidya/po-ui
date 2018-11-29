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
    localStorage.setItem('po-nonce', nonce)
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
    this.auth0.parseHash({nonce: localStorage.getItem('po-nonce')}, (err, authResult) => {
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
    verifier.verify(authResult.idToken, localStorage.getItem('po-nonce'),
      function (error, payload) {
        if (error) {
          console.log('error verifying id_token: ' + error)
        } else {
          console.log('success verifying id_token: ' + JSON.stringify(payload))
          localStorage.setItem('access_token', authResult.accessToken)
          localStorage.setItem('id_token', authResult.idToken)
          localStorage.setItem('expires_at', expiresAt)
          localStorage.setItem('job_title', payload['http://jv-techex.com/title'])
          authService.authNotifier.emit('authChange', { authenticated: true })
          authService.scheduleRenewal()
        }
      })
  }

  logout () {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('po-nonce')
    this.userProfile = null
    this.authNotifier.emit('authChange', false)
    // navigate to the home route
    router.replace('home')
  }

  isAuthenticated () {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  renewToken () {
    this.auth0.authorize({
      prompt: 'none',
      nonce: this.generateNonce()
    })
  }

  scheduleRenewal () {
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'))
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
