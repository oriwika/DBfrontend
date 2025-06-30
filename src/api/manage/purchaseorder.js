import request from '@/utils/request'

// 查询进货订单管理列表
export function listPurchaseorder(query) {
  return request({
    url: '/manage/purchaseorder/list',
    method: 'get',
    params: query
  })
}

// 查询进货订单管理详细
export function getPurchaseorder(orderId) {
  return request({
    url: '/manage/purchaseorder/' + orderId,
    method: 'get'
  })
}

// 新增进货订单管理
export function addPurchaseorder(data) {
  return request({
    url: '/manage/purchaseorder',
    method: 'post',
    data: data
  })
}

// 修改进货订单管理
export function updatePurchaseorder(data) {
  return request({
    url: '/manage/purchaseorder',
    method: 'put',
    data: data
  })
}

// 删除进货订单管理
export function delPurchaseorder(orderId) {
  return request({
    url: '/manage/purchaseorder/' + orderId,
    method: 'delete'
  })
}
