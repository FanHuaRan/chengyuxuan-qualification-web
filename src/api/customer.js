import request from '@/utils/request'

export function searchCustomer(params) {
  return request({
    url: '/customer/search_by_page',
    method: 'get',
    params
  })
}

export function updateCustomerStatus(params) {
  return request({
    url: '/customer/update_status',
    method: 'post',
    data: params
  })
}
