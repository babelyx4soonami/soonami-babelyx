export default {
  namespaced: true,
  state: {
    // 以下变量除了在 part-aichat 里使用，其他地方并未用到，但是为了让用户切换页面后仍然保留原设置，定义在store里
    chatList4All: [],
    chatList4One: {},
    promptNow: '',
    promptStory: [{ text: '' }],
    promptFileList: [],
    aicodeNow: '',
    aintNow: {},
    contextToRemember: 0,
    temperature: 0,
    imgNumToCreate: 1,
    aippListAll: [],
    aippListMyCreated: [],
    autoTTS: false,
    allChatInOne: false,
    aippToModify: {}
  },
  getters: {
  },
  mutations: {
    reset_aichat (state) {
      state.chatList4All = []
      state.chatList4One = {}
      state.promptNow = ''
      state.promptStory = [{ text: '' }]
      state.promptFileList = []
      state.aicodeNow = ''
      state.aintNow = {}
      state.contextToRemember = 0
      state.temperature = 0
      state.imgNumToCreate = 1
      state.aippListAll = []
      state.aippListMyCreated = []
      state.autoTTS = false
      state.allChatInOne = false
      state.aippToModify = {}
    },
  },
  actions: {},
}
