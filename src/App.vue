<template>
  <div id="app">
    <h1>根模块</h1>
    <p>姓名：{{$store.state.name}}</p>
    <p>全名：{{$store.getters.fullname}}</p>
    <p>年龄：{{$store.state.age}}</p>
    <button @click="asyncAdd">asyncAdd add</button>
    <button @click="syncAdd">syncAdd add</button>
    <hr>
    <h1>子模块</h1>
    <ul>
      <li v-for="item in $store.state.news.list" :key="item.id">
        <span>{{item.name}}</span>
        <span>{{item.price}}</span>
      </li>
    </ul>
    <h2>总价： {{0}}</h2>
  </div>
</template>

<script>
export default {
  name: 'App',
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
