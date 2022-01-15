import { stringify } from 'qs';
import request from '@/utils/request';
import r from 'umi-request';
import { API_URL } from '@/constants'

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'update',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'delete',
    },
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'post',
    },
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'update',
    },
  });
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices(params = {}) {
  return request(`/api/notices?${stringify(params)}`);
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`);
}

// TODO: move this part to constants
// const urlPrefix = 'https://api.acy.finance/bsc-main';
const urlPrefix = 'http://localhost:3001/bsc-main/api';

export async function requireAllocation(network, walletId, projectToken) {
  return r.get(`${API_URL()}/launch/allocation/require`, {
    params: {
      walletId: walletId,
      projectToken: projectToken
    }
  })
}

export async function getAllocationInfo(network, walletId, projectToken) {
  return r.get(`${API_URL()}/launch/allocation`, {
    params: {
      walletId: walletId,
      projectToken: projectToken
    }
  })
}

export async function useAllocation(network, walletId, projectToken, amount) {
  return r.get(`${API_URL()}/launch/allocation/use`, {
    params: {
      walletId: walletId,
      projectToken: projectToken,
      amount: amount
    }
  })
}

export async function getProjects(network) {
  return r.get(`${API_URL()}/launch/projects`)
}

export async function getProjectInfo(network, projectId) {
  return r.get(`${API_URL()}/launch/projects/${projectId}`)
}

