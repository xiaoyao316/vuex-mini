# vuex-mini

**vuex简化版**

- [x] 数据响应
    - [x] 修改数据视图联动
    - [ ] 提供可选严格模式限制非mutation触发的修改
- [x] 模块化
    - [x] 支持多级子模块
    - [ ] 模块动态设置与修改
    - [ ] 命名空间可选
- [x] 辅助函数
    - [x] mapState
    - [x] mapGetters
    - [x] mapActions
    - [x] mapMutations
- [x] 其它
    - [ ] 插件
    - [ ] subscribe
    - [ ] watch


> 本项目是作为个人学习的代码，旨在以最简单的代码还原vuex的大部分常用Api。而其中未实现的部分，比如模块化的动态设置与修改（对应源码中Module模块），实际项目中真的很少用到，而代码量却还不少。至于其它的，严格模式通俗讲就是做一个开关并依此判断，插件、subscribe也都是几行代码就可以实现，watch则是借助了vue内置的方法$watch。