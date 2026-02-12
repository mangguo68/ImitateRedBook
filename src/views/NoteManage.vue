<template>
  <div class="note-manage-container">
    <div class="page-header">
      <h2>笔记管理</h2>
      <el-button type="primary" size="small" class="rounded-full!" @click="goBack">返回</el-button>
    </div>

    <!-- 笔记筛选 -->
    <div class="filter-section">
      <el-select v-model="statusFilter" placeholder="筛选状态" style="width: 120px; margin-right: 10px;"
        @change="handleFilterChange">
        <el-option label="全部" value="all" />
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索标题或内容" clearable style="width: 300px;"
        @change="handleFilterChange" @clear="handleFilterChange">
        <template #prepend>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 加载状态 -->
    <el-skeleton :rows="3" animated v-if="loading" />

    <!-- 笔记列表 -->
    <div v-if="!loading" class="notes-list">
      <el-card v-for="note in notes" :key="note._id" class="note-card">
        <div class="note-header">
          <h3 class="note-title">{{ note.title || '无标题笔记' }}</h3>
          <el-tag :type="note.isPublished ? 'success' : 'info'">
            {{ note.isPublished ? '已发布' : '草稿' }}
          </el-tag>
        </div>

        <div class="note-content">
          {{ note.content.substring(0, 100) }}...
        </div>

        <div class="note-footer">
          <span class="note-time">
            <el-icon>
              <Clock />
            </el-icon>
            {{ formatDate(note.createdAt) }}
          </span>

          <div class="note-actions">
            <el-button type="primary" size="small" @click="editNote(note)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteNote(note._id, note.isDraft)">
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
            <el-button v-if="!note.isPublished" type="success" size="small" @click="publishNote(note._id)">
              <el-icon>
                <Upload />
              </el-icon>
              发布
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 空状态 -->
      <el-empty v-if="notes.length === 0" description="暂无笔记" />
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination v-if="!loading && total > 0" layout="total, sizes, prev, pager, next, jumper" :total="total"
        :page-size="pageSize" v-model:current-page="currentPage" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search, Clock, Edit, Delete, Upload } from '@element-plus/icons-vue'
import { getUserNotes, deleteNote as deleteNoteApi, updateNote, deleteDraft, publishDraft } from '@/apis/notes'
import type { Note } from '@/types'

// 路由
const router = useRouter()

// 筛选条件
const statusFilter = ref<'all' | 'published' | 'draft'>('all')
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 笔记数据
const notes = ref<Note[]>([])
const loading = ref(false)

// 获取笔记列表
const fetchNotes = async () => {
  loading.value = true

  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined
    }

    const response = await getUserNotes(params)
    // 由于响应拦截器的处理，直接返回的是res.data，没有success和message字段
    notes.value = response.notes
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取笔记失败，请稍后重试')
    console.error('获取笔记失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 编辑笔记
const editNote = (note: Note) => {
  // 这里可以跳转到编辑页面，传递笔记ID
  router.push(`/publish?edit=${note._id}`)
}

// 删除笔记
const deleteNote = async (id: string, isDraft: boolean) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇笔记吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await (isDraft ? deleteDraft(id) : deleteNoteApi(id))
    // 由于响应拦截器的处理，成功时不会进入catch，直接执行以下代码
    ElMessage.success('笔记删除成功')
    fetchNotes() // 重新获取笔记列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除笔记失败，请稍后重试')
    }
  }
}

// 发布草稿
const publishNote = async (id: string) => {
  try {
    await publishDraft(id)
    // 由于响应拦截器的处理，成功时不会进入catch，直接执行以下代码
    ElMessage.success('笔记发布成功')
    fetchNotes() // 重新获取笔记列表
  } catch (error) {
    ElMessage.error('发布笔记失败，请稍后重试')
    console.error('发布笔记失败:', error)
  }
}

// 筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1 // 重置到第一页
  fetchNotes()
}

// 分页大小变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1 // 重置到第一页
  fetchNotes()
}

// 当前页变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchNotes()
}

// 页面加载时获取笔记
onMounted(() => {
  fetchNotes()
})
</script>

<style scoped>
:deep(.el-select__wrapper) {
  border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}

:deep(.el-input-group__prepend) {
  border-radius: 8px;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

:deep(.el-tag) {
  border-radius: 6px;
}

:deep(.el-button) {
  border-radius: 6px;
}

.note-manage-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
}

.notes-list {
  display: grid;
  gap: 20px;
}

.note-card {
  transition: all 0.3s;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.note-title {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.note-content {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
  max-height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.note-time {
  color: #999;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-actions {
  display: flex;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>