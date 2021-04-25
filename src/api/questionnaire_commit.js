import request from '@/utils/request'

export function searchQuestionnaireCommit(customerId) {
  return request({
    url: '/questionnaire_commit/search',
    method: 'get',
    params: {
      customerId: customerId
    }
  })
}
