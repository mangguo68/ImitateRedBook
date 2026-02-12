<template>
  <div class="publish-note-page">
    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="login-prompt-container">
      <div class="login-prompt-content">
        <div class="login-icon">
          <el-icon class="icon">
            <Avatar />
          </el-icon>
        </div>
        <h2 class="login-title">请先登录</h2>
        <p class="login-description">登录后才能发布笔记</p>
        <div class="button-group">
          <el-button type="primary" @click="handleLogin" style="border-radius: 24px; padding: 8px 32px;">
            登录 / 注册
          </el-button>
          <el-button @click="handleBackToHome" style="border-radius: 24px; padding: 8px 32px;">
            返回首页
          </el-button>
        </div>
      </div>
    </div>

    <!-- 登录状态 -->
    <div v-else class="publish-container">
      <!-- 顶部标题栏 -->
      <div class="header">
        <div class="header-left">
          <el-button circle size="small" @click="handleBack">
            <el-icon>
              <ArrowLeft />
            </el-icon>
          </el-button>
          <h2 class="title">{{ isEditMode ? '编辑笔记' : '发布笔记' }}</h2>
        </div>
        <div class="header-actions">
          <el-button @click="handleNoteManage" class="red-button">
            笔记管理
          </el-button>
          <el-button @click="handleDraft" class="red-button">
            存草稿
          </el-button>
          <el-button type="primary" @click="handlePublish" :loading="publishing" style="border-radius: 12px;">
            发布
          </el-button>
        </div>
      </div>

      <!-- 内容编辑区域 -->
      <div class="content-area">
        <!-- 图片上传区域 -->
        <div class="image-upload-section">
          <el-upload ref="uploadRef" action="#" list-type="picture-card" :file-list="fileList"
            :on-change="handleFileChange" :on-remove="handleFileRemove" :before-upload="beforeUpload"
            :http-request="handleCustomUpload" multiple accept="image/*" class="custom-upload">
            <el-icon>
              <Plus />
            </el-icon>
            <template #tip>
              <div class="upload-tip">
                支持 JPG、PNG、GIF 格式，单张图片不超过 10MB
              </div>
            </template>
          </el-upload>
        </div>

        <!-- 文本编辑区域 -->
        <div class="text-editor-section">
          <el-input v-model="noteData.title" placeholder="添加标题（可选）" class="title-input" maxlength="50"
            show-word-limit />

          <el-input v-model="noteData.content" type="textarea" placeholder="分享你的心得体会..." class="content-textarea"
            :rows="8" maxlength="500" show-word-limit resize="none" />
        </div>

        <!-- 分类选择区域 -->
        <div class="category-section">
          <div class="section-title">
            <el-icon>
              <Grid />
            </el-icon>
            选择分类
          </div>
          <div class="category-content">
            <el-select v-model="noteData.category" placeholder="请选择分类" class="category-select">
              <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
        </div>

        <!-- 标签选择区域 -->
        <div class="tag-section">
          <div class="section-title">
            <el-icon>
              <PriceTag />
            </el-icon>
            添加标签
          </div>
          <div class="tag-input-container">
            <el-tag v-for="tag in noteData.tags" :key="tag" closable @close="removeTag(tag)" class="selected-tag">
              {{ tag }}
            </el-tag>
            <el-input v-if="inputVisible" ref="inputRef" v-model="inputValue" size="small"
              @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" class="tag-input" />
            <el-button v-else size="small" @click="showInput" :disabled="noteData.tags.length >= 5" class="add-tag-btn">
              <el-icon>
                <Plus />
              </el-icon>
              添加标签
            </el-button>
          </div>
          <div class="tag-suggestions">
            <span class="suggestions-title">推荐标签：</span>
            <el-tag v-for="tag in suggestedTags" :key="tag" size="small" @click="addSuggestedTag(tag)"
              class="suggested-tag">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 位置信息区域 -->
        <div class="location-section">
          <div class="section-title">
            <el-icon>
              <Location />
            </el-icon>
            位置信息
          </div>
          <div class="location-content">
            <el-input v-model="noteData.location" placeholder="添加位置信息（可选）" class="location-input" maxlength="30">
              <template #prefix>
                <el-icon>
                  <Location />
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, PriceTag, Location, Grid, Avatar } from '@element-plus/icons-vue'
import type { UploadProps, UploadFile } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { publishNote, saveDraft, getNoteDetail, updateNote, uploadImage } from '@/apis/notes'
import { getLabels } from '@/apis/labels'
import type { Label } from '@/types'

