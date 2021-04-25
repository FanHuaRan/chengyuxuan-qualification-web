import request from '@/utils/request'

export function getEnterpriseQuestionnaireConfig() {
  return request({
    url: '/enterprise_questionnaire_config/get',
    method: 'get',
  })
}

export function saveEnterpriseQuestionnaireConfig(params) {
  return request({
    url: '/enterprise_questionnaire_config/save',
    method: 'post',
    data: params
  })
}

