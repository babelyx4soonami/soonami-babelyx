export default {
  namespaced: true,
  state: {
    autologgingState: 'WAITING',
    phone: '',
    usid: '',
    inviterHaid: '', // process.env.NODE_ENV === 'production' ? 'b75e75' : '7ad16d', // 邀请码
    verifyExpireAt: 0,
  },
  getters: {},
  mutations: {},
  actions: {},
}
