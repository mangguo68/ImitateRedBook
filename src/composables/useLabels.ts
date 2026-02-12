import { ref } from 'vue'
import { getLabels } from '@/apis/labels'
import type { LabelsResponse } from '@/types'

interface Tab {
  key: string
  label: string
}

const DEFAULT_TABS: Tab[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'fashion', label: '穿搭' },
  { key: 'food', label: '美食' },
  { key: 'makeup', label: '彩妆' },
  { key: 'movie', label: '影视' },
  { key: 'workplace', label: '职场' },
  { key: 'emotion', label: '情感' },
  { key: 'travel', label: '旅行' },
  { key: 'fitness', label: '健身' },
  { key: 'reading', label: '读书' },
  { key: 'gaming', label: '游戏' }
]

export function useLabels(initialActiveTab: string = 'recommend') {
  const tabs = ref<Tab[]>([])
  const activeTab = ref(initialActiveTab)

  const loadLabels = async () => {
    try {
      const response: LabelsResponse = await getLabels({ type: 'all' })
      if (response && response.labels && response.labels.length > 0) {
        tabs.value = response.labels.map((label: any) => ({
          key: label.value,
          label: label.name
        }))

        if (tabs.value.length > 0 && !tabs.value.find(tab => tab.key === activeTab.value)) {
          const firstTab = tabs.value[0]
          if (firstTab) {
            activeTab.value = firstTab.key
          }
        }
      } else {
        tabs.value = [...DEFAULT_TABS]
      }
    } catch (error) {
      console.error('获取标签数据失败:', error)
      tabs.value = [...DEFAULT_TABS]
    }
  }

  return {
    tabs,
    activeTab,
    loadLabels
  }
}