// 定义组件props
const props = defineProps<{
  edit?: string
}>()

// 认证状态
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)

// 登录处理
const handleLogin = () => {
  authStore.openLoginDialog()
}

// 返回首页
const handleBackToHome = () => {
  router.push('/')
}

// 监听props中的edit参数变化
watch(() => props.edit, async (newEditId, oldEditId) => {
  // 如果edit参数从有值变为undefined，说明用户从编辑模式切换到了发布新笔记模式
  if (!newEditId && oldEditId) {
    // 重置表单
    isEditMode.value = false
    editingNoteId.value = ''
    noteData.title = ''
    noteData.content = ''
    noteData.tags = []
    noteData.location = ''
    noteData.images = []
    noteData.category = ''
    fileList.value = []
  } else if (newEditId && newEditId !== oldEditId) {
    // 如果edit参数变化且有新值，加载新的笔记详情
    await loadNoteDetail(newEditId)
  }
})

// 加载分类标签
const loadCategories = async () => {
  try {
    const response = await getLabels({ type: 'all' })
    if (response && response.labels) {
      categories.value = response.labels.map((label: Label) => ({
        label: label.name,
        value: label.value
      }))
    }
  } catch (error) {
    console.error('获取分类标签失败:', error)
  }
}

// 组件挂载时检查认证状态和加载笔记详情
onMounted(async () => {
  // 这里可以添加认证检查逻辑，如果需要的话
  const token = localStorage.getItem('token')
  if (!token) {

    // 可以选择重定向到登录页面或显示提示
  }

  // 加载分类标签
  await loadCategories()

  // 检查是否有编辑参数
  if (props.edit) {
    await loadNoteDetail(props.edit)
  }
})
const router = useRouter()
const route = useRoute()
const uploadRef = ref()
const inputRef = ref()

// 发布状态
const publishing = ref(false)

// 文件列表
const fileList = ref<UploadFile[]>([])

// 标签输入相关
const inputVisible = ref(false)
const inputValue = ref('')

// 推荐标签
const suggestedTags = ref(['穿搭', '美食', '彩妆', '影视', '职场', '情感', '旅行', '健身'])

// 分类选项
const categories = ref<Array<{ label: string; value: string }>>([])

// 定义图片数据结构
interface ImageData {
  uid: string;
  url: string;
}

// 笔记数据
const noteData = reactive({
  title: '',
  content: '',
  tags: [] as string[],
  location: '',
  images: [] as ImageData[],
  category: '' as string
})

// 编辑模式和笔记ID
const isEditMode = ref(false)
const editingNoteId = ref<string>('')

// 返回上一页
const handleBack = () => {
  ElMessageBox.confirm('确定要放弃编辑吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    router.back()
  }).catch(() => { })
}

// 跳转到笔记管理页面
const handleNoteManage = () => {
  router.push('/note-manage')
}

// 加载笔记详情
const loadNoteDetail = async (id: string) => {
  try {
    const note = await getNoteDetail(id)
    if (note) {
      // 填充表单数据
      noteData.title = note.title || ''
      noteData.content = note.content || ''
      noteData.tags = note.tags || []
      noteData.location = note.location || ''
      noteData.category = note.category || ''

      // 为现有图片生成包含uid和url的对象数组
      if (note.images && note.images.length > 0) {
        noteData.images = note.images.map((url: string, index: number) => ({
          uid: (index + 1).toString(), // 生成与fileList一致的uid
          url
        }))

      } else {
        noteData.images = []
      }

      // 设置为编辑模式
      isEditMode.value = true
      editingNoteId.value = id

      // 转换图片数据到文件列表
      if (note.images && note.images.length > 0) {
        fileList.value = note.images.map((url: string, index: number) => ({
          uid: index + 1, // 使用索引作为uid，确保是number类型
          name: url.split('/').pop() || 'image',
          url,
          status: 'success'
        }))
      }

      ElMessage.success('笔记加载成功')
    }
  } catch (error: any) {
    console.error('加载笔记失败:', error)

    // 检查是否是404错误或笔记不存在的情况
    const errorMessage = error.isAxiosError && error.response?.status === 404
      ? '该笔记不存在或已被删除'
      : '加载笔记失败，请稍后重试'

    ElMessage.error(errorMessage)

    // 延迟跳转到笔记管理页面，让用户有时间看到错误提示
    setTimeout(() => {
      router.push('/note-manage')
    }, 1500)
  }
}

