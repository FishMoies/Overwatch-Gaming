import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import UserPanel from '../pages/UserPanel.vue'
import JoinTeamPage from '../pages/JoinTeamPage.vue'
import CreatePostPage from '../pages/CreatePostPage.vue'
import PostDetailPage from '../pages/PostDetailPage.vue'
import SearchPage from '../pages/SearchPage.vue'
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
    path: '/user/:uid',
    name: 'UserProfile',
    component: UserPanel,
    meta: { requiresAuth: true }
  },
  {
    path: '/user',
    name: 'User',
    redirect: to => {
      const currentUser = auth.getCurrentUser();
      if (currentUser) {
        return { name: 'UserProfile', params: { uid: currentUser.id } };
      } else {
        return '/login';
      }
    }
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
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetailPage
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage
  },
  // 重定向旧hash路由到新路由
  {
    path: '/#:hash',
    redirect: to => {
      const hash = to.params.hash
      switch(hash) {
        case 'register': return '/register'
        case 'login': return '/login'
        case 'user':
          const currentUser = auth.getCurrentUser();
          if (currentUser) {
            return { name: 'UserProfile', params: { uid: currentUser.id } };
          } else {
            return '/login';
          }
        case 'jointeam': return '/jointeam'
        case 'createpost': return '/createpost'
        case 'about': return '/about'
        case 'search': return '/search'
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