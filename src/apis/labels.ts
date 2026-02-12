import request from '@/utils/request'
import type {
  Label,
  LabelsResponse,
  GetLabelsParams,
  CreateLabelData
} from '@/types'

/**
 * 获取标签列表
 * @param params - 查询参数
 * @returns 返回标签列表数据
 */
export function getLabels(params: GetLabelsParams = {}): Promise<LabelsResponse> {
  return request({
    url: '/api/labels',
    method: 'get',
    params,
  })
}

/**
 * 创建新标签
 * @param data - 标签数据
 * @returns 返回创建结果
 */
export function createLabel(data: CreateLabelData): Promise<Label> {
  return request({
    url: '/api/labels',
    method: 'post',
    data,
  })
}

/**
 * 删除标签
 * @param id - 标签ID
 * @returns 返回删除结果
 */
export function deleteLabel(id: string): Promise<void> {
  return request({
    url: `/api/labels/${id}`,
    method: 'delete',
  })
}
