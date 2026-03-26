<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import auth from '../utils/auth.js'
import fullpage from 'fullpage.js'

const router = useRouter()
const isLoggedIn = ref(false)
let fpInstance = null

// 检查登录状态
const checkLoginStatus = () => {
  isLoggedIn.value = auth.isLoggedIn()
}

// 导航函数
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// 初始化fullpage.js
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
      // fullpage.js加载完成后的逻辑
    }
  })
}

onMounted(() => {
  checkLoginStatus()
  window.addEventListener('storage', checkLoginStatus)
  
  nextTick(() => {
    initFullpage()
  })
})

onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus)
  
  if (fpInstance) {
    fpInstance.destroy('all')
    fpInstance = null
  }
})
</script>

<template>
  <div v-if="true" key="home">
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
            <button class="register-button" @click.prevent="navigateTo('Register')">注册</button>
            <button class="login-button" @click.prevent="navigateTo('Login')">登录</button>
          </div>

          <div v-else class="welcome-message">
            <button class="login-button" @click.prevent="navigateTo('User')">用户面板</button>
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
            "那一天所看到的光景，想要呐喊却无法发出声音的绝望。<br/>
            希望能把这些，永远藏在记忆的最深处......"<br/>
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

      <!-- 第五屏 - 角色职责展示 -->
      <div class="section roles-page">
        <div class="content roles-content">
          <h1 class="main-title1">守望先锋® 角色职责</h1>
          <p class="subtitle1" style="padding-left: 10px; margin-bottom: 40px;">
            了解游戏中的三种核心职责，组建完美团队
          </p>
          
          <div class="roles-container">
            <div class="role-card">
              <div class="role-icon">
                <img src="/96px-职责：输出_图标.webp" alt="输出角色">
              </div>
              <h3 class="role-title">输出 (Damage)</h3>
              <p class="role-description">
                高伤害输出角色，负责消灭敌方英雄。<br>
                拥有灵活的移动能力和强大的攻击技能。
              </p>
            </div>
            
            <div class="role-card">
              <div class="role-icon">
                <img src="/96px-职责：支援_图标.webp" alt="支援角色">
              </div>
              <h3 class="role-title">支援 (Support)</h3>
              <p class="role-description">
                治疗和辅助队友，提供生存保障。<br>
                拥有控制技能和团队增益效果。
              </p>
            </div>
            
            <div class="role-card">
              <div class="role-icon">
                <img src="/96px-职责：重装_图标.webp" alt="重装角色">
              </div>
              <h3 class="role-title">重装 (Tank)</h3>
              <p class="role-description">
                吸收伤害，保护队友，控制战场。<br>
                拥有高生命值和强大的防御能力。
              </p>
            </div>
          </div>
          
          <p class="role-tip" style="margin-top: 50px; font-size: 1.2rem; color: rgba(255,255,255,0.7);">
            在E426平台，你可以根据角色职责寻找合适的队友，组建平衡的团队！
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* 第五屏 - 角色职责页面 */
.roles-page {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.roles-content {
  align-items: center;
  text-align: center;
  padding-left: 0;
}

.roles-container {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.role-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  width: 280px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.role-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.role-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  padding: 20px;
}

.role-icon img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.role-title {
  font-family: 'SmileySans Oblique', sans-serif;
  font-size: 1.8rem;
  color: #ffffff;
  margin: 0 0 15px 0;
}

.role-description {
  font-family: 'SmileySans Oblique', sans-serif;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.role-tip {
  font-family: 'SmileySans Oblique', sans-serif;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

/* 登录提示 */
.welcome-message{
  margin-top:20px;
}

.welcome-message p{
  font-family:'SmileySans Oblique',sans-serif;
  font-size:1.2rem;
}
</style>