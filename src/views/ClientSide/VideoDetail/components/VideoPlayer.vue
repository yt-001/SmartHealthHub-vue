<template>
  <div class="video-player">
    <video
      ref="videoRef"
      class="video-element"
      controls
      playsinline
      :muted="muted"
      :autoplay="autoplay"
      :poster="poster"
      :src="src"
    >
      您的浏览器不支持 HTML5 视频。
    </video>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
/**
 * 视频播放器组件
 * @description 封装原生video标签，支持传入视频源和封面
 * @param src 视频地址
 * @param poster 封面图地址
 * @param autoplay 是否自动播放（进入页面自动播放）
 * @param muted 是否静音（为保证自动播放兼容，默认静音）
 */
const props = withDefaults(defineProps<{
  src: string
  poster?: string
  autoplay?: boolean
  muted?: boolean
}>(), {
  autoplay: true,
  muted: true
})

const videoRef = ref<HTMLVideoElement | null>(null)

/**
 * 页面挂载后尝试自动播放（结合属性 autoplay）
 */
onMounted(() => {
  if (props.autoplay && videoRef.value) {
    videoRef.value.play().catch(() => {
      // 一些浏览器策略可能阻止未交互播放，此时保持控件可手动播放
    })
  }
})
</script>

<style scoped>
.video-player {
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
