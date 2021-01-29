import request from '@/utils/request'

export function searchQuestionnaireCommitByPhone(phone) {
  return request({
    url: '/questionnaire_commit/search_by_phone',
    method: 'get',
    params: {
      phone: phone
    }
  })
}
