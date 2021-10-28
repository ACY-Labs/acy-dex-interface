import { queryBasicProfile, queryAdvancedProfile } from '@/services/api';

export default {
  namespace: 'liquidity',

  state: {
    basicGoods: [],
    advancedOperation1: [],
    advancedOperation2: [],
    advancedOperation3: [],
    
    token0: '',
    token1: '',
    refreshTable: false,
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
    setAddTokens(state, { payload }) {
      return {
        ...state, 
        ...payload,
      }
    },
    setRefreshTable(state, { payload }) {
      console.log("refreshTable is set in model");
      return {
        ...state, 
        refreshTable: payload
      }
    }
  },
};
