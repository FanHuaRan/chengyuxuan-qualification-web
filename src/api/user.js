import request from '@/utils/request'
import md5 from 'js-md5';

export function login(data) {
  return request({
    url: '/oauth/token',
    method: 'post',
    transformRequest: [
      function (data) {
        let ret = ''
        for (let it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'));
        return ret
      }
    ],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data:{
      'grant_type': 'password',
      'username':   data.username,
      'password': md5(data.password),
      'client_id': 'client_qualification_web',
      'client_secret': 'c963b182e7539a2b073e8a8fbfd85356',
    }
  })
}

export function getInfo() {
  return request({
    url: '/account/me',
    method: 'get',
  })
}

export function logout() {
  return request({
    url: '/account/logout',
    method: 'post'
  })
}
