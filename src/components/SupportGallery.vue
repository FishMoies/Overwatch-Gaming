<template>
  <div class="support-gallery">
    <div class="container">
      <!-- 左侧角色插图区域 -->
      <div class="character-section">
        <img src="/Nsc/ow_icon.png" alt="守望先锋标志" class="logo-bg">
        <img src="/Nsc/hn.png" alt="左侧辅助角色" class="char-left">
        <img src="/Nsc/ylr.png" alt="右侧辅助角色" class="char-right">
      </div>

      <!-- 右侧信息区域 -->
      <div class="info-section">
        <div class="english-title">Supports</div>
        <div class="cn-title">辅助</div>
        <div class="desc-text">
          集治疗与增益于一体的角色<br>
          负责对友方的保护与强化
        </div>

        <button class="carousel-btn prev" @click="prevCard" aria-label="上一个英雄">‹</button>
        
        <!-- 三卡片轮播图 -->
        <div 
          class="carousel-container"
          @mouseenter="stopAutoPlay"
          @mouseleave="startAutoPlay"
        >
          <div class="carousel-track">
            <div
              v-for="item in displayHeroes"
              :key="item.hero.name"
              class="carousel-card"
              :class="{ 'active-card': item.visualDistance === 0 }"
              :style="getCardStyle(item)"
              @click="selectCard(item.realIndex)"
            >
              <div class="carousel-img-wrapper">
                <img
                  :src="getHeroImage(item.hero)"
                  :alt="item.hero.name"
                  :title="item.hero.name"
                  class="carousel-img"
                  @error="handleImageError($event, item.hero)"
                  loading="lazy"
                />
              </div>
              <div class="carousel-name">{{ item.hero.name }}</div>
            </div>
          </div>
          
          <!-- 导航按钮 -->
          
          

        </div>
        <button class="carousel-btn next" @click="nextCard" aria-label="下一个英雄">›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 英雄数据
const supportHeroes = [
  { name: "飞天猫", imageIndex: 1 },
  { name: "瑞稀", imageIndex: 2 },
  { name: "无漾", imageIndex: 3 },
  { name: "安娜", imageIndex: 4 },
  { name: "朱诺", imageIndex: 5 },
  { name: "伊拉锐", imageIndex: 6 },
  { name: "雾子", imageIndex: 7 },
  { name: "莫伊拉", imageIndex: 8 },
  { name: "生命之梭", imageIndex: 9 },
  { name: "天使", imageIndex: 10 },
  { name: "卢西奥", imageIndex: 11 },
  { name: "禅雅塔", imageIndex: 12 },
  { name: "布丽吉塔", imageIndex: 13 },
  { name: "巴蒂斯特", imageIndex: 14 }
]

const totalHeroes = supportHeroes.length
const currentIndex = ref(0)        // 当前选中的英雄索引
const isTransitioning = ref(false)  // 防止快速连续点击
let autoPlayInterval = null

// 计算要显示的3个卡片（当前索引的前一个、当前、后一个，实现无限循环）
const displayHeroes = computed(() => {
  const indices = []
  const offsets = [-1, 0, 1]   // 左、中、右三个位置
  
  for (const offset of offsets) {
    let idx = currentIndex.value + offset
    // 处理边界循环
    if (idx < 0) idx = totalHeroes + idx
    if (idx >= totalHeroes) idx = idx - totalHeroes
    
    indices.push({
      hero: supportHeroes[idx],
      visualDistance: Math.abs(offset), // 0:中间, 1:两侧
      realIndex: idx
    })
  }
  return indices
})

