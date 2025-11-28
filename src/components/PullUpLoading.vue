<template>
  <div class="pull-up-loading" :style="{ height: height + 'px' }">
    <div class="content">
      <template v-if="loading">
        <div class="spinner">
          <div class="dot dot1"></div>
          <div class="dot dot2"></div>
          <div class="dot dot3"></div>
        </div>
        <span class="text">正在加载更多...</span>
      </template>
      <template v-else-if="!hasMore">
        <span class="text no-more">没有更多内容了</span>
      </template>
      <template v-else>
        <span class="text tip" :class="{ active: pullDistance > threshold }">
          {{ pullDistance > threshold ? '释放立即加载' : '上拉加载更多' }}
        </span>
        <el-icon class="arrow" :class="{ rotate: pullDistance > threshold }"><Top /></el-icon>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Top } from '@element-plus/icons-vue'

const props = defineProps<{
  loading: boolean
  hasMore: boolean
  pullDistance: number
  threshold?: number
}>()

const threshold = props.threshold || 60

// 容器高度随拉动距离变化，但不超过最大限制太多，避免露底太难看
// 其实这里容器高度可以是固定的，通过 absolute 定位或者 margin 来显示
// 但为了配合 usePullUpLoad 的 translateY，我们这个组件应该放在页面最底部
// 它的高度应该是 0 或者很小，实际内容通过 transform 显示？
// 不，更好的方式是：这个组件本身在正常流中占据一定高度（例如60px），平时隐藏或者显示"没有更多"
// 当拉动时，usePullUpLoad 会把整个页面往上提，露出下面这个组件
// 所以这个组件应该放在页面内容容器的 *外面* 或者 *最底部*。
// 如果是放在最底部，平时是可见的吗？
// 通常 infinite scroll 的 loader 是平时看不见的，只有拉到底部才看见。
// 这里我们将高度设为 pullDistance，这样它会占据空间？
// 不，usePullUpLoad 是 translateY 整个容器。
// 如果我们把这个组件放在容器 *内部* 的最底下，translateY 会把它一起提上去。
// 所以这个组件应该放在容器 *外部* 的底部，或者 absolute bottom。
// 为了简化，我们让这个组件作为列表的最后一个元素。
// 当 pullDistance 增加时，translateY 把整个列表提上去，这个组件也跟上去。
// 但这样底下就是空的白背景。
// 正确的做法：
// 页面结构： [内容] [Loading组件]
// Loading组件高度为 0 或很小。
// 当 translateY(-x) 时，内容上移。Loading组件也上移。
// 此时视口底部会变空。
// 所以我们需要 Loading 组件 *固定* 在视口底部，或者 *位于内容下方* 但平时被隐藏？
// 让我们调整一下思路：
// usePullUpLoad 的 containerStyle 是 `transform: translateY(-distance)`
// 这意味着内容整体向上跑了。
// 我们希望在内容向上跑的时候，底部露出 Loading。
// 所以 Loading 组件应该放在 container 的 *底部*。
// 并且它的高度应该动态变化吗？
// 不，它的高度可以是固定的（比如 60px），平时不可见（或者就在屏幕外）。
// 当 translateY(-60px) 时，它就进入屏幕了。
// 但如果 distance 是 150px，它就跑得更高。
// 所以这个组件的高度可以设为 0，内容 overflow visible?
// 或者简单的：这个组件高度固定 60px。
// 正常情况下，它在内容的最下面。
// 如果内容不满一屏，它就在下面。
// 如果内容超出一屏，它在滚动条的最下面。
// 当我们滚动到底部，再继续拉，translateY 会把包括它在内的所有东西往上提。
// 这样是可以看到它的。
// 唯一的问题是背景色。
// 
// 为了美观，我们给这个组件一个高度，并让它里面的内容居中。
const height = computed(() => Math.max(60, props.pullDistance))

</script>

<style scoped>
.pull-up-loading {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 内容靠上，随拉动露出 */
  overflow: hidden;
  /* 背景透明或与页面背景一致 */
}

.content {
  height: 60px; /* 内容固定高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  width: 100%;
}

.spinner {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot1 { animation-delay: -0.32s; }
.dot2 { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.arrow {
  transition: transform 0.3s;
}
.arrow.rotate {
  transform: rotate(180deg);
}

.tip {
  transition: opacity 0.3s;
}
</style>
