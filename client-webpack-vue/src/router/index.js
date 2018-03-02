import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/pages/HelloWorld'
import SearchIndex from '@/pages/SearchIndex'
import MediaIndex from '@/pages/MediaIndex'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/search',
      name: 'SearchIndex',
      component: SearchIndex
    },
    {
      path: '/media',
      name: 'MediaIndex',
      component: MediaIndex
    }
  ]
})
