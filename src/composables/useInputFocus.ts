import { ref } from 'vue'

export function useInputFocus() {
    const isInputFocused = ref(false)
    const commentInputRef = ref<HTMLInputElement | null>(null)

    // 处理输入框聚焦
    const handleInputFocus = () => {
        isInputFocused.value = true
        // 延迟一点时间，等待Vue完成重新渲染，然后聚焦到新的输入框
        setTimeout(() => {
            commentInputRef.value?.focus()
        }, 100)
    }

    // 处理输入框失焦
    const handleInputBlur = () => {
        // 不自动设置 isInputFocused 为 false，保持焦点状态
    }

    // 取消回复
    const handleCancelReply = () => {
        isInputFocused.value = false
    }

    return {
        isInputFocused,
        commentInputRef,
        handleInputFocus,
        handleInputBlur,
        handleCancelReply
    }
}