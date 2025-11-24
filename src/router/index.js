import { createRouter, createWebHistory } from 'vue-router'
const TripsListView = () => import('../views/TripsListView.vue')
const TripDetailView = () => import('../views/TripDetailView.vue')
const LoginView = () => import('../views/LoginView.vue')
const InviteJoinView = () => import('../views/InviteJoinView.vue')
const UserPanelView = () => import('../views/UserPanelView.vue')


const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { title: 'Entrar', public: true } },
  { path: '/', name: 'trips', component: TripsListView, meta: { title: 'Painel de Viagens', requiresAuth: true } },
  { path: '/trips/:id', name: 'trip', component: TripDetailView, meta: { title: 'Detalhes da Viagem', requiresAuth: true } },
  { path: '/convite/:code', name: 'invite', component: InviteJoinView, meta: { title: 'Convite', requiresAuth: true } },
  { path: '/usuario', name: 'user-panel', component: UserPanelView, meta: { title: 'Painel do Usuário', requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  let token = null
  if (typeof window !== 'undefined') {
    token = window.localStorage.getItem('portulano_token')
  }

  const isAuth = !!token

  if (to.name === 'login' && isAuth) {
    next({ name: 'trips' })
    return
  }

  if (to.meta?.requiresAuth && !isAuth) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = `Portulano • ${to.meta.title}`
})

export default router
