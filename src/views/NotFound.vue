<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="status-code">404</h1>
      <h2 class="error-message">页面不存在</h2>
      <p class="description">抱歉，您访问的页面可能已被删除或暂时不可用</p>
      <div class="actions">
        <el-button class="rounded-lg!" type="primary" @click="goHome">返回首页</el-button>
        <el-button class="rounded-lg!" @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/discover')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  background-color: white;
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 500px;
  width: 100%;
}

.status-code {
  font-size: 80px;
  font-weight: 700;
  color: #409eff;
  margin: 0 0 20px;
  line-height: 1;
}

.error-message {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px;
}

.description {
  font-size: 16px;
  color: #909399;
  margin: 0 0 40px;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 30px;
  }

  .status-code {
    font-size: 60px;
  }

  .error-message {
    font-size: 20px;
  }

  .description {
    font-size: 14px;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>