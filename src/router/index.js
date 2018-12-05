import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Callback from '@/components/Callback'
import PO from '@/components/PO'

Vue.use(Router)

// need to re-use this function from AuthService.js
// instead of repeating here
function isAuthenticated () {
  let expiresAt = JSON.parse(sessionStorage.getItem('expires_at'))
  return new Date().getTime() < expiresAt
}

// configure routes
// mapped component will replace <router-view> tag in template
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/callback',
      name: 'Callback',
      component: Callback
    },
    {
      path: '/po',
      name: 'PurchaseOrders',
      component: PO,
      // user must be authenticated before navigating to orders
      beforeEnter: (to, from, next) => {
        if (isAuthenticated()) {
          console.log('Authenticated user, continue to orders')
          next()
        } else {
          // better to display this on UI instead
          console.log('Please login first')
          next('/home')
        }
      }
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})

export default router
