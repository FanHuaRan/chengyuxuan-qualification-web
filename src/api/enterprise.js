import request from '@/utils/request'

export function allEnterprise() {
  return request({
    url: '/enterprise/all',
    method: 'get',
  })
}

export function searchEnterprise(params) {
  return request({
    url: '/enterprise/search_by_page',
    method: 'get',
    params
  })
}

export function saveEnterprise(params) {
  return request({
    url: '/enterprise/save',
    method: 'post',
    data: params
  })
}

export function rechargeEnterprise(params) {
  return request({
    url: '/enterprise/recharge',
    method: 'post',
    data: params
  })
}

export function deleteEnterprise(id) {
  return request({
    url: '/enterprise/delete',
    method: 'post',
    params: {"id": id}
  })
}

