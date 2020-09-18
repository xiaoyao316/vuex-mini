const state = {
  list: [
    {id: 1, name: '你不知道的JavaScript(上)', price: 69},
    {id: 2, name: '你不知道的JavaScript(中)', price: 99},
    {id: 3, name: '你不知道的JavaScript(下)', price: 89}
  ]
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
    debugger
    setTimeout(() => {
      commit('setList', [
        {id: 1, name: '你不知道的JavaScript(上)', price: 69},
        {id: 2, name: '你不知道的JavaScript(中)', price: 99},
        {id: 3, name: '你不知道的JavaScript(下)', price: 89}
      ])
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