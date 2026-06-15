<template>
  <div
    :class="[`role-gallery`, `role-gallery--${config.wrapperClass}`]"
    ref="galleryRef"
    :style="cssVars"
  >
    <div class="container">

      <!-- 左侧角色插图区域 -->
      <div class="character-section">
        <div class="glow-orb glow-orb--1"></div>
        <div class="glow-orb glow-orb--2"></div>
        <img src="/logo.svg" alt="守望先锋标志" class="logo-bg">
        <div class="char-wrapper char-wrapper--left" ref="charLeftRef">
          <img :src="config.leftImage" :alt="config.leftImageAlt" class="char-left">
        </div>
        <div class="char-wrapper char-wrapper--right" ref="charRightRef">
          <img :src="config.rightImage" :alt="config.rightImageAlt" class="char-right">
        </div>
        <div class="scan-line"></div>
      </div>

      <!-- 右侧信息区域 -->
      <div class="info-section">
        <div class="info-content">
          <div class="english-title" ref="titleRef">
            <img :src="config.iconPath">
            <span>{{ config.englishTitle }}</span>
          </div>
          <div class="cn-title" ref="cnTitleRef">{{ config.chineseTitle }}</div>
          <div class="divider" ref="dividerRef"></div>
          <div class="desc-text" ref="descRef">
            {{ config.description[0] }}<br>
            {{ config.description[1] }}
          </div>

          <!-- 英雄网格 -->
          <div class="hero-grid" ref="gridRef">
            <div
              v-for="(hero, index) in heroes"
              :key="hero.imageIndex"
              class="hero-item"
              :style="{ transitionDelay: `${index * config.staggerDelay}ms` }"
            >
              <div class="hero-card">
                <img
                  :src="getHeroImage(hero, config)"
                  :alt="`${config.englishTitle} ${hero.imageIndex}`"
                  @error="handleImageError"
                >
                <div class="hero-card-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ROLE_TYPES, generateHeroes, getHeroImage } from './roleConfig.js'

const props = defineProps({
  roleType: {
    type: String,
    required: true,
    validator: (v) => ['damage', 'tank', 'support'].includes(v),
  },
})

const config = computed(() => ROLE_TYPES[props.roleType])
const heroes = computed(() => generateHeroes(config.value.heroCount))

// CSS 变量绑定
const cssVars = computed(() => {
  const t = config.value.theme
  return {
    '--theme-primary': t.primary,
    '--theme-secondary': t.secondary,
    '--theme-accent': t.accent,
    '--theme-border': t.border,
    '--theme-border-hover': t.borderHover,
    '--theme-scanline': t.scanline,
    '--theme-btn-bg': t.btnBg,
    '--theme-btn-hover': t.btnHover,
    '--theme-card-glow': t.cardGlow,
    '--theme-cn-title-color': t.cnTitleColor,
    '--theme-desc-color': t.descColor,
    '--theme-text-shadow': t.textShadow,
    '--theme-bg': t.bg,
    '--theme-shadow': t.shadow,
    '--theme-cn-title-text': t.cnTitleText,
    '--theme-hover-box-shadow': t.hoverBoxShadow,
    '--theme-hover-box-shadow2': t.hoverBoxShadow2,
    '--theme-hero-card-border': t.heroCardBorder,
    '--theme-hero-card-border-hover': t.heroCardBorderHover,
  }
})

// 简单兜底（避免破图）
function handleImageError(e) {
  e.target.style.opacity = 0.3
}

// ── refs ──
const galleryRef = ref(null)
const titleRef = ref(null)
const cnTitleRef = ref(null)
const dividerRef = ref(null)
const descRef = ref(null)
const gridRef = ref(null)
const charLeftRef = ref(null)
const charRightRef = ref(null)

// ── Intersection Observer 入场动画 ──
let observer = null

