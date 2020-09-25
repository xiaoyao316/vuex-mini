<template>
  <div id="app">
    <h1>根模块</h1>
    <!-- <p>姓名：{{$store.state.name}}</p>
    <p>全名：{{$store.getters.fullname}}</p>
    <p>年龄：{{$store.state.age}}</p> -->
    <p>姓名：{{name}}</p>
    <p>全名：{{fullname}}</p>
    <p>年龄：{{age}}</p>
    <p>
      <button @click="asyncAdd">$store.dispatch</button>
      <button @click="syncAdd">$store.commit</button>
    </p>
    <p>
      <button @click="asyncAdd1">mapActions.dispatch</button>
      <button @click="syncAdd1">mapMutations.commit</button>
    </p>
    <hr>
    <h1>子模块</h1>
    <ul>
      <!-- <li v-for="item in $store.state.news.list" :key="item.id"> -->
      <li v-for="item in list" :key="item.id">
        <span>{{item.name}}</span>
        <span>{{item.price}}</span>
      </li>
    </ul>
    <h2>总价： {{$store.getters['news/totalPrice']}}</h2>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from './vuex/index'
export default {
  name: 'App',
  computed: {
    ...mapState({
      name: state => state.name,
      age: state => state.age,
      list: state => state.news.list
    }),
    ...mapGetters(['fullname']),
    ...mapGetters('news', ['totalPrice'])
  },
  mounted() {
    console.log(this.$store)
    this.$store.dispatch('getInfo', {
      name: '小白',
      age: 8
    })
    this.$store.dispatch('news/getlist', [
        {id: 1, name: '你不知道的JavaScript(上)', price: 69},
        {id: 2, name: '你不知道的JavaScript(中)', price: 99},
        {id: 3, name: '你不知道的JavaScript(下)', price: 89}
      ])
  },
  methods: {
    ...mapActions(['getInfo']),
    ...mapActions('news', ['getlist']),
    asyncAdd() {
      this.$store.dispatch('asyncAdd')
    },
    syncAdd() {
      this.$store.commit('syncAdd')
    },
    asyncAdd1 () {
      this.getInfo({
        name: '大白',
        age: 16
      })
    },
    syncAdd1 () {
      this.getlist([
        {id: 1, name: '你不知道的JavaScript(上)', price: 69},
        {id: 2, name: '你不知道的JavaScript(中)', price: 99},
        {id: 3, name: '你不知道的JavaScript(下)', price: 89},
        {id: 4, name: 'javascript高级程序设计', price: 128}
      ])
    }
  }
}
</script>

<style>
#app {
  text-align: left;
}
</style>
