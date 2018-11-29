import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Callback from '@/components/Callback'
import PO from '@/components/PO'

Vue.use(Router)

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
      component: PO
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})

export default router
