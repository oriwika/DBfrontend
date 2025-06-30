import request from '@/utils/request'

// 查询出版社管理列表
export function listPublisher(query) {
  return request({
    url: '/manage/publisher/list',
    method: 'get',
    params: query
  })
}

// 查询出版社管理详细
export function getPublisher(publisherId) {
  return request({
    url: '/manage/publisher/' + publisherId,
    method: 'get'
  })
}

// 新增出版社管理
export function addPublisher(data) {
  return request({
    url: '/manage/publisher',
    method: 'post',
    data: data
  })
}

// 修改出版社管理
export function updatePublisher(data) {
  return request({
    url: '/manage/publisher',
    method: 'put',
    data: data
  })
}

// 删除出版社管理
export function delPublisher(publisherId) {
  return request({
    url: '/manage/publisher/' + publisherId,
    method: 'delete'
  })
}
