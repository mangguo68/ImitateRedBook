<template>
  <div class="waterfall-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <slot name="loading">
        <div class="loading-spinner">
          <div class="loading-icon">⟳</div>
          <p class="loading-text">加载中...</p>
        </div>
      </slot>
    </div>

    <!-- 瀑布流 -->
    <div v-else-if="dataList.length > 0" class="waterfall-content">
      <div class="waterfall-layout">
        <wc-flow-layout :cols="cols" :gap="gap">
          <div class="waterfall-item" v-for="(item, index) in dataList" :key="index">
            <slot name="item" :item="item" :index="index">
              <!-- 默认内容 -->
              <div class="default-content">请提供自定义内容</div>
            </slot>
          </div>
        </wc-flow-layout>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <slot name="empty">
        <div class="empty-content">
          <div class="empty-icon">📭</div>
          <p class="empty-text">暂无数据</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  dataList: any[];
  loading?: boolean;
  cols?: number;
  gap?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  cols: 3,
  gap: 16
});
</script>

<style lang="scss" scoped>
.waterfall-container {
  width: 100%;
  min-height: 200px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  text-align: center;
  color: #667eea;

  .loading-icon {
    font-size: 32px;
    margin-bottom: 16px;
  }

  .loading-text {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.empty-content {
  text-align: center;
  color: #999;

  .empty-icon {
    font-size: 64px;
    opacity: 0.5;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    margin: 0;
  }
}

.waterfall-content {
  width: 100%;
}

.waterfall-layout {
  width: 100%;
}

.waterfall-item {
  margin-bottom: 16px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.default-content {
  padding: 40px;
  text-align: center;
  color: #999;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
}

/* wc-flow-layout 自定义样式 */
.waterfall-layout {
  width: 100%;
}
</style>