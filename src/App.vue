<template>
  <div id="app">
    <h1>根模块</h1>
    <!-- <p>姓名：{{$store.state.name}}</p>
    <p>全名：{{$store.getters.fullname}}</p>
    <p>年龄：{{$store.state.age}}</p> -->
    <p>姓名：{{name}}</p>
    <p>全名：{{fullname}}</p>
    <p>年龄：{{age}}</p>
    <button @click="asyncAdd">asyncAdd add</button>
    <button @click="syncAdd">syncAdd add</button>
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
    this.$store.dispatch('news/getlist')
  },
  methods: {
    asyncAdd() {
      this.$store.dispatch('asyncAdd')
    },
    syncAdd() {
      this.$store.commit('syncAdd')
    }
  }
}
</script>

<style>
#app {
  text-align: left;
}
</style>
