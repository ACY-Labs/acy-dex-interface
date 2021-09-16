export default {
  namespace: 'transaction',

  state: {
    transactions: [],
    status:''
  },

  effects: {
    *addTransaction({ payload }, { put }) {
      yield put({
        type: 'putTransaction',
        payload:{
          ...payload
        }
      });
    },
  },

  reducers: {
    putTransaction(state, { payload }) {
      return {
        ...state,
       ...payload
      };
    },
  },
};
