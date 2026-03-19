import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import UserPanel from '../pages/UserPanel.vue'
import JoinTeamPage from '../pages/JoinTeamPage.vue'
import CreatePostPage from '../pages/CreatePostPage.vue'
import auth from '../utils/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresFullpage: true }
  },
  {
    path: '/about',
    name: 'About',
    component: HomePage,
    meta: { requiresFullpage: true, targetSection: 2 }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/user',
    name: 'User',
    component: UserPanel,
    meta: { requiresAuth: true }
  },
  {
    path: '/jointeam',
    name: 'JoinTeam',
    component: JoinTeamPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/createpost',
    name: 'CreatePost',
    component: CreatePostPage,
    meta: { requiresAuth: true }
  },
  // 重定向旧hash路由到新路由
  {
    path: '/#:hash',
    redirect: to => {
      const hash = to.params.hash
      switch(hash) {
        case 'register': return '/register'
        case 'login': return '/login'
        case 'user': return '/user'
        case 'jointeam': return '/jointeam'
        case 'createpost': return '/createpost'
        case 'about': return '/about'
        default: return '/'
      }
    }
  },
  // 404页面重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.meta.targetSection) {
      // 处理fullpage.js滚动到特定section的逻辑
      return { selector: `#section-${to.meta.targetSection}`, behavior: 'smooth' }
    }
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 检查认证
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 使用auth工具检查登录状态
    if (!auth.isLoggedIn()) {
      next('/login')
      return
    }
  }
  next()
})

export default router