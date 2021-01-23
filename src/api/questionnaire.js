import request from '@/utils/request'

export function searchQuestionnaire(params) {
  return request({
    url: '/questionnaire/search_by_page',
    method: 'get',
    params
  })
}

export function saveQuestionnaire(params) {
  return request({
    url: '/questionnaire/save',
    method: 'post',
    data: params
  })
}

export function deleteQuestionnaire(id) {
  return request({
    url: '/questionnaire/delete',
    method: 'post',
    params: {"id": id}
  })
}

export function updateQuestionnaireStatus(params) {
  return request({
    url: '/questionnaire/update_status',
    method: 'post',
    params: params
  })
}
