/**
 * 角色分类配置
 * 定义各角色类型的数据、主题色、图片路径等
 */
export const ROLE_TYPES = {
  damage: {
    heroCount: 22,
    folder: 'damage',
    fileNamePrefix: 'damage-hero',
    englishTitle: 'Damage',
    chineseTitle: '输出',
    description: ['集高伤害与灵活机动于一体的角色', '负责对敌方的击杀与火力压制'],
    iconPath: '/role-icon-damage.webp',
    leftImage: '/damage/damage-hero-left.webp',
    rightImage: '/damage/damage-hero-right.webp',
    leftImageAlt: '左侧输出角色',
    rightImageAlt: '右侧输出角色',
    wrapperClass: 'damage',
    staggerDelay: 40, // ms per item

    // 主题色 (CSS 变量值)
    theme: {
      primary: '249,115,22',    // orange-500
      secondary: '251,146,60',   // orange-400
      accent: '249,115,22',      // orange-500 glow
      border: '249,115,22',      // orange-500 border
      borderHover: 'fb923c',     // orange-400
      scanline: '249,115,22',    // orange-500 scan line
      btnBg: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.05))',
      btnHover: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(251,146,60,0.1))',
      cardGlow: '249,115,22',    // orange-500
      cnTitleColor: '#fdba74',   // orange-300
      descColor: '#a8a29e',      // stone-400
      textShadow: '249,115,22',  // orange-500
      bg: 'linear-gradient(135deg, #1a0a00 0%, #2d1a0a 30%, #3d2010 60%, #1a0a00 100%)',
      shadow: '249,115,22',      // orange-500
      cnTitleText: '#fdba74',
      hoverBoxShadow: 'rgba(249,115,22,0.4)',
      hoverBoxShadow2: 'rgba(249,115,22,0.2)',
      heroCardBorder: 'rgba(249,115,22,0.2)',
      heroCardBorderHover: '#fb923c',
    },
  },

  tank: {
    heroCount: 14,
    folder: 'tank',
    fileNamePrefix: 'tank-hero',
    englishTitle: 'Tanks',
    chineseTitle: '重装',
    description: ['集防御与推进于一体的角色', '负责对敌方的压制与战线维持'],
    iconPath: '/role-icon-tank.webp',
    leftImage: '/tank/tank-hero-left.webp',
    rightImage: '/tank/tank-hero-right.webp',
    leftImageAlt: '左侧重装角色',
    rightImageAlt: '右侧重装角色',
    wrapperClass: 'tank',
    staggerDelay: 50,

    theme: {
      primary: '59,130,246',     // blue-500
      secondary: '96,165,250',   // blue-400
      accent: '59,130,246',      // blue-500 glow
      border: '59,130,246',      // blue-500
      borderHover: '60a5fa',     // blue-400
      scanline: '59,130,246',    // blue-500
      btnBg: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(96,165,250,0.05))',
      btnHover: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(96,165,250,0.1))',
      cardGlow: '59,130,246',    // blue-500
      cnTitleColor: '#93c5fd',   // blue-300
      descColor: '#94a3b8',      // slate-400
      textShadow: '59,130,246',  // blue-500
      bg: 'linear-gradient(135deg, #0a0f1e 0%, #111827 30%, #1a2a40 60%, #0f172a 100%)',
      shadow: '59,130,246',      // blue-500
      cnTitleText: '#93c5fd',
      hoverBoxShadow: 'rgba(59,130,246,0.4)',
      hoverBoxShadow2: 'rgba(59,130,246,0.2)',
      heroCardBorder: 'rgba(59,130,246,0.2)',
      heroCardBorderHover: '#60a5fa',
    },
  },

  support: {
    heroCount: 14,
    folder: 'support',
    fileNamePrefix: 'support-hero',
    englishTitle: 'Supports',
    chineseTitle: '辅助',
    description: ['集治疗与增益于一体的角色', '负责对友方的保护与强化'],
    iconPath: '/role-icon-support.webp',
    leftImage: '/support/support-hero-left.webp',
    rightImage: '/support/support-hero-right.webp',
    leftImageAlt: '左侧辅助角色',
    rightImageAlt: '右侧辅助角色',
    wrapperClass: 'support',
    staggerDelay: 50,

    theme: {
      primary: '234,179,8',      // yellow-500
      secondary: '250,204,21',   // yellow-400
      accent: '234,179,8',       // yellow-500 glow
      border: '234,179,8',       // yellow-500
      borderHover: 'facc15',     // yellow-400
      scanline: '234,179,8',     // yellow-500
      btnBg: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(250,204,21,0.05))',
      btnHover: 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(250,204,21,0.1))',
      cardGlow: '234,179,8',     // yellow-500
      cnTitleColor: '#fde68a',   // yellow-300
      descColor: '#a8a29e',      // stone-400
      textShadow: '234,179,8',   // yellow-500
      bg: 'linear-gradient(135deg, #141005 0%, #1d1608 30%, #2a1f08 60%, #141005 100%)',
      shadow: '234,179,8',       // yellow-500
      cnTitleText: '#fde68a',
      hoverBoxShadow: 'rgba(234,179,8,0.4)',
      hoverBoxShadow2: 'rgba(234,179,8,0.2)',
      heroCardBorder: 'rgba(234,179,8,0.2)',
      heroCardBorderHover: '#facc15',
    },
  },
}

/**
 * 生成英雄列表 [{ imageIndex: 1 }, { imageIndex: 2 }, ...]
 */
export function generateHeroes(count) {
  return Array.from({ length: count }, (_, i) => ({ imageIndex: i + 1 }))
}

/**
 * 生成英雄图片路径
 */
export function getHeroImage(hero, config) {
  const fileName = `${config.fileNamePrefix}-${String(hero.imageIndex).padStart(2, '0')}.jpg`
  return `/${config.folder}/${encodeURI(fileName)}`
}