// 根据视觉距离返回卡片样式（中间最大最清晰，两侧变淡缩小模糊）
function getCardStyle(item) {
  const isCenter = item.visualDistance === 0
  
  return {
    opacity: isCenter ? 1 : 0.55,
    transform: isCenter ? 'scale(1)' : 'scale(0.82)',
    filter: isCenter ? 'blur(0px)' : 'blur(2px)',
    zIndex: isCenter ? 30 : 10,
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
}

// 构建图片路径
function getHeroImage(hero) {
  const fileName = `0w+ (${hero.imageIndex}).png`
  return `/Nsc/${encodeURI(fileName)}`
}

// 图片加载失败时生成渐变占位图
function generateFallback(name) {
  const palettes = [
    ["#4A90E2","#6C5CE7"], ["#FF9A8B","#FF6A88"], ["#43E97B","#38F9D7"],
    ["#F093FB","#F5576C"], ["#FA709A","#FEE140"], ["#30CFD0","#330867"],
    ["#A18CD1","#FBC2EB"], ["#FFB88C","#DE6262"], ["#5B86E5","#36D1DC"],
    ["#FDC830","#F37335"], ["#6A11CB","#2575FC"], ["#11998e","#38ef7d"],
    ["#DD5E89","#F7BB97"], ["#1F1C2C","#928DAB"]
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
  }
  const [start, end] = palettes[Math.abs(hash) % palettes.length]
  const firstChar = name.charAt(0)
  const shortName = name.length > 5 ? name.substring(0,5) : name
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 1000">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${start}"/><stop offset="100%" stop-color="${end}"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="340" cy="450" r="200" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,240,0.5)" stroke-width="8"/>
    <text x="340" y="580" font-size="220" text-anchor="middle" fill="white" font-weight="bold" stroke="#0004" stroke-width="6" paint-order="stroke">${firstChar}</text>
    <text x="340" y="820" font-size="52" text-anchor="middle" fill="white" opacity="0.9">${shortName}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function handleImageError(event, hero) {
  event.target.src = generateFallback(hero.name)
  event.target.classList.add('error-load')
}

// 切换卡片
function selectCard(index) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  
  // 边界保护
  let newIndex = index
  if (newIndex < 0) newIndex = totalHeroes - 1
  if (newIndex >= totalHeroes) newIndex = 0
  
  currentIndex.value = newIndex
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 400) // 与 transition 时长匹配
}

function prevCard() {
  selectCard(currentIndex.value - 1)
}

function nextCard() {
  selectCard(currentIndex.value + 1)
}

// 自动轮播控制
function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
  autoPlayInterval = setInterval(() => {
    nextCard()
  }, 4000)
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

// 鼠标跟随视差效果（左右角色移动）
function handleMouseMove(e) {
  const x = e.clientX
  const w = window.innerWidth
  const offset = (x / w - 0.5) * 12
  const leftChar = document.querySelector('.char-left')
  const rightChar = document.querySelector('.char-right')
  if (leftChar && rightChar) {
    leftChar.style.transform = `translateX(${offset * 0.8}px) translateY(${offset * 0.2}px)`
    rightChar.style.transform = `translateX(${offset * 0.6}px) translateY(${offset * 0.2}px)`
  }
}

// 键盘左右键导航
function handleKeyDown(e) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevCard()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextCard()
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('keydown', handleKeyDown)
  startAutoPlay()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('keydown', handleKeyDown)
  stopAutoPlay()
})
</script>

<style scoped>
.support-gallery {
  width: 100%;
  height: 100%;
  overflow: visible;
  background: transparent;
  position: relative;
}

.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  position: relative;
  align-items: flex-start;
  background: transparent;
}

/* 左侧角色区域（固定） */
.character-section {
  width: 40%;
  height: 100vh;
  position: sticky;
  top: 0;
  align-self: flex-start;
  overflow: hidden;
  background: transparent;
  flex-shrink: 0;
}

.logo-bg {
  position: absolute;
  width: min(500px, 32vw);
  height: auto;
  aspect-ratio: 1 / 1;
  opacity: 1;
  z-index: 1;
  left: 30%;
  top: 5%;
  pointer-events: none;
  object-fit: contain;
}

.char-left,
.char-right {
  position: absolute;
  z-index: 2;
  transition: transform 0.1s ease-out;
  height: 88%;
  bottom: 0;
  pointer-events: none;
  object-fit: contain;
}
.char-left {
  left: 1%;
}
.char-right {
  left: 24%;
}

