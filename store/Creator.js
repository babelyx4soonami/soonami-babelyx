export default {
  namespaced: true,
  state: {
    creatorListAll: [],
    myFollowingList: [],
    myFollowerList: [],
    myInviteeList: [],
  },
  mutations: {
    reset_creator_lists (state) {
      state.creatorList = []
      state.myFollowingList = []
      state.myFollowerList = []
      state.myInviteeList = []
    },
  },
}
