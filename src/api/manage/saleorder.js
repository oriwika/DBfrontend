import request from '@/utils/request'

// 查询销售订单管理列表
export function listSaleorder(query) {
  return request({
    url: '/manage/saleorder/list',
    method: 'get',
    params: query
  })
}

// 查询销售订单管理详细
export function getSaleorder(orderId) {
  return request({
    url: '/manage/saleorder/' + orderId,
    method: 'get'
  })
}

// 新增销售订单管理
export function addSaleorder(data) {
  return request({
    url: '/manage/saleorder',
    method: 'post',
    data: data
  })
}

// 修改销售订单管理
export function updateSaleorder(data) {
  return request({
    url: '/manage/saleorder',
    method: 'put',
    data: data
  })
}

// 删除销售订单管理
export function delSaleorder(orderId) {
  return request({
    url: '/manage/saleorder/' + orderId,
    method: 'delete'
  })
}
