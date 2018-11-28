var poApiBaseUrl = 'http://po-api.jv-techex.com:8080/api/v1'

export default {
  async getOrders () {
    console.log('access_token: ' + localStorage.getItem('access_token'))
    const res = await fetch(poApiBaseUrl + '/pos', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      }
    })
    return res.json()
  },
  async getOrder (id) {
    console.log('access_token: ' + localStorage.getItem('access_token'))
    const res = await fetch(poApiBaseUrl + '/po/' + id, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      }
    })
    return res.data
  },
  async createOrder (order) {
    const res = await fetch(poApiBaseUrl + '/po', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      },
      body: JSON.stringify(order)
    })
    return res.data
  },
  async updateOrder (id, order) {
    const res = await fetch(poApiBaseUrl + '/po/' + id, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      },
      body: JSON.stringify(order)
    })
    return res.data
  },
  async deleteOrder (id) {
    const res = await fetch(poApiBaseUrl + '/po/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      }
    })
    return res.data
  }
}
