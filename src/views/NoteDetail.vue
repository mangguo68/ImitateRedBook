<script setup lang="ts">
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { computed, ref, watch, onMounted } from 'vue';
import DetailContent from '@/components/DetailContent.vue'
import type { Note } from '@/types'
import { getNoteDetail } from '@/apis/notes'
import { ElMessage } from 'element-plus'
import { useNotesStore } from '@/stores/notes'

// 获取store
const notesStore = useNotesStore()

// 1. 接收 props
const props = defineProps<{
    dialogVisible: boolean
    note?: Note | null
    noteId?: string
}>();

// 2. 定义 emit
const emit = defineEmits(['update:dialogVisible']);

// 3. 核心：一行 computed 替代 ref + watch
const localVisible = computed({
    get: () => props.dialogVisible, // 读取 props 值
    set: (val) => emit('update:dialogVisible', val) // 修改时通知父组件
});

// 4. 本地笔记数据
const localNote = ref<Note | null>(props.note || null);
const loading = ref(false);
const error = ref('');

// 5. 监听 noteId 变化，获取笔记数据
watch(() => props.noteId, async (newNoteId) => {
    if (newNoteId && props.dialogVisible) {
        await fetchNoteData(newNoteId);
    }
}, { immediate: true });

// 6. 监听 note 变化
watch(() => props.note, (newNote) => {
    if (newNote) {
        localNote.value = newNote;
        // 当接收到note数据时，更新store
        notesStore.setSelectedNote(newNote);
    }
});

// 7. 监听 dialogVisible 变化
watch(() => props.dialogVisible, async (visible) => {
    if (visible && props.noteId) {
        await fetchNoteData(props.noteId);
    }
});

// 8. 组件挂载时获取数据
onMounted(async () => {
    if (props.dialogVisible && props.noteId) {
        await fetchNoteData(props.noteId);
    }
});

// 9. 获取笔记数据的方法
async function fetchNoteData(noteId: string) {
    if (!noteId) return;

    loading.value = true;
    error.value = '';

    try {
        const result = await getNoteDetail(noteId);
        localNote.value = result;
        // 获取到数据后更新store
        notesStore.setSelectedNote(result);
    } catch (err) {
        error.value = '获取笔记详情失败';
        ElMessage.error('获取笔记详情失败');
        console.error('获取笔记详情失败:', err);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div>
        <el-dialog v-model="localVisible" :show-close="false" width="500">
            <template #header="{ close }">
                <div class="my-header absolute top-3 right-3">
                    <el-button circle class="rounded-full!" @click="close" :icon="CircleCloseFilled">
                    </el-button>
                </div>
            </template>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="10" animated />
            </div>

            <!-- 错误状态 -->
            <div v-else-if="error" class="error-container">
                <el-alert :title="error" type="error" show-icon :closable="false" />
                <el-button type="primary" @click="fetchNoteData(props.noteId!)" style="margin-top: 16px;">
                    重试
                </el-button>
            </div>

            <!-- 笔记内容 -->
            <DetailContent v-else-if="localNote" @close="localVisible = false" />

            <!-- 无数据状态 -->
            <div v-else class="empty-container">
                <el-empty description="暂无笔记数据" />
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dialog) {
    border-radius: 24px;
    width: 1200px;
    height: 800px;
}

:deep(.el-dialog__body) {
    height: 100%;
}
</style>