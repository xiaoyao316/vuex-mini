const state = {
  list: []
}

const getters = {
  totalPrice(state) {
    return state.list.reduce((sum, next) => {
      return sum + next.price * 1
    }, 0)
  }
}

const actions = {
  getlist: function({commit}, payload) {
    setTimeout(() => {
      commit('setList', payload)
    }, 1000)
  }
}

const mutations = {
  setList: function(state, payload) {
    state.list = payload
  }
}

const news = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

export default news