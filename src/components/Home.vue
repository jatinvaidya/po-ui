<template>
  <div>
    <h1>Purchase Order Management</h1>
    <h4 v-if="authenticated">
        <br><br>
        <div>
          Welcome, <b-badge variant="primary"> {{ nickname() }} </b-badge>!<br><br>
          As a <b-badge variant="success"> {{ title() }} </b-badge>,
          you can <b-badge variant="dark"> {{ privileges() }} </b-badge><b-link to='po'> Orders</b-link> 
        </div>
    </h4>
    <h4 v-if="!authenticated">
      You are not logged in! Please <a @click="auth.login()">Log In</a> to continue.
    </h4>
  </div>
</template>

<script>
  export default {
    name: 'home',
    props: ['auth', 'authenticated'],
    data () {
      return {
      }
    },
    methods: {
      privileges () {
        var title = sessionStorage.getItem('job_title')
        var priv = ''
        switch (title) {
          case 'clerk':
            priv = 'List'
            break
          case 'supervisor':
            priv = 'List & Update'
            break
          case 'executive':
            priv = 'List, Update & Delete'
            break
        }
        return priv
      },
      nickname () {
        return sessionStorage.getItem('nickname')
      },
      title () {
        return sessionStorage.getItem('job_title')
      }
    }
  }
</script>

<style>
  a {
    cursor: pointer;
  }
</style>

