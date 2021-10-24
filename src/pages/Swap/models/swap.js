import { queryBasicProfile, queryAdvancedProfile } from '@/services/api';

export default {
  namespace: 'swap',

  state: {
    basicGoods: [],
    advancedOperation1: [],
    advancedOperation2: [],
    advancedOperation3: [],
    token0: "",
    token1: ""
  },

  effects: {
    *fetchBasic(_, { call, put }) {
      const response = yield call(queryBasicProfile);
      yield put({
        type: 'show',
        payload: response,
      });
    },
    *fetchAdvanced({ callback }, { call, put }) {
      const response = yield call(queryAdvancedProfile);

      callback && callback(response);

      yield put({
        type: 'show',
        payload: response,
      });
    },
  },

  reducers: {
    show(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateTokens(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  },
};
