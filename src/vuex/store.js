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

    // const { dispatch, commit } = this
    // this.dispatch = function boundDispatch (type, payload) {
    //   return dispatch.call(store, type, payload)
    // }
    // this.commit = function boundCommit (type, payload, options) {
    //   return commit.call(store, type, payload, options)
    // }
  }
  get state() {
    return this._vm._data.$$state
  }
  dispatch = (type, payload) => {
    this.actions[type](this, payload)
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
function getModule (modules, splitArr) {
  let firstExp = splitArr.shift()
  let subModule = null
  let rootModule = modules.root
  while(!subModule) {
    if (firstExp in rootModule._children) {
      if (splitArr.length === 0) {
        subModule = rootModule._children[firstExp]
      } else {
        firstExp = splitArr.shift()
        rootModule = rootModule._children[firstExp]
      }
    }
  }
  return subModule
}