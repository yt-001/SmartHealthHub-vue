import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

interface UsePullUpLoadOptions {
  onLoad: () => Promise<void>
  threshold?: number // 触发加载的拉动距离阈值
  maxDistance?: number // 最大拉动距离
  minLoadTime?: number // 最小加载时间 (ms)
}

export function usePullUpLoad(options: UsePullUpLoadOptions) {
  const { 
    onLoad, 
    threshold = 60, 
    maxDistance = 150,
    minLoadTime = 600 
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

  // 检查是否触底
  const checkBottom = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const clientHeight = document.documentElement.clientHeight
    const scrollHeight = document.documentElement.scrollHeight
    // 宽松一点，接近底部 5px 就算触底
    isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 5
  }

  // --- 触摸事件处理 ---
  const handleTouchStart = (e: TouchEvent) => {
    checkBottom()
    if (isAtBottom.value && !isLoading.value) {
      startY = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isAtBottom.value || isLoading.value || startY === 0) return
    
    const currentY = e.touches[0].clientY
    const diff = startY - currentY // 向上拉是正值

    if (diff > 0 && e.cancelable) {
      // 只有在确实是向上拉且已经在底部时才阻止默认滚动（防止橡皮筋效果冲突）
      // 但要注意不能阻止正常的向回滚动
      e.preventDefault()
      isPulling.value = true
      
      // 计算新的拉动距离（带阻力）
      let newDist = pullDistance.value + (diff - pullDistance.value) * 0.4 // 简化阻力
      
      // 限制最大距离
      if (newDist > maxDistance) newDist = maxDistance
      pullDistance.value = Math.max(0, newDist)
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.value) return
    
    isPulling.value = false
    
    if (pullDistance.value >= threshold) {
      await triggerLoad()
    } else {
      resetPull()
    }
    startY = 0
  }

  // --- 滚轮事件处理 (适配 PC/触控板) ---
  const handleWheel = (e: WheelEvent) => {
    checkBottom()
    if (!isAtBottom.value || isLoading.value) return

    // deltaY > 0 表示向下滚动（手指向上推）
    if (e.deltaY > 0) {
      // 已经在底部，继续向下滚 -> 触发拉动
      e.preventDefault()
      isPulling.value = true
      
      const newDist = pullDistance.value + e.deltaY * 0.4
      pullDistance.value = Math.min(maxDistance, Math.max(0, newDist))

      // 滚轮不像触摸有明确的 End，所以用防抖来检测停止
      if (releaseTimer) clearTimeout(releaseTimer)
      releaseTimer = window.setTimeout(() => {
        handleTouchEnd() // 复用结束逻辑
      }, 200)
    } else if (isPulling.value && e.deltaY < 0) {
        // 如果正在拉动状态下向上滚，应该减少拉动距离
        const newDist = pullDistance.value + e.deltaY * 0.4 // deltaY is negative
        pullDistance.value = Math.max(0, newDist)
        if(pullDistance.value === 0) {
            isPulling.value = false
        }
    }
  }

  // 触发加载
  const triggerLoad = async () => {
    isLoading.value = true
    // 保持一定的拉动距离作为 loading 展示区
    // 比如回弹到 threshold 的位置或者一个固定 loading 高度
    const loadingHeight = 60 
    // 动画过渡到 loadingHeight
    // 这里通过 CSS transition 实现，JS 只需要设置值
    pullDistance.value = loadingHeight

    const startTime = Date.now()
    try {
      await onLoad()
    } finally {
      const elapsed = Date.now() - startTime
      if (elapsed < minLoadTime) {
        await new Promise(r => setTimeout(r, minLoadTime - elapsed))
      }
      isLoading.value = false
      resetPull()
    }
  }

  const resetPull = () => {
    pullDistance.value = 0
    isPulling.value = false
  }

  // 容器样式
  const containerStyle = computed(() => ({
    transform: `translateY(${-pullDistance.value}px)`,
    transition: isPulling.value ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.5, 1)'
  }))

  onMounted(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false }) // 需 non-passive 以阻止默认
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', checkBottom, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('scroll', checkBottom)
    if (releaseTimer) clearTimeout(releaseTimer)
  })

  return {
    pullDistance,
    isPulling,
    isLoading,
    containerStyle
  }
}
