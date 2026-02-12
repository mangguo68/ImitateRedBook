import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Note } from '@/types'

export const useNotesStore = defineStore('notes', () => {
  // 本地笔记列表
  const localNoteList = ref<Note[]>([])
  // 当前选中的笔记
  const selectedNote = ref<Note | null>(null)

  // 设置本地笔记列表
  const setLocalNoteList = (notes: Note[]) => {
    localNoteList.value = notes
  }

  // 设置选中的笔记
  const setSelectedNote = (note: Note | null) => {
    selectedNote.value = note
  }

  // 根据ID获取笔记
  const getNoteById = (id: string): Note | undefined => {
    return localNoteList.value.find((note: Note) => note._id === id)
  }

  // 更新笔记状态
  const updateNoteStatus = (id: string, updates: Partial<Omit<Note, '_id'>>) => {
    const index = localNoteList.value.findIndex((note: Note) => note._id === id)
    if (index !== -1) {
      localNoteList.value[index] = { ...localNoteList.value[index], ...updates } as Note
      // 如果更新的是当前选中的笔记，也更新 selectedNote
      if (selectedNote.value && selectedNote.value._id === id) {
        selectedNote.value = { ...selectedNote.value, ...updates } as Note
      }
    }
  }

  // 清空本地笔记列表
  const clearLocalNoteList = () => {
    localNoteList.value = []
  }

  return {
    localNoteList,
    selectedNote,
    setLocalNoteList,
    setSelectedNote,
    getNoteById,
    updateNoteStatus,
    clearLocalNoteList,
  }
})
