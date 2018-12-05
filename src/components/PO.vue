<!-- 
  This is component corresponding to business functionality (CRUD orders)
  It calls out o backend CRUD API (po-api) using rest-client.js service.
  It also does access control at UI layer by hiding DOM controls corresponding to 
  functionality the user is not authorized to, based on their job title.
-->
<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Purchase Orders Management</h1><br><br>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item ID</th>
              <th>Quantity</th>
              <th>Comment</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.itemId }}</td>
              <td>{{ order.quantity }}</td>
              <td>{{ order.comment }}</td>
              <td class="text-right">
                <b-button v-if="isSupervisor() || isExecutive()" @click.prevent="updateOrderPrep(order)" size="sm" variant="warning">Update</b-button>
                <b-button v-if="isExecutive()" @click.prevent="deleteOrder(order.id)" size="sm" variant="danger">Delete</b-button>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
      <b-col lg="3">
        <b-card v-if="isSupervisor() || isExecutive()" :title="(model.id ? 'Update Order' : 'Create Order')">
          <br>
          <form @submit.prevent="saveOrder"> 
            <b-form-group label="ID" v-if="model.id">
              <b-form-input readonly type="text" v-model="model.id"></b-form-input>
            </b-form-group>
            <b-form-group label="Item ID">
              <b-form-select :options="itemIdOptions" v-model="model.itemId"></b-form-select>
            </b-form-group>
            <b-form-group label="Quantity">
              <b-form-input type="text" v-model="model.quantity"></b-form-input>
            </b-form-group>
            <b-form-group label="Comment">
              <b-form-textarea rows="4" v-model="model.comment"></b-form-textarea>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Order</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import restClient from '@/services/rest-client.js'
export default {
  data () {
    return {
      loading: false,
      orders: [],
      model: {},
      itemIdOptions: [
        { value: 'Canister Pump Filter', text: 'Canister Pump Filter' },
        { value: 'Trickle Filter', text: 'Trickle Filter' },
        { value: 'Under Gravel Filter', text: 'Under Gravel Filter' },
        { value: 'Heavy Duty Pump', text: 'Heavy Duty Pump' }
      ]
    }
  },
  async created () {
    await this.refreshOrders()
  },
  methods: {
    async refreshOrders () {
      this.loading = true
      this.orders = await restClient.getOrders()
      this.loading = false
    },
    async updateOrderPrep (post) {
      this.model = Object.assign({}, post)
    },
    async saveOrder () {
      if (this.model.id) {
        await restClient.updateOrder(this.model.id, this.model)
      } else {
        await restClient.createOrder(this.model)
      }
      this.model = {}
      await this.refreshOrders()
    },
    async deleteOrder (id) {
      if (confirm('Confirm Delete Order?')) {
        if (this.model.id === id) {
          this.model = {}
        }
        await restClient.deleteOrder(id)
        await this.refreshOrders()
      }
    },
    isSupervisor () {
      return sessionStorage.getItem('job_title') === 'supervisor'
    },
    isExecutive () {
      return sessionStorage.getItem('job_title') === 'executive'
    },
    isClerk () {
      return sessionStorage.getItem('job_title') === 'clerk'
    }
  }
}
</script>
