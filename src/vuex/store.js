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
    this._actions = Object.create(null)
    this._mutations = Object.create(null)
    this._wrappedGetters = Object.create(null)
    this._modulesNamespaceMap = Object.create(null)  // helpers中辅助函数需要用到

    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload) {
      return commit.call(store, type, payload)
    }
    
    installModule(this, options.state, [], options)
    resetStoreVM(this, options.state)
  }
  get state() {
    return this._vm._data.$$state
  }
  dispatch (type, payload) {
    this._actions[type](payload)
  }
  commit (type, payload) {
    this._mutations[type](payload)
  }
}

function resetStoreVM (store, state, hot) {
  store.getters = {}
  const computed = {}

  forEachValue(store._wrappedGetters, (fn, key) => {
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      enumerable: true,
      get: () => store._vm[key]
    })
  })

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}

function installModule (store, rootState, path, module) {
  const isRoot = !path.length
  const namespace = getNamespace(path)

  if (!isRoot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    Vue.set(parentState, moduleName, module.state)
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  forEachValue(module.actions || {}, (handler, type) => {
    const namespacedType = namespace + type
    store._actions[namespacedType] = function wrappedMutationHandler (payload) {
      handler.call(store, {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store.getters,
        rootState: store.state
      }, payload)
    }
  })

  forEachValue(module.mutations || {}, (handler, type) => {
    const namespacedType = namespace + type
    store._mutations[namespacedType] = function wrappedMutationHandler (payload) {
      handler.call(store, local.state, payload)
    }
  })

  forEachValue(module.getters || {}, (handler, type) => {
    const namespacedType = namespace + type
    store._wrappedGetters[namespacedType] = function wrappedGetter (store) {
      return handler(
        local.state,
        local.getters,
        store.state,
        store.getters
      )
    }
  })

  if (namespace) {
    store._modulesNamespaceMap[namespace] = module
  }

  forEachValue(module.modules || {}, (child, key) => {
    installModule(store, rootState, path.concat(key), child)
  })
}

function makeLocalContext (store, namespace, path) {
  /* 判断是否有名字空间 */
  const noNamespace = namespace === ''

  const local = {
    dispatch: noNamespace ? store.dispatch : (type, payload) => {
      if (namespace) {
        type = namespace + type
      }
      return store.dispatch(type, payload)
    },
    commit: noNamespace ? store.commit : (type, payload) => {
      if (namespace) {
        type = namespace + type
      }
      store.commit(type, payload)
    }
  }

  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}

function makeLocalGetters (store, namespace) {
  const gettersProxy = {}

  const splitPos = namespace.length
  Object.keys(store.getters).forEach(type => {
    // skip if the target getter is not match this namespace
    if (type.slice(0, splitPos) !== namespace) return

    // extract local getter type
    const localType = type.slice(splitPos)

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    Object.defineProperty(gettersProxy, localType, {
      enumerable: true,
      get: () => store.getters[type]
    })
  })

  return gettersProxy
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state
}

function getNamespace(path) {
  if (path.length === 0) return ''
  return path.join('/') + '/'
}

function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}