function setupObserver() {
  const el = galleryRef.value
  if (!el) return

  // 初始状态：隐藏
  ;[
    titleRef, cnTitleRef, dividerRef, descRef, gridRef,
    charLeftRef, charRightRef
  ].forEach(r => {
    if (r.value) {
      r.value.classList.add('anim-hidden')
    }
  })

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 角色滑入
        if (charLeftRef.value) {
          charLeftRef.value.classList.remove('anim-hidden')
          charLeftRef.value.classList.add('anim-visible')
        }
        if (charRightRef.value) {
          charRightRef.value.classList.remove('anim-hidden')
          charRightRef.value.classList.add('anim-visible')
        }

        // 标题序列
        if (titleRef.value) {
          titleRef.value.classList.remove('anim-hidden')
          titleRef.value.classList.add('anim-visible')
        }
        setTimeout(() => {
          if (cnTitleRef.value) {
            cnTitleRef.value.classList.remove('anim-hidden')
            cnTitleRef.value.classList.add('anim-visible')
          }
        }, 200)
        setTimeout(() => {
          if (dividerRef.value) {
            dividerRef.value.classList.remove('anim-hidden')
            dividerRef.value.classList.add('anim-visible')
          }
        }, 350)
        setTimeout(() => {
          if (descRef.value) {
            descRef.value.classList.remove('anim-hidden')
            descRef.value.classList.add('anim-visible')
          }
        }, 500)
        setTimeout(() => {
          if (gridRef.value) {
            gridRef.value.classList.remove('anim-hidden')
            gridRef.value.classList.add('anim-visible')
          }
        }, 700)

        // 触发一次后停止观察
        if (observer) {
          observer.unobserve(entry.target)
        }
      }
    })
  }, { threshold: 0.15 })

  observer.observe(el)
}

// ── 视差移动 ──
function handleMouseMove(e) {
  const x = e.clientX
  const y = e.clientY
  const w = window.innerWidth
  const h = window.innerHeight
  const xOffset = (x / w - 0.5) * 20
  const yOffset = (y / h - 0.5) * 20

  const leftChar = document.querySelector(`.role-gallery--${props.roleType} .char-wrapper--left`)
  const rightChar = document.querySelector(`.role-gallery--${props.roleType} .char-wrapper--right`)

  if (leftChar) {
    leftChar.style.setProperty('--parallax-x', `${xOffset * 2}px`)
    leftChar.style.setProperty('--parallax-y', `${yOffset}px`)
  }
  if (rightChar) {
    rightChar.style.setProperty('--parallax-x', `${xOffset * 1}px`)
    rightChar.style.setProperty('--parallax-y', `${yOffset * 0.5}px`)
  }
}

onMounted(() => {
  setupObserver()
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
/* ========================================
   统一角色 Gallery - 主题由 CSS 变量驱动
   ======================================== */

.role-gallery {
  height: 100vh;
  background: var(--theme-bg);
  color: rgb(0, 0, 0);
  overflow: hidden;
  position: relative;
}

.container {
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* ── 左侧角色插图区域 ── */
.character-section {
  position: relative;
  width: 45%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
}

/* 光晕粒子 */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.glow-orb--1 {
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(var(--theme-primary), 0.15), transparent 70%);
  top: 15%;
  left: 25%;
  animation: orbFloat 8s ease-in-out infinite;
}
.glow-orb--2 {
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, rgba(var(--theme-secondary), 0.1), transparent 70%);
  bottom: 5%;
  right: 5%;
  animation: orbFloat 10s ease-in-out infinite reverse;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -30px) scale(1.1); }
  66% { transform: translate(-15px, 15px) scale(0.95); }
}

/* 扫描线装饰 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(var(--theme-scanline), 0.03) 2px,
    rgba(var(--theme-scanline), 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* LOGO 背景 */
.logo-bg {
  position: absolute;
  width: 60%;
  opacity: 0.12;
  top: 5%;
  left: 45%;
  z-index: 0;
  animation: logoRotate 30s linear infinite;
}

@keyframes logoRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 角色外层容器 - 浮动动画 */
.char-wrapper {
  position: absolute;
  z-index: 2;
  transition: transform 0.15s ease-out;
}
.char-wrapper--left {
  bottom: 0;
  left: 0%;
  height: 90%;
  animation: floatLeft 4s ease-in-out infinite;
}
.char-wrapper--right {
  bottom: 0;
  right: 20%;
  height: 75%;
  animation: floatRight 5s ease-in-out infinite;
}

@keyframes floatLeft {
  0%, 100% { transform: translateY(0) translateX(var(--parallax-x, 0)) translateY(var(--parallax-y, 0)); }
  50% { transform: translateY(-12px) translateX(var(--parallax-x, 0)) translateY(var(--parallax-y, 0)); }
}
@keyframes floatRight {
  0%, 100% { transform: translateY(0) translateX(var(--parallax-x, 0)) translateY(var(--parallax-y, 0)); }
  50% { transform: translateY(-8px) translateX(var(--parallax-x, 0)) translateY(var(--parallax-y, 0)); }
}

