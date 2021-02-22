import request from '@/utils/request'

export function searchAccount(params) {
  return request({
    url: '/account_manage/search_by_page',
    method: 'get',
    params
  })
}

export function saveAccount(params) {
  return request({
    url: '/account_manage/save',
    method: 'post',
    data: params
  })
}

export function deleteAccount(id) {
  return request({
    url: '/account_manage/delete',
    method: 'post',
    params: {"id": id}
  })
}

