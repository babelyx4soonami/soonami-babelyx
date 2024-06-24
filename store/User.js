export default {
  namespaced: true,
  state: {
    onlineUser: { // 考虑改名 whoami
      usid: '',
      nickname: '',
      portrait: '',
      kycStateL1: '',
      balanceTUC: '',
    },
    hostUser: {
      //blockState: '',
      //followState: ''
    },

    //    myTxListAll: [],
  },
  getters: {},
  mutations: {
    reset_online_user (state) {
      //      state.myTxListAll = []
    },
  },
  actions: {},
}
