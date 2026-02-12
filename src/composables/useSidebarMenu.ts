import { ElMessage } from 'element-plus'

export function useSidebarMenu() {
  const handleSettings = () => {
    console.log('打开设置')
    ElMessage.info('设置功能开发中')
  }

  const handleHelp = () => {
    console.log('打开帮助')
    ElMessage.info('帮助功能开发中')
  }

  const handleAbout = () => {
    console.log('关于我们')
    ElMessage.info('关于功能开发中')
  }

  return {
    handleSettings,
    handleHelp,
    handleAbout
  }
}
