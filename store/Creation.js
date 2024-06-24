export default {
  namespaced: true,
  state: {
    cidNow: '', // to be removed together with base-service
    creationNow: {
      // likeState
    },

    // 当前被编辑的作品
    pexdataRaw: [{ text: '' }],
    openTitle: '',
    openCover: '',
    //
    allowViewer: true,
    priceViewerPact: '',
    coinViewerPact: 'TUC',
    //
    allowHolder: false,
    priceHolderPact: '',
    coinHolderPact: 'TUC',
    quotaHolderPact: '',
    //
    allowOwner: false,
    priceOwnerPact: '',
    coinOwnerPact: 'TUC',

    creationListAll: [],
    myCollectionAsCreator: [],
    myCollectionAsOwner: [],
    myCollectionAsHolder: [],
    myCollectionAsViewer: [],
  },
  mutations: {
    reset_pexdataRaw (state) {
      state.pexdataRaw = [{ text: '' }]
      state.openTitle = ''
      state.openCover = ''
      state.allowViewer = true
      state.priceViewerPact = ''
      state.coinViewerPact = 'TUC'
      //
      state.allowHolder = false
      state.priceHolderPact = ''
      state.coinHolderPact = 'TUC'
      state.quotaHolderPact = ''
      //
      state.allowOwner = false
      state.priceOwnerPact = ''
      state.coinOwnerPact = 'TUC'
    },
    reset_creation_lists (state) {
      state.creationListAll = []
      state.myCollectionAsCreator = []
      state.myCollectionAsOwner = []
      state.myCollectionAsHolder = []
      state.myCollectionAsViewer = []
    },
  },
}
