/**
 * 为了便于理解，对mapState进行了逻辑简化，只保留传入对象的使用方式
 */
export const mapState = function mapStateWrap (states) {
  const res = {}
  forEachValue(states, (fn, key) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      return fn.call(this, state, getters)
    }
  })
  return res
}

export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  normalizeMap(getters).forEach(({ key, val }) => {
    val = namespace + val
    res[key] = function mappedGetter () {
      const module = this.$store._modulesNamespaceMap[namespace]
      return this.$store.getters[val]
    }
  })
  return res
})

export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = this.$store._modulesNamespaceMap[namespace]
        dispatch = module.context.dispatch
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation (...args) {
      let commit = this.$store.commit
      if (namespace) {
        const module = this.$store._modulesNamespaceMap[namespace]
        commit = module.context.commit
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

/* 将map转化成[{key, val},{key, val},{key, val}...]的数据结构 */
function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      /* 兼容namespace不传的情况 */
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      /* namespace最后一位补上'/' */
      namespace += '/'
    }
    return fn(namespace, map)
  }
}

function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}