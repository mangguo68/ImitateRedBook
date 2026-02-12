// 搜索历史记录管理器
class SearchHistoryManager {
  private static readonly STORAGE_KEY = 'search-history'
  private static readonly MAX_HISTORY_COUNT = 10

  // 获取搜索历史
  static getHistory(): string[] {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('获取搜索历史失败:', error)
      return []
    }
  }

  // 添加搜索记录
  static addHistory(keyword: string): void {
    if (!keyword?.trim()) return

    try {
      const history = this.getHistory()
      const trimmedKeyword = keyword.trim()
      
      // 移除已存在的相同记录
      const filteredHistory = history.filter(item => item !== trimmedKeyword)
      
      // 添加到开头
      filteredHistory.unshift(trimmedKeyword)
      
      // 限制最大数量
      const limitedHistory = filteredHistory.slice(0, this.MAX_HISTORY_COUNT)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  // 清除所有历史记录
  static clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('清除搜索历史失败:', error)
    }
  }

  // 删除特定历史记录
  static removeHistory(keyword: string): void {
    try {
      const history = this.getHistory()
      const filteredHistory = history.filter(item => item !== keyword)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory))
    } catch (error) {
      console.error('删除搜索历史失败:', error)
    }
  }
}

export default SearchHistoryManager