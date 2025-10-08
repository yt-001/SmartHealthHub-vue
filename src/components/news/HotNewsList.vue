<template>
  <!-- 中新热榜 -->
  <section class="hot-panel">
    <h2 class="panel-title">中新热榜</h2>
    <ul class="hot-list">
      <li v-for="(hot, idx) in top10" :key="idx" :title="hot">
        <span :class="['rank-badge', idx < 3 && ('top' + (idx + 1))]">
          {{ idx + 1 }}
        </span>
        <span class="title">{{ hot }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
// 原始数据
const hotList = [
  '逐“绿”而行全球企业共探绿色农业发展..',
  '（走进中国乡村）“中国龙眼之乡”高州：',
  '（活力中国调研行）“公空铁海”多式联运（活力中国调研行）“公空铁海”多式联运.',
  '台军史上最长的汉光演习：军火商的狂欢，',
  '（侨乡新貌）广东英红镇茶香“侨味”浓…',
  '中央纪委国家监委驻海关总署纪检监察组原',
  '常州市长化身网友在线回应诉求球迷“许..',
  '两岸青年走进浙闽：探寻中医药文化的传承.',
  '广西壮族自治区梧州市委原常委、秘书长韦..',
  '新加坡媒体将网络攻击事件与中国联系中.',
  '（额外条目）仅用于演示，会被截断'
];

// 只取前 10 条
const top10 = hotList.slice(0, 10);
</script>

<style scoped>
/* ===== 面板：固定 300px 宽，高度随内容 ===== */
.hot-panel {
  width: 300px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

/* ===== 标题：缩小 + 左侧高亮条 ===== */
.panel-title {
  position: relative;
  padding-left: 12px;
  margin: 0 0 12px;
  font-size: 1.25rem; /* text-xl */
  font-weight: 700;
  color: #16a34a;
}
.panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(180deg, #16a34a, #22c55e);
}

/* ===== 列表 ===== */
.hot-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hot-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px dashed #eef2f7;
}
.hot-list li:last-child {
  border-bottom: none;
}

/* ===== 排行徽章 ===== */
.rank-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-weight: 700;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.35);
}
.rank-badge.top1 {
  background: linear-gradient(135deg, #ef4444, #f59e0b);
}
.rank-badge.top2 {
  background: linear-gradient(135deg, #f59e0b, #facc15);
}
.rank-badge.top3 {
  background: linear-gradient(135deg, #facc15, #22c55e);
}

/* ===== 标题：强制单行 + 省略号 ===== */
.title {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.4;
  color: #111;
}
.title:hover {
  text-decoration: underline;
  color: #16a34a;
}
</style>