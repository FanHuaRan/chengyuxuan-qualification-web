import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/bank/search_by_page',
    method: 'get',
    params
  })
}
