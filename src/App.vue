<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import NavBar from './components/NavBar.vue'
import RegisterPage from './pages/RegisterPage.vue'
import LoginPage from './pages/LoginPage.vue'
import UserPanel from './pages/UserPanel.vue'
import JoinTeamPage from './pages/JoinTeamPage.vue'
import auth from './utils/auth.js'
import fullpage from 'fullpage.js'

const currentRoute = ref('home')
const isLoggedIn = ref(false)
let fpInstance = null
const targetSection = ref(0) // 0表示不滚动，1表示第一个section，2表示第二个section

const checkLoginStatus = () => {
  isLoggedIn.value = auth.isLoggedIn()
}

const updateRouteFromHash = () => {
  const hash = window.location.hash.slice(1)
  if (hash === 'register' || hash === 'login' || hash === 'user' || hash === 'jointeam') {
    currentRoute.value = hash
    targetSection.value = 0
  } else if (hash === 'about') {
    // 关于链接：先回到首页，然后滚动到第二个部分
    currentRoute.value = 'home'
    targetSection.value = 2  // 第二个section
  } else {
    // 首页或其他hash
    currentRoute.value = 'home'
    
    // 如果是从其他页面回到首页，确保滚动到第一个section
    if (hash === '') {
      targetSection.value = 1  // 第一个section
    } else {
      targetSection.value = 0  // 不滚动
    }
  }
}

const navigateTo = (route) => {
  if (route === 'home') {
    window.location.hash = ''
  } else {
    window.location.hash = `#${route}`
  }
  // updateRouteFromHash() will be called by hashchange event
}

const initFullpage = () => {
  if (fpInstance) {
    fpInstance.destroy('all')
  }

  fpInstance = new fullpage('#fullpage', {
    autoScrolling: true,
    navigation: true,
    scrollingSpeed: 700,
    paddingTop: '60px',
    css3: true,
    fitToSection: false,
    fixedElements: '.navbar',
    afterLoad: function(origin, destination, direction) {
      // fullpage.js加载完成后，重置targetSection
      if (targetSection.value > 0 && destination.index + 1 === targetSection.value) {
        targetSection.value = 0
      }
    }
  })
  
  // 初始化后，如果有目标section，滚动到该section
  if (targetSection.value > 0) {
    setTimeout(() => {
      if (fpInstance && targetSection.value > 0) {
        fpInstance.moveTo(targetSection.value)
      }
    }, 300)
  }
}

