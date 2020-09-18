// import Module from './module'
import { forEachValue } from './util'
let Vue;

/*module收集类*/
export default class ModuleCollection {
  constructor (rawRootModule, store, vue) {
    Vue = vue
    this._store = store
    this.register([], rawRootModule)
  }

  /*获取父级module*/
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  /*注册*/
  register (path, rawModule) {
    /*新建一个Module对象*/
    const newModule = new Module(rawModule)
    if (path.length === 0) {
      /*path为空数组的代表跟节点*/
      this.root = newModule
    } else {
      /*获取父级module*/
      const parent = this.get(path.slice(0, -1))
      /*在父module中插入一个子module*/
      parent.addChild(path[path.length - 1], newModule)
      /*设置子模块响应式state*/
      let moduleName = path[path.length - 1]
      Vue.set(parent.state, moduleName, newModule.state)
      /*computed也设置一下*/
      forEachValue(newModule._rawModule.getters, (fn, key) => {
        Object.defineProperty(this._store.getters, `${moduleName}/${key}`, {
          get: () => fn(newModule.state)
        })
      })
      let store = this._store
      /*再设置actions 和 mutations*/
      forEachValue(newModule._rawModule.actions, (fn, key) => {
        this._store.actions[`${moduleName}/${key}`] = newModule.actions[key] = function (moduleName, type, payload) {
          console.log(store)
          let context = {
            dispatch: store.actions[`${moduleName}/${type}`],
            commit: store.mutations[`${moduleName}/${type}`],
            state: newModule.state
          }
          debugger
          return fn(context, payload)
        }
      })
      forEachValue(newModule._rawModule.mutations, (fn, key) => {
        this._store.mutations[`${moduleName}/${key}`] = newModule.mutations[key] = function (moduleName, type, payload) {
          return fn(newModule.state, payload)
        }
      })
    }

    // register nested modules
    /*递归注册module*/
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule)
      })
    }
  }
}

/*Module构造类*/
class Module {
  constructor (rawModule) {
    /* 保存原始module */
    this._rawModule = rawModule
    this.state = rawModule.state || {}
    this.actions = rawModule.actions;
    this.mutations = rawModule.mutations;
    this._children = Object.create(null)
  }

  /*插入一个子module，存入_children中*/
  addChild (key, module) {
    this._children[key] = module
  }

  /*根据key获取子module*/
  getChild (key) {
    return this._children[key]
  }

  /* 遍历child  */
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }

  /* 遍历getter */
  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }

  /* 遍历action */
  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }

  /* 遍历matation */
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}
