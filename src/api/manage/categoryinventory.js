import request from '@/utils/request'

// 查询各类别图书库存详情列表
export function listCategoryinventory(query) {
  return request({
    url: '/manage/categoryinventory/list',
    method: 'get',
    params: query
  })
}

// 查询各类别图书库存详情详细
export function getCategoryinventory(categoryId) {
  return request({
    url: '/manage/categoryinventory/' + categoryId,
    method: 'get'
  })
}

// 新增各类别图书库存详情
export function addCategoryinventory(data) {
  return request({
    url: '/manage/categoryinventory',
    method: 'post',
    data: data
  })
}

// 修改各类别图书库存详情
export function updateCategoryinventory(data) {
  return request({
    url: '/manage/categoryinventory',
    method: 'put',
    data: data
  })
}

// 删除各类别图书库存详情
export function delCategoryinventory(categoryId) {
  return request({
    url: '/manage/categoryinventory/' + categoryId,
    method: 'delete'
  })
}
