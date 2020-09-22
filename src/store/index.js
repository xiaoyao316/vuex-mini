import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from '../vuex/index'
import news from './news'

Vue.use(Vuex)

const state = {
  name: '匿名',
  age: 0
}

const getters = {
  fullname(state) {
    return state.name + 'xxxx'
  }
}

const actions = {
  getInfo: function({commit}, payload) {
    setTimeout(() => {
      commit('setInfo', payload)
    }, 1000)
  },
  asyncAdd: function({commit}) {
    setTimeout(() => {
      commit('syncAdd')
    }, 1000)
  }
}

const mutations = {
  setInfo: function(state, payload) {
    state.name = payload.name
    state.age = payload.age
  },
  syncAdd: function(state) {
    state.age += 1
  }
}

const store = new Vuex.Store({
  modules: {
    news
  },
  state,
  getters,
  actions,
  mutations
})

export default store