// 草稿箱
const handleDraft = async () => {
  if (!noteData.content.trim() && noteData.images.length === 0) {
    ElMessage.warning('请输入内容或上传图片')
    return
  }

  if (!noteData.category) {
    ElMessage.warning('请选择分类')
    return
  }

  if (noteData.tags.length === 0) {
    ElMessage.warning('请至少添加一个标签')
    return
  }

  try {
    // 准备草稿数据
    const draftData = {
      title: noteData.title.trim() || '无标题',
      content: noteData.content.trim(),
      category: noteData.category,
      tags: noteData.tags,
      images: noteData.images.map(image => image.url),
      isPublished: false
    }

    if (isEditMode.value && editingNoteId.value) {
      // 更新现有笔记为草稿
      await updateNote(editingNoteId.value, {
        ...draftData,
        isPublished: false
      })
      ElMessage.success('草稿更新成功！')
    } else {
      // 保存新草稿
      await saveDraft(draftData)
      ElMessage.success('草稿保存成功！')
    }

    router.push('/note-manage')
  } catch (error: any) {
    console.error('保存草稿失败:', error)
    ElMessage.error(error.message || '保存草稿失败，请重试')
  }
}

// 处理发布
const handlePublish = async () => {
  if (!noteData.content.trim() && noteData.images.length === 0) {
    ElMessage.warning('请输入内容或上传图片')
    return
  }

  if (!noteData.category) {
    ElMessage.warning('请选择分类')
    return
  }

  if (noteData.tags.length === 0) {
    ElMessage.warning('请至少添加一个标签')
    return
  }

  try {
    publishing.value = true

    // 准备发布数据
    const publishData = {
      title: noteData.title.trim() || '无标题',
      content: noteData.content.trim(),
      category: noteData.category,
      tags: noteData.tags,
      images: noteData.images.map(image => image.url),
      isPublished: true
    }

    if (isEditMode.value && editingNoteId.value) {
      // 更新现有笔记
      await updateNote(editingNoteId.value, publishData)
    } else {
      // 发布新笔记
      await publishNote(publishData)
    }
    // 由于响应拦截器的处理，成功时不会进入catch，直接执行以下代码
    ElMessage.success(isEditMode.value ? '笔记更新成功！' : '发布成功！')
    router.push('/note-manage')
  } catch (error: any) {
    ElMessage.error(isEditMode.value ? '更新请求失败：' + error.message : '发布请求失败：' + error.message)
    console.error('发布/更新请求失败：', error)
  } finally {
    publishing.value = false
  }
}

// 文件上传前检查
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return false
  }
  return true
}

// 文件变化处理
const handleFileChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  // 更新fileList以反映最新状态
  fileList.value = uploadFiles
}

// 文件移除处理
const handleFileRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  // 更新fileList以反映最新状态
  fileList.value = uploadFiles

  // 获取要删除的文件的uid
  const removeUid = uploadFile.uid.toString()

  // 在noteData.images中找到并移除对应的图片
  const index = noteData.images.findIndex(image => image.uid === removeUid)
  if (index !== -1) {
    noteData.images.splice(index, 1)
  }
}

// 将文件转换为Base64格式
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // 移除Base64前缀，只保留实际的Base64字符串
      const result = reader.result as string
      const base64String = result.split(',')[1]
      if (base64String) {
        resolve(base64String)
      } else {
        reject(new Error('无法将文件转换为Base64格式'))
      }
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}