.char-wrapper--left img,
.char-wrapper--right img {
  height: 100%;
  width: auto;
  filter: drop-shadow(0 20px 40px rgba(var(--theme-shadow), 0.3));
}

/* 入场动画 - 角色滑入 */
.char-wrapper.anim-hidden {
  opacity: 0;
  transform: translateX(-80px) !important;
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.char-wrapper--right.anim-hidden {
  transform: translateX(80px) !important;
}
.char-wrapper.anim-visible {
  opacity: 1;
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ── 右侧信息区域 ── */
.info-section {
  width: 55%;
  height: 100vh;
  padding: 4vh 3vw;
  margin-right: 3vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.info-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

/* 字体 */
@font-face {
  font-family: "SmileySans-Oblique";
  src: url("/font-smiley-sans.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

/* 标题 */
.english-title {
  font-size: clamp(2rem, 5vw, 6rem);
  font-family: "SmileySans-Oblique", sans-serif;
  font-weight: 700;
  justify-content: flex-end;
  display: flex;
  align-items: center;
  gap: 0.5vw;
  color: #ffffff;
  text-shadow: 0 0 40px rgba(var(--theme-text-shadow), 0.3);
}

.english-title img {
  height: clamp(1.8rem, 4vw, 5rem);
  width: auto;
}

.cn-title {
  font-size: clamp(0.9rem, 1.3vw, 1.6rem);
  margin-top: 0.5vh;
  color: var(--theme-cn-title-text);
  text-align: right;
  font-weight: 500;
  letter-spacing: 0.1em;
}

/* 分隔线 */
.divider {
  height: 2px;
  width: 60%;
  margin-top: 1.2vh;
  margin-bottom: 1.2vh;
  margin-left: auto;
  background: linear-gradient(90deg, transparent, rgba(var(--theme-primary), 0.6), transparent);
  border-radius: 2px;
}

.desc-text {
  line-height: 1.6;
  color: var(--theme-desc-color);
  text-align: right;
  font-size: clamp(0.75rem, 0.9vw, 1.05rem);
  margin-bottom: 2vh;
  text-shadow: 0 0 20px rgba(var(--theme-primary), 0.1);
}

/* ── 入场动画系统 ── */
.anim-hidden {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.anim-hidden.divider {
  transform: scaleX(0);
  transform-origin: right center;
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.anim-hidden.hero-grid {
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.anim-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.anim-visible.divider {
  transform: scaleX(1) !important;
}

/* ── 英雄网格 ── */
.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(55px, 5.5vw, 95px), 1fr));
  gap: clamp(6px, 1vh, 1.2vh) clamp(10px, 2vw, 2.5vw);
}

/* 单个英雄 */
.hero-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(15px) scale(0.9);
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hero-grid.anim-visible .hero-item {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* stagger 由 inline style transitionDelay 控制 */

/* 英雄卡片 */
.hero-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.hero-card img {
  width: 100%;
  max-width: clamp(55px, 6.5vw, 100px);
  height: auto;
  border-radius: 14px;
  object-fit: cover;
  border: 2px solid var(--theme-hero-card-border);
  transition: all 0.3s ease;
  display: block;
}

/* 卡片光晕 */
.hero-card-glow {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  opacity: 0;
  background: radial-gradient(circle at 50% 50%, rgba(var(--theme-card-glow), 0.25), transparent 70%);
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* Hover 增强 */
.hero-item:hover {
  z-index: 10;
}
.hero-item:hover .hero-card {
  transform: scale(1.08);
}
.hero-item:hover .hero-card img {
  border-color: var(--theme-hero-card-border-hover);
  box-shadow: 0 0 20px var(--theme-hover-box-shadow), 0 8px 30px var(--theme-hover-box-shadow2);
  filter: brightness(1.1);
}
.hero-item:hover .hero-card-glow {
  opacity: 1;
}

/* 名字（现在不用 图片自带） */
.hero-name {
  margin-top: 8px;
  font-size: 12px;
  color: #ddd;
}

/* ── 角色类型特定样式 ── */

/* Tank: 调整角色位置 */
.role-gallery--tank .char-wrapper--left {
  left: -10%;
}
.role-gallery--tank .char-wrapper--right {
  right: -10%;
}

/* Support: 调整角色位置和高度 */
.role-gallery--support .char-wrapper--left {
  left: 0;
  height: 95%;
}
.role-gallery--support .char-wrapper--right {
  right: 10%;
  height: 80%;
}
</style>