onMounted(() => {
  updateRouteFromHash()
  checkLoginStatus()

  window.addEventListener('hashchange', updateRouteFromHash)
  window.addEventListener('storage', checkLoginStatus)

  if (currentRoute.value === 'home') {
    nextTick(() => {
      initFullpage()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('hashchange', updateRouteFromHash)
  window.removeEventListener('storage', checkLoginStatus)

  if (fpInstance) {
    fpInstance.destroy('all')
  }
})

watch(currentRoute, (newRoute) => {
  checkLoginStatus()

  if (newRoute === 'home') {
    nextTick(() => {
      initFullpage()
    })
  } else {
    if (fpInstance) {
      fpInstance.destroy('all')
      fpInstance = null
    }
  }
})
</script>

<template>
  <div class="app-container">

    <NavBar />

    <Transition name="fade" mode="out-in">
      <div v-if="currentRoute === 'home'" key="home">

        <div id="fullpage">

          <!-- 第一屏 -->
          <div class="section">

            <div class="video-background">
              <video autoplay muted loop playsinline>
                <source src="/Amiya.mp4" type="video/mp4">
              </video>
              <div class="video-overlay"></div>
            </div>

            <div class="content hero-content" style="white-space: pre-wrap;">

              <h1 class="main-title">E426 Overwatch</h1>

              <p class="subtitle" style="padding-left: 10px;">
                基于Vue.js开发的轻量级守望先锋®团队管理平台<br/><br/>
              </p>

              <br>

              <div v-if="!isLoggedIn" class="button-container">
                <button class="register-button" @click.prevent="navigateTo('register')">注册</button>
                <button class="login-button" @click.prevent="navigateTo('login')">登录</button>
              </div>

              <div v-else class="welcome-message">
                <button class="login-button" @click.prevent="navigateTo('user')">用户面板</button>
              </div>

            </div>
          </div>

          <!-- 第二屏 -->
          <div class="section">

            <div class="video-background">
              <video autoplay muted loop playsinline>
                <source src="/Amiya2.mp4" type="video/mp4">
              </video>
              <div class="video-overlay"></div>
            </div>

            <div class="content hero-content1" style="white-space: pre-wrap;">
              <h1 class="main-title1">关于我们</h1>
              <p class="subtitle1" style="padding-left: 10px;">
                E426 Group. 一个名不见经传的小团队，全然只凭兴趣作做。<br/><br/>
                “那一天所看到的光景，想要呐喊却无法发出声音的绝望。<br/>
                希望能把这些，永远藏在记忆的最深处......”<br/>
                愿你如阿米娅，心有所向，素履以往。
              </p>
            </div>
          </div>

          <!-- 第三屏 -->
          <div class="section blank-page">
            <div class="content">
              <h1 class="main-title">第三屏</h1>
              <p class="subtitle" style="padding-left: 10px;">
                这里是你要的第二个空白页面，可以放数据图表
              </p>
            </div>
          </div>

          <!-- 第四屏 -->
          <div class="section blank-page">
            <div class="content">
              <h1 class="main-title">第四屏</h1>
              <p class="subtitle" style="padding-left: 10px; ">
                这里是你要的第三个空白页面，可以放页脚或联系方式
              </p>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <Transition name="fade" mode="out-in">
      <RegisterPage v-if="currentRoute === 'register'" />
    </Transition>

    <Transition name="fade" mode="out-in">
      <LoginPage v-if="currentRoute === 'login'" />
    </Transition>

    <Transition name="fade" mode="out-in">
      <UserPanel v-if="currentRoute === 'user'" />
    </Transition>

    <Transition name="fade" mode="out-in">
      <JoinTeamPage v-if="currentRoute === 'jointeam'" />
    </Transition>

  </div>
</template>

<style scoped>

@font-face {
  font-family: 'SmileySans Oblique';
  src: url('/SmileySans-Oblique.ttf') format('truetype');
}

.app-container{
  width:100%;
  height:100vh;
  position:relative;
}

/* section */

.section{
  height:100vh;
  overflow:hidden;
  position:relative;
}

/* 背景视频 */

.video-background{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  z-index:-1;
}

.video-background video{
  width:100%;
  height:100%;
  object-fit:cover;
}

.video-overlay{
  position:absolute;
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.2);
}

/* 内容 */

.content{
  height:100%;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:flex-start;
  padding-left:180px;
  box-sizing:border-box;
  color:white;
  z-index:1001;
  position:relative;
}

/* 第一屏特殊布局 */

.hero-content{
  justify-content:flex-start;
  padding-top:320px;
}

.hero-content1{
  justify-content:flex-start;
  padding-top:80px;
}

/* 后三屏背景 */

.blank-page{
  background:#1a1a1a;
}

/* 标题 */

.main-title{
  font-family:"Fugaz One",sans-serif;
  font-size:4rem;
  margin:0;
  text-shadow:2px 2px 8px rgba(0,0,0,0.7);
}

.main-title1{
  font-family:'SmileySans Oblique',sans-serif;
  font-size:5rem;
  margin:0;
  text-shadow:2px 2px 8px rgba(0,0,0,0.7);
  color:#ffffff;
}

.subtitle{
  font-family:'SmileySans Oblique',sans-serif;
  font-size:1.2rem;
  color:rgba(255,255,255,0.8);
  margin-top:10px;
  text-shadow:2px 2px 8px rgba(0,0,0,0.7);
}

.subtitle1{
  font-family:'SmileySans Oblique',sans-serif;
  font-size:1.8rem;
  color:rgba(255,255,255,0.9);
  margin-top:15px;
  text-shadow:2px 2px 8px rgba(0,0,0,0.7);
  font-weight:bold;
}

/* 按钮 */

.button-container{
  display:flex;
  gap:20px;
  margin-top:20px;
}

.register-button,
.login-button{
  background:transparent;
  border:2px solid white;
  color:white;
  padding:10px 24px;
  font-family:'SmileySans Oblique',sans-serif;
  border-radius:64px;
  cursor:pointer;
  transition:0.3s;
}

.register-button:hover,
.login-button:hover{
  background:rgba(255,255,255,0.1);
}

/* 登录提示 */

.welcome-message{
  margin-top:20px;
}

.welcome-message p{
  font-family:'SmileySans Oblique',sans-serif;
  font-size:1.2rem;
}

/* 过渡动画 */

.fade-enter-active,
.fade-leave-active{
  transition:opacity .5s;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
}

</style>