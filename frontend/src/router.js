import { createRouter, createWebHistory } from 'vue-router'
import username from './components/username.vue'
import voting from './components/voting.vue'

const routes = [
  { path: '/', component: username },
  { path: '/voting', component: voting },
  {path: '/:pathMatch(.*)*', component: () => import('./components/notfound.vue') } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
