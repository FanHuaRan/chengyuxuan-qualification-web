import request from '@/utils/request'

export function allBank() {
  return request({
    url: '/bank/all',
    method: 'get',
  })
}

export function searchBank(params) {
  return request({
    url: '/bank/search_by_page',
    method: 'get',
    params
  })
}

export function saveBank(params) {
  return request({
    url: '/bank/save',
    method: 'post',
    data: params
  })
}

export function deleteBank(id) {
  return request({
    url: '/bank/delete',
    method: 'post',
    params: {"id": id}
  })
}

