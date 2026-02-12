<template>
  <div class="sidebar-dropdown">
    <!-- 触发按钮 -->
    <div ref="triggerRef" class="dropdown-trigger" @click="toggleDropdown">
      <slot name="trigger">
        <el-icon class="dropdown-icon">
          <MoreIcon />
        </el-icon>
        <span class="dropdown-text">更多</span>
      </slot>
    </div>

    <!-- 下拉菜单 -->
    <el-dropdown ref="dropdownRef" :virtual-ref="virtualTriggerRef" :virtual-triggering="true" trigger="click"
      placement="top-start" @visible-change="handleVisibleChange">
      <template #dropdown>
        <el-dropdown-menu>
          <slot name="items">
            <el-dropdown-item class="w-60" v-for="item in filteredItems" :key="item.id"
              :class="{ 'logout-item': item.id === 'logout' }" @click="handleItemClick(item.action)">
              {{ item.name }}
            </el-dropdown-item>
          </slot>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DropdownInstance } from 'element-plus'
import MoreIcon from './icons/MoreIcon.vue'

// 定义props
const props = defineProps<{
  items?: Array<{
    id: string
    name: string
    action: string
    requiresAuth?: boolean
  }>
  isLoggedIn?: boolean
}>()

// 定义emits
const emit = defineEmits<{
  (e: 'item-click', action: string): void
  (e: 'visible-change', visible: boolean): void
}>()

// 响应式数据
const dropdownRef = ref<DropdownInstance>()
const triggerRef = ref<HTMLElement>()
const position = ref({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0
} as DOMRect)

// 虚拟触发元素
const virtualTriggerRef = ref({
  getBoundingClientRect: () => position.value,
})

// 过滤后的菜单项
const filteredItems = computed(() => {
  if (!props.items) return []
  return props.items.filter(item => !item.requiresAuth || props.isLoggedIn)
})

// 方法定义
const toggleDropdown = () => {
  if (triggerRef.value) {
    // 获取触发按钮的位置
    const rect = triggerRef.value.getBoundingClientRect()
    position.value = DOMRect.fromRect({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    })

    // 打开下拉菜单
    if (dropdownRef.value) {
      dropdownRef.value.handleOpen()
    }
  }
}

const handleItemClick = (action: string) => {
  emit('item-click', action)
}

const handleVisibleChange = (visible: boolean) => {
  emit('visible-change', visible)
}
</script>

<style scoped>
.sidebar-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 0 16px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-trigger:hover {
  background-color: #f3f4f6;
}

.dropdown-icon {
  font-size: 24px;
  margin-right: 12px;
}

.dropdown-text {
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  min-width: 248px;
  width: 100%;
}

:deep(.el-dropdown-item) {
  padding: 12px 16px;
  font-size: 16px;
}

:deep(.logout-item) {
  color: #FF2442;
}

:deep(.logout-item:hover) {
  color: #e0203a;
}
</style>