/* 右侧信息区域 */
.info-section {
  width: 50%;
  position: relative;
  padding: 0 8px 0 8px;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 100vh;
  z-index: 5;
  justify-content: center;
  align-items: flex-end;
}
.info-section::-webkit-scrollbar {
  display: none;
}

.english-title {
  font-size: clamp(20px, 2.8vw, 38px);
  color: #2c3e4e;
  text-align: right;
  margin-bottom: 5px;
  font-weight: normal;
  margin-top: clamp(30px, 8vh, 100px);
  letter-spacing: 1px;
}
.english-title::before {
  content: "★★★";
  margin-right: 6px;
  color: #b0c4de;
  font-size: 0.9em;
}

.cn-title {
  font-size: clamp(42px, 7vw, 80px);
  color: #1a2a3a;
  font-weight: 900;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.cn-title::before {
  content: "";
  display: inline-block;
  width: clamp(40px, 5vw, 65px);
  height: clamp(40px, 5vw, 65px);
  background-color: transparent;
  background-image: url('/Nsc/96px-职责：支援_图标.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.desc-text {
  font-size: clamp(14px, 1.8vw, 22px);
  color: #2c3e4e;
  line-height: 1.4;
  text-align: right;
  letter-spacing: 1px;
  margin-bottom: 40px;
  font-weight: 500;
}
.carousel-container {
  width: 50%;
  height: 520px;         
  position: relative;
  overflow: visible;    
  margin-bottom: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 200px;
}
.carousel-track {
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.carousel-card {
  width: 320px;
  height: 440px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  will-change: transform, opacity, filter;
}

.carousel-img-wrapper {
  width: 280px;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.carousel-name {
  font-family: 'SmileySans Oblique', sans-serif;
  font-size: 20px;
  color: #2c3e4e;
  text-align: center;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

/* 导航按钮 */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(42, 62, 78, 0.7);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}
.carousel-btn:hover {
  background: rgba(42, 62, 78, 0.9);
  transform: translateY(-50%) scale(1.1);
}
.carousel-btn.prev {
  left: 0px;
}
.carousel-btn.next {
  right: 0px;
}

.carousel-indicators {
  position: absolute;
  bottom: -30px;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  z-index: 40;
}
.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(42, 62, 78, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}
.indicator.active {
  background: rgba(42, 62, 78, 0.9);
  transform: scale(1.2);
}
.indicator:hover {
  background: rgba(42, 62, 78, 0.6);
}

/* 图片加载失败占位样式 */
.carousel-img.error-load {
  object-fit: contain;
  background: rgba(0, 0, 0, 0.05);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .carousel-container {
    height: 460px;
  }
  .carousel-card {
    width: 260px;
    height: 360px;
  }
  .carousel-img-wrapper {
    width: 220px;
    height: 220px;
  }
  .carousel-track {
    gap: 20px;
  }
}

@media (max-width: 1000px) {
  .carousel-container {
    height: 420px;
  }
  .carousel-card {
    width: 220px;
    height: 300px;
  }
  .carousel-img-wrapper {
    width: 180px;
    height: 180px;
  }
  .carousel-name {
    font-size: 16px;
  }
  .carousel-track {
    gap: 16px;
  }
}

@media (max-width: 760px) {
  .character-section {
    width: 55%;
  }
  .info-section {
  width: 35%;
  position: relative;
  padding: 0 8px 0 8px;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 100vh;
  z-index: 5;
  justify-content: center;
  align-items: flex-end;
  transform: translate(-10px, 20px);
}
  .carousel-container {
    height: 360px;
  }
  .carousel-card {
    width: 180px;
    height: 250px;
  }
  .carousel-img-wrapper {
    width: 150px;
    height: 150px;
  }
  .carousel-name {
    font-size: 14px;
  }
  .carousel-track {
    gap: 12px;
  }
  .english-title {
    margin-top: 16px;
  }
}

@media (min-height: 900px) {
  .english-title {
    margin-top: 40px;
  }
}
</style>