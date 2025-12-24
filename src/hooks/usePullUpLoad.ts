import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

interface UsePullUpLoadOptions {
  onLoad: () => Promise<void>
  threshold?: number // 触发加载的拉动距离阈值
  maxDistance?: number // 最大拉动距离
  minLoadTime?: number // 最小加载时间 (ms)
  scrollTarget?: string | HTMLElement | null // 滚动容器选择器或元素，默认为 window
}

export function usePullUpLoad(options: UsePullUpLoadOptions) {
  const { 
    onLoad, 
    threshold = 60, 
    maxDistance = 150,
    minLoadTime = 600,
    scrollTarget = null
  } = options

  const pullDistance = ref(0)
  const isPulling = ref(false)
  const isLoading = ref(false)
  const isAtBottom = ref(false)
  
  // 阻力系数：拉得越长阻力越大
  const friction = (distance: number) => {
    return 0.5 * (1 - distance / maxDistance)
  }

  let startY = 0
  let releaseTimer: number | null = null
  let targetEl: HTMLElement | Window = window

  // 获取滚动相关的属性
  const getScrollInfo = () => {
    if (targetEl === window) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const clientHeight = document.documentElement.clientHeight
      const scrollHeight = document.documentElement.scrollHeight
      return { scrollTop, clientHeight, scrollHeight }
    } else {
      const el = targetEl as HTMLElement
      return {
        scrollTop: el.scrollTop,
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight
      }
    }
  }

  // 检查是否触底
  const checkBottom = () => {
    const { scrollTop, clientHeight, scrollHeight } = getScrollInfo()
    // 只有当内容确实超过容器高度时才认为可以触底加载
    if (scrollHeight <= clientHeight) {
      isAtBottom.value = false 
      return
    }
    // 阈值设为 50px，提前加载
    const isBottom = scrollTop + clientHeight >= scrollHeight - 50
    isAtBottom.value = isBottom

    // 自动触发加载：触底 + 未在加载中
    if (isBottom && !isLoading.value) {
      triggerLoad()
    }
  }

  // 使用 RAF 节流 scroll 事件
  let rafId: number | null = null
  const onScroll = () => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      checkBottom()
      rafId = null
    })
  }

  // 触发加载
  const triggerLoad = async () => {
    isLoading.value = true
    // 自动加载模式下，不需要 pullDistance 的位移效果
    // pullDistance.value = 60 
    
    const startTime = Date.now()
    try {
      await onLoad()
    } finally {
      const elapsed = Date.now() - startTime
      if (elapsed < minLoadTime) {
        await new Promise(r => setTimeout(r, minLoadTime - elapsed))
      }
      isLoading.value = false
      // resetPull() // 不需要重置拉动
    }
  }

  // 容器样式 - 自动加载模式下不需要 transform
  const containerStyle = computed(() => ({}))

  onMounted(() => {
    // 初始化 scrollTarget
    if (typeof scrollTarget === 'string') {
      const el = document.querySelector(scrollTarget)
      if (el) targetEl = el as HTMLElement
    } else if (scrollTarget instanceof HTMLElement) {
      targetEl = scrollTarget
    }

    // 只保留 scroll 监听，移除 touch/wheel 手势
    targetEl.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    targetEl.removeEventListener('scroll', onScroll)
    if (rafId) cancelAnimationFrame(rafId)
  })

  return {
    pullDistance, // 保持接口兼容，但值始终为 0
    isPulling,    // 始终 false
    isLoading,
    containerStyle
  }
}
