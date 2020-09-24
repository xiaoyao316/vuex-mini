let Vue;
export function install(_Vue) {
  Vue = _Vue
  // 借助Vue内置的mixin方法给所有组件都混入一个beforeCreate方法
  Vue.mixin({
    beforeCreate: function () {
      const options = this.$options
      // 组件树是由上到下解析，最开始是根组件，所以最开始可以通过option.store拿到。向下的层级，都直接从父组件上面取即可。
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
    // 缓存所有模块的action
    this._actions = Object.create(null)
    // 缓存所有模块的mutation
    this._mutations = Object.create(null)
    // 缓存所有模块的getter
    this._wrappedGetters = Object.create(null)
    // helpers中辅助函数需要用到
    this._modulesNamespaceMap = Object.create(null)
    // 注册actions、mutations, 顺带处理一下_wrappedGetters和_modulesNamespaceMap供后续使用
    installModule(this, options.state, [], options)
    // 设置state、getters
    resetStoreVM(this, options.state)
  }
  get state() {
    return this._vm._data.$$state
  }
  // 箭头函数保证指向，实际源码中是通过函数劫持实现
  dispatch = (type, payload) => {
    this._actions[type](payload)
  }
  commit = (type, payload) => {
    this._mutations[type](payload)
  }
}

function resetStoreVM (store, state) {
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

// 创建local 对象，这样就可以保证在模块内actions中所定义方法的第一个参数中解构出的dispatch、commit、state、getters值是和当前模块对应的
function makeLocalContext (store, namespace, path) {
  // 判断命名空间
  const noNamespace = namespace === ''
  
  const local = {
    // 函数劫持, 模块内触发时，拼接上命名空间，归根结底都是通过Store.dispatch触发缓存在Store._actions上的方法
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
    const localType = type.slice(splitPos)
    // 真正取值时再通过代理从store.getters上取
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