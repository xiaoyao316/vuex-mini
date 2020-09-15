import { forEachValue } from './util'
import ModuleCollection from './module'

let Vue;
export function install(_Vue) {
  Vue = _Vue
  Vue.mixin({
    beforeCreate: function () {
      const options = this.$options
      if (options.store) {
        this.$store = options.store
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }
    }
  })
}

export class Store {
  constructor(options = {}) {
    this._raw = options
    this.getters = {};
    this.actions = options.actions;
    this.mutations = options.mutations;
    this._modules = new ModuleCollection(options, this, Vue)
    this._vm = new Vue({
      data: {
        $$state: options.state
      }
    })
    defineGetters(this)
  }
  get state() {
    return this._vm._data.$$state
  }
  dispatch = (type, payload) => {
    let splitArr = type.split('/')
    if (splitArr.length === 1) {
      this.actions[type](this, payload)
    } else {
      // this.actions[type](this, payload)
      debugger
    }
  }
  commit = (type, payload) => {
    this.mutations[type](this.state, payload)
  }
}
function defineGetters (store) {
  forEachValue(store._raw.getters, (fn, key) => {
    Object.defineProperty(store.getters, key, {
      get: () => fn(store.state)
    })
  })
}