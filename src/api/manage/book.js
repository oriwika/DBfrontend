import request from '@/utils/request'

// 查询图书信息管理列表
export function listBook(query) {
  return request({
    url: '/manage/book/list',
    method: 'get',
    params: query
  })
}

// 查询图书信息管理详细
export function getBook(bookId) {
  return request({
    url: '/manage/book/' + bookId,
    method: 'get'
  })
}

// 新增图书信息管理
export function addBook(data) {
  return request({
    url: '/manage/book',
    method: 'post',
    data: data
  })
}

// 修改图书信息管理
export function updateBook(data) {
  return request({
    url: '/manage/book',
    method: 'put',
    data: data
  })
}

// 删除图书信息管理
export function delBook(bookId) {
  return request({
    url: '/manage/book/' + bookId,
    method: 'delete'
  })
}