// 自定义上传（真实API调用）
const handleCustomUpload = async (options: any) => {
  const { file, onSuccess, onError } = options



  try {
    // 将文件转换为Base64格式
    const base64Image = await fileToBase64(file)

    // 调用图片上传API
    const uploadResponse = await uploadImage({
      image: base64Image,
      name: file.name,
      contentType: file.type
    })

    // 将上传成功的图片URL和uid一起添加到笔记数据中
    noteData.images.push({
      uid: file.uid.toString(),
      url: uploadResponse.url
    })

    onSuccess(uploadResponse)
  } catch (error: any) {

    ElMessage.error('图片上传失败: ' + (error.message || '未知错误'))
    onError(error)
  }
}

// 显示标签输入框
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 处理标签输入确认
const handleInputConfirm = () => {
  if (inputValue.value && !noteData.tags.includes(inputValue.value)) {
    noteData.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 移除标签
const removeTag = (tag: string) => {
  const index = noteData.tags.indexOf(tag)
  if (index > -1) {
    noteData.tags.splice(index, 1)
  }
}

// 添加推荐标签
const addSuggestedTag = (tag: string) => {
  if (!noteData.tags.includes(tag) && noteData.tags.length < 5) {
    noteData.tags.push(tag)
  }
}

// 发布笔记功能已在上方实现
</script>

<style scoped>
:deep(.el-select__wrapper) {
  border-radius: 8px;
}

.publish-note-page {
  /* background-color: #f8f9fa; */
  height: 100%;
}

/* 登录提示页面样式 */
.login-prompt-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  height: 100%;
  border-radius: 24px;
}

.login-prompt-content {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 48px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.login-icon {
  margin-bottom: 24px;
}

.login-icon .icon {
  font-size: 64px;
  color: #ff4757;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.login-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.button-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.button-group .el-button {
  flex: 1;
  min-width: 120px;
}

.publish-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
}

/* 顶部标题栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background-color: white;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.red-button {
  border-radius: 12px;
  background-color: #ff4757;
  border-color: #ff4757;
  color: white;
}

.red-button:hover {
  background-color: #ff3838;
  border-color: #ff3838;
  color: white;
}

.red-button:active {
  background-color: #e63c3c;
  border-color: #e63c3c;
  color: white;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 内容编辑区域 */
.content-area {
  padding: 24px;
}

/* 图片上传区域 */
.image-upload-section {
  margin-bottom: 24px;
}

/* 自定义上传样式 - 增大圆角 */
.custom-upload :deep(.el-upload--picture-card) {
  border-radius: 12px;
}

.custom-upload :deep(.el-upload-list__item) {
  border-radius: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 文本编辑区域 */
.text-editor-section {
  margin-bottom: 24px;
}

.title-input {
  margin-bottom: 16px;
}

.title-input :deep(.el-input__inner) {
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

.title-input :deep(.el-input__inner):focus {
  border-bottom-color: transparent;
  box-shadow: none;
}

.content-textarea :deep(.el-textarea__inner) {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.content-textarea :deep(.el-textarea__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 标签区域 */
.tag-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.tag-input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.selected-tag {
  background-color: #f0f7ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.tag-input {
  width: 120px;
}

.add-tag-btn {
  border-style: dashed;
  border-radius: 8px;
}

.tag-suggestions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.suggestions-title {
  font-size: 14px;
  color: #666;
}

.suggested-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.suggested-tag:hover {
  transform: translateY(-1px);
}

/* 分类选择区域 */
.category-section {
  margin-bottom: 24px;
}

.category-content {
  margin-top: 12px;
}

.category-select {
  width: 100%;
  max-width: 300px;
}

.category-select :deep(.el-input__inner) {
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
}

.category-select :deep(.el-input__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 位置信息区域 */
.location-section {
  margin-bottom: 24px;
}

.location-input :deep(.el-input__inner) {
  border: none;
  border-radius: 0;
  padding: 12px 0;
}

.location-input :deep(.el-input__inner):focus {
  border-bottom-color: transparent;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .publish-container {
    max-width: 100%;
  }

  .header {
    padding: 12px 16px;
  }

  .content-area {
    padding: 16px;
  }

  .tag-suggestions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>