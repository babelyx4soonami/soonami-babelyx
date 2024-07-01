<script>

export default {

  data () {
    return {
      i18nPageTitle: { zhCN: '创作秀', enUS: 'Creation Show' },

      commentStory: [{ text: '' }],
      publishing: false,

      commentList: [],
      loadMoreStatus4Comment: '',

      viewerList: [],
      loadMoreStatus4Viewer: '',

      holderList: [],
      loadMoreStatus4Holder: '',

      likerList: [],
      loadMoreStatus4Liker: '',

      takeLimit: 10,

      payFeedback: '', // 支付购买的反馈

      userSecword: '',

      readyToShow: false,

      reportReason: '',
      loadingReport: false,
    }
  },
  computed: {
    stockNumber () {
      // 库存。可以为 0，n, Infinity
      return parseInt(wo.ss.Creation.creationNow.holderPact?.quota || wo.ss.Creation.creationNow.holderPact?.share)
        ? parseInt(wo.ss.Creation.creationNow.holderPact?.quota || wo.ss.Creation.creationNow.holderPact?.share) - parseInt(wo.ss.Creation.creationNow.countHolder)
        : Infinity // quota 为空，为0，为Infinity
    },
    depositAmountMinViewer () {
      let min = 0
      if (wo.ss.User.onlineUser.balanceTUC < wo.ss.Creation.creationNow.viewerPact?.amount) {
        min = Number(wo.tt.formatMoney((wo.ss.Creation.creationNow.viewerPact?.amount - wo.ss.User.onlineUser.balanceTUC) / wo.envar.coinToTUC?.[wo.ss.i18n.depositCoinNow.coinCode]))
      }
      return Math.max(wo.envar.depositAmountMin, min)
    },
    depositAmountMinHolder () {
      let min = 0
      if (wo.ss.User.onlineUser.balanceTUC < wo.ss.Creation.creationNow.holderPact?.amount) {
        min = Number(wo.tt.formatMoney((wo.ss.Creation.creationNow.holderPact?.amount - wo.ss.User.onlineUser.balanceTUC) / wo.envar.coinToTUC?.[wo.ss.i18n.depositCoinNow.coinCode]))
      }
      return Math.max(wo.envar.depositAmountMin, min)
    },
    depositAmountMinOwner () {
      let min = 0
      if (wo.ss.User.onlineUser.balanceTUC < wo.ss.Creation.creationNow.ownerPact?.amount) {
        min = Number(wo.tt.formatMoney((wo.ss.Creation.creationNow.ownerPact?.amount - wo.ss.User.onlineUser.balanceTUC) / wo.envar.coinToTUC?.[wo.ss.i18n.depositCoinNow.coinCode]))
      }
      return Math.max(wo.envar.depositAmountMin, min)
    },
    creationTitle () {
      return wo.ss.Creation.creationNow?.openTitle || `${wo.ll({ zhCN: '无题', enUS: 'Untitled' })} #${wo.ss.Creation.creationNow.pexdataCidHash?.slice?.(-6)}`
    },
    removedByOne () {
      return [wo.ss.Creation.creationNow.ownerState, wo.ss.Creation.creationNow.creatorState].includes('REMOVED')
    },
    removedByMe () {
      return wo.ss.User.onlineUser.usid === wo.ss.Creation.creationNow.ownerUsid && wo.ss.Creation.creationNow.ownerState === 'REMOVED'
        || wo.ss.User.onlineUser.usid === wo.ss.Creation.creationNow.creatorUsid && wo.ss.Creation.creationNow.creatorState === 'REMOVED'
    },
    linkedByMe () {
      return wo.ss.Creation.creationNow.mytxHold_txAmount || wo.ss.Creation.creationNow.mytxView_txAmount
    },
    belongToMe () {
      return [wo.ss.Creation.creationNow.ownerUsid, wo.ss.Creation.creationNow.creatorUsid].includes(wo.ss.User.onlineUser.usid)
    },
    reportEmpty () {
      return !this.reportReason.trim?.()
    }
  },
  async onLoad () {
    await wo.tt.wait_autologin() // 先确认当前身份
    this.loadMoreStatus4Comment = 'loading'
    if (wo.ss.Creation.creationNow.pexdataCidHash) { // 从列表页面来的，已经有了 完整的 creationNow.* 信息
      this.readyToShow = true // 已经可以显示了
      // wo.tt.showLoading()
      const { _state, creation, commentList } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_single_creation',
        apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash },
      })
      // wo.tt.hideLoading()
      if (wo.bok(_state)) {
        wo.ss.Creation.creationNow = creation
        this.commentList = commentList
      } else { // 这时要显示“该作品不存在”
        wo.ss.Creation.creationNow.pexdataCidHash = undefined
      }
    } else if (this.$route?.query?.pexdataCidHash || this.$route?.query?.pexdatacidhash) { // 用户直接打开链接进入
      //wo.tt.showLoading() // 不知为何，如果把两个showLoading合并写到前面去，那么走这个分支时，会提前关闭loading圈，有1～2秒钟空白页面后才会显示作品
      const { _state, creation, commentList } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_single_creation',
        apiWhat: { pexdataCidHash: this.$route?.query?.pexdataCidHash || this.$route?.query?.pexdatacidhash }
      })
      if (wo.bok(_state)) {
        wo.ss.Creation.creationNow = creation
        this.commentList = commentList
      }
      //wo.tt.hideLoading()
    }
    this.readyToShow = true // 如果不存在目标，也要进入显示模式
    if (this.commentList?.length >= wo.ss.Creation.creationNow.countComment) {
      this.loadMoreStatus4Comment = 'noMore'
    } else {
      this.loadMoreStatus4Comment = 'more'
    }
  },
  onShow () {
  },
  // onPullDownRefresh(){
  // },
  // onReachBottom() {
  // },
  methods: {
    visit_creator () {
      let { creatorUsid: usid, portrait, nickname, countAsCreator, countAsOwner, countRemoved, countFollower, countFollowing } = wo.ss.Creation.creationNow
      wo.ss.User.hostUser = { usid, portrait, nickname, countAsCreator, countAsOwner, countRemoved, countFollower, countFollowing }
      uni.navigateTo({ url: 'show-creator?hostUsid=' + wo.ss.Creation.creationNow.creatorUsid })
    },
    visit_comment_author (comment) {
      wo.ss.User.hostUser = { usid: comment.commentFromUsid, portrait: comment.portrait, nickname: comment.nickname, countAsCreator: comment.countAsCreator, countAsOwner: comment.countAsOwner, countRemoved: comment.countRemoved, countFollower: comment.countFollower, countFollowing: comment.countFollowing }
      uni.navigateTo({ url: 'show-creator?hostUsid=' + comment.commentFromUsid })
    },

    async to_report_creation () {
      if (!wo.tt.check_online()) {
        return
      }
      if (this.reportEmpty) {
        return
      }
      this.loadingReport = true
      let { _state } = await wo.tt.callBase({
        apiWho: 'User',
        apiTodo: 'report_abuse',
        apiWhat: {
          reportTargetId: wo.ss.Creation.creationNow.pexdataCidHash,
          reportTargetType: 'CREATION',
          reportReason: this.reportReason,
        },
      })
      this.loadingReport = false
      if (wo.bok(_state)) {
        this.$refs.poptoComplain.close()
        this.reportReason = ''
        wo.tt.showToast({ title: { zhCN: '您的举报已成功提交', enUS: 'Your report has been submitted successfully' } })
      } else {
        wo.tt.showToast({ title: { zhCN: '举报提交失败，请稍候再试一次', enUS: 'Failed to submit report, please try again later' } })
      }
    },

    async to_comment_creation () {
      if (!wo.tt.check_online()) {
        return
      }

      this.commentStory = wo.tt.filter_story(this.commentStory)
      if (!this.commentStory?.length) {
        this.commentStory = [{ text: '' }]
        wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '评论是空的。请先写点儿什么！', enUS: 'Comment is empty. Please write something!' }) })
        return
      }

      wo.tt.showLoading({ mask: wo.envar.waitMask })
      this.publishing = true
      let { _state, comment, rejectReason } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'comment_creation',
        apiWhat: {
          commentStory: this.commentStory,
          commentTarget: wo.ss.Creation.creationNow.pexdataCidHash,
        },
      })
      this.publishing = false
      wo.tt.hideLoading()

      if (wo.bok(_state)) {
        comment.nickname = wo.ss.User.onlineUser.nickname
        comment.portrait = wo.ss.User.onlineUser.portrait
        this.commentList.unshift(comment)
        this.commentStory = [{ text: '' }]
        wo.ss.Creation.creationNow.countComment++
        wo.tt.showToast({ type: wo.color.GREEN, title: wo.ll({ zhCN: '评论成功啦', enUS: 'You have added a comment on this creation' }) })
      } else if (wo.ss.i18n.userlandCode === 'CN' && wo.envar.banChina?.includes?.(_state)) { // _state === 'CENSOR_BAD_IN_CN'
        wo.tt.showModal({
          title: { zhCN: '您的评论疑似违反中国审查政策无法发表', enUS: 'Your comment was rejected by China moderation policy' },
          content: rejectReason,
          showCancel: false,
        })
      } else {
        wo.tt.showToast({ type: wo.color.RED, title: wo.envar.sysdown, duration: 5000 })
      }
    },

    async to_delete_comment (comment, index) {
      if (!wo.tt.check_online()) {
        return
      }
      if (!comment?.commentFromUsid || wo.ss.User.onlineUser.usid !== comment.commentFromUsid) {
        return
      }
      wo.tt.showModal({
        title: { zhCN: '您要删除这个评论吗？', enUS: 'To delete this comment?' },
        content: Object.values(comment.commentStory?.[0])?.[0],
        confirmText: { zhCN: '删除', enUS: 'Delete' },
        cancelText: { zhCN: '取消', enUS: 'Cancel' },
        showCancel: true,
        success: async ({ confirm, cancel }) => {
          if (cancel) return
          wo.tt.showLoading()
          let { _state } = await wo.tt.callBase({ apiWho: 'Creation', apiTodo: 'delete_comment', apiWhat: { commentUuid: comment.commentUuid } })
          wo.tt.hideLoading()
          if (wo.bok(_state)) {
            wo.ss.Creation.creationNow.countComment--
            // 从列表中删除
            this.commentList.splice(index, 1)
            wo.tt.showToast({ title: wo.ll({ zhCN: '已成功删除', enUS: 'Deleted successfully' }) })
          } else {
            wo.tt.showToast({ title: wo.ll({ zhCN: '发生故障，没有删除', enUS: 'Something malfuntioned, this creation is not deleted' }) })
          }
        },
      })
    },

    async to_toggle_vote () {
      if (!wo.tt.check_online()) {
        return
      }

      if ([wo.ss.Creation.creationNow.creatorUsid, wo.ss.Creation.creationNow.ownerUsid].includes(wo.ss.User.onlineUser.usid)) {
        this.show_liker_list()
      } else if (wo.ss.Creation.creationNow.likeState === 'LIKED') {
        wo.tt.showLoading({ mask: wo.envar.waitMask })
        let { _state, mylike } = await wo.tt.callBase({
          apiWho: 'Creation',
          apiTodo: 'cancel_upvote_creation',
          apiWhat: {
            likeTarget: wo.ss.Creation.creationNow.pexdataCidHash,
          },
        })
        wo.tt.hideLoading()
        if (wo.bok(_state)) {
          wo.ss.Creation.creationNow.countLike--
          wo.ss.Creation.creationNow.likeState = 'UNLIKED'
          // togggle 后图标本身就有明显变化，不需要再弹框通知 wo.tt.showToast({ type: wo.color.GREEN, title: wo.ll({ zhCN: '已取消支持', enUS: 'You have canceled upvote for this creation' }) })
        } else {
          wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '出了点问题，没有取消支持', enUS: 'Something is wrong, your upvote is not canceled' }) })
        }
      } else {
        wo.tt.showLoading({ mask: wo.envar.waitMask })
        let { _state, mylike } = await wo.tt.callBase({
          apiWho: 'Creation',
          apiTodo: 'upvote_creation',
          apiWhat: {
            likeTarget: wo.ss.Creation.creationNow.pexdataCidHash,
          },
        })
        wo.tt.hideLoading()
        if (wo.bok(_state)) {
          wo.ss.Creation.creationNow.countLike++
          wo.ss.Creation.creationNow.likeState = 'LIKED'
          // togggle 后图标本身就有明显变化，不需要再弹框通知 wo.tt.showToast({ type: wo.color.GREEN, title: wo.ll({ zhCN: '支持成功', enUS: 'You have upvoted on this creation' }) })
        } else {
          wo.tt.showToast({ type: wo.color.RED, title: wo.envar.sysdown, duration: 5000 })
        }
      }
    },

    to_toggle_hide () {
      if (wo.ss.Creation.creationNow.hideState === 'HIDED') {
        this.to_unhide_creation()
      } else {
        this.to_hide_creation()
      }
    },

    async to_unhide_creation () {
      if (!wo.tt.check_online()) {
        return
      }
      uni.showModal({
        title: wo.ll({ zhCN: '您要恢复显示这个作品吗？', enUS: 'To unhide this creation?' }),
        content: wo.envar.modalPrefix + this.creationTitle + '\n\n' + wo.ll({ zhCN: '您将能够查看该作品。如果您将来改变了意愿，您可以随时再次隐藏', enUS: 'You will be able to see this creation\'s content. Should you change mind in the future, you can hide it again at any time' }),
        confirmText: wo.ll({ zhCN: '恢复显示', enUS: 'Unhide' }),
        cancelText: wo.ll({ zhCN: '取消', enUS: 'Cancel' }),
        showCancel: true,
        success: async ({ confirm, cancel }) => {
          if (cancel) return
          wo.tt.showLoading()
          let { _state, creation } = await wo.tt.callBase({ apiWho: 'Creation', apiTodo: 'unhide_creation', apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash } })
          wo.tt.hideLoading()
          if (wo.bok(_state)) {
            wo.ss.Creation.creationNow.hideState = 'UNHIDED'
            wo.ss.Creation.creationNow.countHide--
            // 更新列表
            wo.ss.Creation.myCollectionAsViewer.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.hideState = 'UNHIDED'
              }
            })
            wo.ss.Creation.myCollectionAsHolder.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.hideState = 'UNHIDED'
              }
            })
            // 本来是 hided 的，不会被后台送到 creationListAll 
            // wo.ss.Creation.creationListAll.forEach((item,index) => {
            //   if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash){
            //     item.hideState = 'UNHIDED'
            //   }
            // })
            wo.tt.showToast({ title: wo.ll({ zhCN: '已恢复显示', enUS: 'Unhidden successfully' }) })
          } else {
            wo.tt.showToast({ title: wo.ll({ zhCN: '发生故障，没有恢复显示', enUS: 'Something malfuntioned, this creation is not unhidden' }) })
          }
        },
      })

    },

    async to_hide_creation () {
      if (!wo.tt.check_online()) {
        return
      }
      uni.showModal({
        title: wo.ll({ zhCN: '您要隐藏这个作品吗？', enUS: 'To hide this creation?' }),
        content: wo.envar.modalPrefix + this.creationTitle + '\n\n' + wo.ll({ zhCN: '您将无法查看该作品。如果您将来改变了意愿，您可以随时解除隐藏', enUS: 'You will no longer see this creation\'s content. Should you change mind in the future, you can unhide it at any time' }),
        confirmText: wo.ll({ zhCN: '隐藏', enUS: 'Hide' }),
        cancelText: wo.ll({ zhCN: '取消', enUS: 'Cancel' }),
        showCancel: true,
        success: async ({ confirm, cancel }) => {
          if (cancel) return
          wo.tt.showLoading()
          let { _state, creation } = await wo.tt.callBase({ apiWho: 'Creation', apiTodo: 'hide_creation', apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash } })
          wo.tt.hideLoading()
          if (wo.bok(_state)) {
            wo.ss.Creation.creationNow.hideState = 'HIDED'
            wo.ss.Creation.creationNow.countHide++
            // 更新列表
            wo.ss.Creation.myCollectionAsViewer.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.hideState = 'HIDED'
                return
              }
            })
            wo.ss.Creation.myCollectionAsHolder.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.hideState = 'HIDED'
                return
              }
            })
            wo.ss.Creation.creationListAll.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                wo.ss.Creation.creationListAll.splice(index, 1)
              }
            })
            wo.tt.showToast({ title: wo.ll({ zhCN: '已成功隐藏', enUS: 'Hidden successfully' }) })
          } else {
            wo.tt.showToast({ title: wo.ll({ zhCN: '发生故障，没有隐藏', enUS: 'Something malfuntioned, this creation is not hidden' }) })
          }
        },
      })
    },

    async to_toggle_creation_onshelf () {
      if (this.removedByMe) {
        this.to_restore_creation()
      } else {
        this.to_remove_creation()
      }
    },
    async to_restore_creation () {
      if (!wo.tt.check_online()) {
        return
      }
      uni.showModal({
        title: wo.ll({ zhCN: '您要恢复上架这个作品吗？', enUS: 'To restore this creation?' }),
        content: wo.envar.modalPrefix + this.creationTitle + '\n\n' + wo.ll({ zhCN: '作为当前主人，您能够恢复本作品，其他人将重新发现该作品。', enUS: 'As the current owner, you can restore this creation to exhibition, everyone will be able to find it.' }),
        confirmText: wo.ll({ zhCN: '恢复上架', enUS: 'Restore' }),
        cancelText: wo.ll({ zhCN: '取消', enUS: 'Cancel' }),
        showCancel: true,
        success: async ({ confirm, cancel }) => {
          if (cancel) return
          wo.tt.showLoading()
          let { _state, creation } = await wo.tt.callBase({ apiWho: 'Creation', apiTodo: 'restore_creation', apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash } })
          wo.tt.hideLoading()
          if (wo.bok(_state)) {
            wo.ss.Creation.creationNow.ownerState = creation.ownerState
            wo.ss.Creation.creationNow.creatorState = creation.creatorState
            // 更新列表
            wo.ss.Creation.myCollectionAsCreator.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.ownerState = creation.ownerState
                item.creatorState = creation.creatorState
              }
            })
            wo.ss.Creation.myCollectionAsOwner.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.ownerState = creation.ownerState
                item.creatorState = creation.creatorState
              }
            })
            wo.tt.showToast({ title: wo.ll({ zhCN: '已成功恢复上架', enUS: 'Restored successfully' }) })
          } else {
            wo.tt.showToast({ title: wo.ll({ zhCN: '发生故障，没有恢复上架', enUS: 'Something malfuntioned, this creation is not restored' }) })
          }
        },
      })
    },
    async to_remove_creation () {
      // 当前主人能够把作品下架 from public listing，不影响已经存在的 creator/holder/viewer
      if (!wo.tt.check_online()) {
        return
      }
      uni.showModal({
        title: wo.ll({ zhCN: '您要下架这个作品吗？', enUS: 'To remove this creation?' }),
        content: wo.envar.modalPrefix + this.creationTitle + '\n\n' + wo.ll({ zhCN: '本作品将从您的公开展览中移除，其他人将无法浏览该作品。如果您将来改变了意愿，您可以随时重新上架。', enUS: 'This creation will be removed from your exhibition. Should you change mind in the future, you can restore it again.' }),
        // { zhCN: '下架本作品后，除了当前主人和原创者、已经支付的解密或持有者之外，其他人将无法浏览该作品。如果您将来改变了意愿，您可以随时重新上架。', enUS: 'After removing this creation from exhibition, everyone will no longer see it except for those who already paid to decrypt or hold it. Should you change mind in the future, you can restore it again.' }
        confirmText: wo.ll({ zhCN: '下架', enUS: 'Remove' }),
        cancelText: wo.ll({ zhCN: '取消', enUS: 'Cancel' }),
        showCancel: true,
        success: async ({ confirm, cancel }) => {
          if (cancel) return
          wo.tt.showLoading()
          let { _state, creation } = await wo.tt.callBase({ apiWho: 'Creation', apiTodo: 'remove_creation', apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash } })
          wo.tt.hideLoading()
          if (wo.bok(_state)) {
            wo.ss.Creation.creationNow.ownerState = creation.ownerState
            wo.ss.Creation.creationNow.creatorState = creation.creatorState
            // 更新列表
            wo.ss.Creation.myCollectionAsCreator.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.ownerState = creation.ownerState
                item.creatorState = creation.creatorState
              }
            })
            wo.ss.Creation.myCollectionAsOwner.forEach((item, index) => {
              if (item.pexdataCidHash === wo.ss.Creation.creationNow.pexdataCidHash) {
                item.ownerState = creation.ownerState
                item.creatorState = creation.creatorState
              }
            })
            wo.tt.showToast({ title: wo.ll({ zhCN: '已成功下架', enUS: 'Removed successfully' }) })
          } else {
            wo.tt.showToast({ title: wo.ll({ zhCN: '发生故障，没有下架', enUS: 'Something malfuntioned, this creation is not removed' }) })
          }
        },
      })
    },
    async to_terminate_creation () {
      // 更新列表
      wo.ss.Creation.myCollectionAsCreator = wo.ss.Creation.myCollectionAsCreator.filter((item) => item.pexdataCidHash !== wo.ss.Creation.creationNow.pexdataCidHash)
      wo.ss.Creation.myCollectionAsOwner = wo.ss.Creation.myCollectionAsOwner.filter((item) => item.pexdataCidHash !== wo.ss.Creation.creationNow.pexdataCidHash)
    },

    async to_pay_to_view () {
      this.payFeedback = ''
      wo.tt.showLoading({ title: wo.ll({ zhCN: '解密中...', enUS: 'Decrypting...' }), mask: wo.envar.waitMask })
      let { _state, pexdataUser, balanceTUC } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'pay_to_view',
        apiWhat: { pextokenCid: wo.ss.Creation.creationNow.pextokenCid },
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        this.$refs.dialogPayToView.close()
        wo.ss.User.onlineUser.balanceTUC -= wo.ss.Creation.creationNow.viewerPact?.amount
        wo.ss.User.onlineUser.countAsViewer++
        wo.ss.Creation.myCollectionAsViewer.unshift(wo.ss.Creation.creationNow)
        wo.ss.Creation.creationNow.pexdataUser = pexdataUser
        wo.ss.Creation.creationNow.countViewer++
        wo.ss.Creation.creationNow.mytxView_txAmount = wo.ss.Creation.creationNow.viewerPact?.amount
        wo.tt.showToast({ type: wo.color.GREEN, title: wo.ll({ zhCN: '您已成功解密存证', enUS: 'You have successfully decrypted this creation' }) })
      } else if (_state === 'ERROR_VIEWER_BIDDEN') {
        this.payFeedback = { zhCN: '本作品禁止阅览，请看看其他作品吧', enUS: 'This creation is forbidden to view, please try some other creations.' }
      } else if (_state === 'ERROR_BALANCE_NOT_ENOUGH') {
        if (typeof balanceTUC !== 'undefined') wo.ss.User.onlineUser.balanceTUC = balanceTUC
        this.payFeedback = { zhCN: '您的能量余额不足，请先充值', enUS: 'Your energy balance is not enough. Recharge please.' }
      } else if (_state === 'ERROR_ALREADY_PAID') {
        this.payFeedback = { zhCN: '您已解密本作品，无需再次付费', enUS: 'You have already decrypted the creation, no need to pay again.' }
      } else {
        this.payFeedback = wo.envar.sysdown
      }
    },

    async to_pay_to_hold () {
      this.payFeedback = ''
      wo.tt.showLoading({ mask: wo.envar.waitMask })
      let { _state, balanceTUC } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'pay_to_hold',
        apiWhat: { pextokenCid: wo.ss.Creation.creationNow.pextokenCid },
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        this.$refs.dialogPayToHold.close()
        wo.ss.User.onlineUser.balanceTUC -= wo.ss.Creation.creationNow.holderPact?.amount
        wo.ss.User.onlineUser.countAsHolder++
        wo.ss.Creation.myCollectionAsHolder.unshift(wo.ss.Creation.creationNow)
        wo.ss.Creation.creationNow.countHolder++
        wo.ss.Creation.creationNow.mytxHold_txAmount = wo.ss.Creation.creationNow.holderPact?.amount
        wo.tt.showToast({ type: wo.color.GREEN, title: wo.ll({ zhCN: '您已成功持有本作品！', enUS: 'You have successfully held the creation!' }) })
      } else if (_state === 'ERROR_HOLDER_BIDDEN') {
        this.payFeedback = { zhCN: '本作品禁止持有，请看看其他作品吧', enUS: 'The creation is forbidden to hold, please try some other creations.' }
      } else if (_state === 'ERROR_QUOTA_EXCEEDED') {
        this.payFeedback = { zhCN: '可惜来晚一步，持有者名额已满', enUS: 'Unfortunately the holders quota is exhausted.' }
      } else if (_state === 'ERROR_BALANCE_NOT_ENOUGH') {
        if (typeof balanceTUC !== 'undefined') wo.ss.User.onlineUser.balanceTUC = balanceTUC
        this.payFeedback = { zhCN: '您的能量余额不足，请先充值', enUS: 'Your energy balance is not enough. Recharge please.' }
      } else if (_state === 'ERROR_ALREADY_PAID') {
        this.payFeedback = { zhCN: '您已持有了本作品，无需再次购买', enUS: 'You have already obtained the creation, no need to buy again.' }
      } else {
        this.payFeedback = wo.envar.sysdown
      }
    },

    async to_pay_to_own () {
      this.payFeedback = ''
      wo.tt.showLoading({ mask: wo.envar.waitMask })
      let { _state, balanceTUC } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'pay_to_own',
        apiWhat: { pextokenCid: wo.ss.Creation.creationNow.pextokenCid },
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        this.$refs.dialogPayToOwn.close()
        wo.ss.User.onlineUser.balanceTUC -= wo.ss.Creation.creationNow.ownerPact?.amount
        wo.ss.User.onlineUser.countAsOwner++
        wo.ss.Creation.creationNow.mytxOwn_txAmount = wo.ss.Creation.creationNow.ownerPact?.amount
        wo.ss.Creaton.myCollectionAsOwner.unshift(wo.ss.Creation.creationNow)
        wo.tt.showToast({ type: wo.color.GREEN, title: wo.ll({ zhCN: '您已成功买断了本作品！', enUS: 'You have successfully owned this creation!' }) })
      } else if (_state === 'ERROR_OWNER_BIDDEN') {
        this.payFeedback = { zhCN: '本作品禁止转让所有权，请看看其他作品吧', enUS: 'The creation is forbidden to transfer ownership, please try some other creations.' }
      } else if (_state === 'ERROR_BALANCE_NOT_ENOUGH') {
        if (typeof balanceTUC !== 'undefined') wo.ss.User.onlineUser.balanceTUC = balanceTUC
        this.payFeedback = { zhCN: '您的能量余额不足，请先充值', enUS: 'Your energy balance is not enough. Recharge please.' }
      } else if (_state === 'ERROR_ALREADY_PAID') {
        this.payFeedback = { zhCN: '您已买断了本作品，无需再次支付', enUS: 'You have already owned this creation, no need to pay again.' }
      } else {
        this.payFeedback = wo.envar.sysdown
      }
    },

    async load_comment_list () {
      if (this.loadMoreStatus4Comment === 'loading') {
        return
      }
      this.loadMoreStatus4Comment = 'loading'
      //      wo.tt.showLoading({ mask: wo.envar.waitMask })
      let { _state, commentList } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_comment_list',
        apiWhat: { commentTarget: wo.ss.Creation.creationNow.pexdataCidHash, skip: this.commentList.length, take: this.takeLimit },
      })
      //      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (commentList?.length) {
          this.commentList.push(...commentList)
        }
        if (commentList.length < this.takeLimit) {
          this.loadMoreStatus4Comment = 'noMore'
          return
        }
      }
      this.loadMoreStatus4Comment = 'more'
    },

    async show_liker_list () {
      if (!wo.ss.Creation.creationNow.countLike) {
        wo.tt.showToast({ title: wo.ll({ zhCN: '目前还没有人点赞。继续努力哦', enUS: 'Nobody has upvoted this creation yet.' }) })
        return
      }
      if (this.loadMoreStatus4Liker === 'loading') {
        return
      }
      this.loadMoreStatus4Liker = 'loading'
      this.$refs.dialogLikerList.open()
      //      wo.tt.showLoading({ mask: wo.envar.waitMask })
      let { _state, likerList } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_liker_list',
        apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash, skip: this.likerList.length, take: this.takeLimit },
      })
      //      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (likerList?.length) {
          this.likerList.push(...likerList)
        }
        if (likerList.length < this.takeLimit) {
          this.loadMoreStatus4Liker = 'noMore'
          return
        }
      }
      this.loadMoreStatus4Liker = 'more'
    },

    async show_viewer_list () {
      if (!wo.ss.Creation.creationNow.countViewer) {
        return
      }
      if (this.loadMoreStatus4Viewer === 'loading') {
        return
      }
      this.loadMoreStatus4Viewer = 'loading'
      this.$refs.dialogViewerList.open()
      //      wo.tt.showLoading({ mask: wo.envar.waitMask })
      let { _state, viewerList } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_viewer_list',
        apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash, skip: this.viewerList.length, take: this.takeLimit },
      })
      //      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (viewerList?.length) {
          this.viewerList.push(...viewerList)
        }
        if (viewerList.length < this.takeLimit) {
          this.loadMoreStatus4Viewer = 'noMore'
          return
        }
      }
      this.loadMoreStatus4Viewer = 'more'
    },

    async show_holder_list () {
      if (!wo.ss.Creation.creationNow.countHolder) {
        return
      }
      if (this.loadMoreStatus4Holder === 'loading') {
        return
      }
      this.loadMoreStatus4Holder = 'loading'
      this.$refs.dialogHolderList.open()
      //      wo.tt.showLoading({ mask: wo.envar.waitMask })
      let { _state, holderList } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_holder_list',
        apiWhat: { pexdataCidHash: wo.ss.Creation.creationNow.pexdataCidHash, skip: this.holderList.length, take: this.takeLimit },
      })
      //      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (holderList?.length) {
          this.holderList.push(...holderList)
        }
        if (holderList.length < this.takeLimit) {
          this.loadMoreStatus4Holder = 'noMore'
          return
        }
      }
      this.loadMoreStatus4Holder = 'more'
    }

  },
}
</script>

<template>
  <part-window>
    <view :class="{ 'window-page-900': wo.envar.inPc, 'window-page-full': !wo.envar.inPc }" style="margin-top:80px;">
      <view
        style="flex:none;display: flex; flex-flow: column nowrap; justify-content: between;position:fixed;top:0;left:0;right:0;background:var(--grey-f); z-index:999;"
      >
        <view class="wo-flex column nowrap">
          <view
            :style="{ backgroundImage: `url(${wo.pagesJson.appLogo})`, backgroundColor:wo.envar.clientInfo.appkey==='AKBABELY'?'white':'transparent', marginTop:`${wo.envar.statusBarHeight+20}px` }"
            class="wo-logo-ident wo-select-forbidden"
          ></view>
        </view>
      </view>

      <part-navibar-pc-fixed></part-navibar-pc-fixed>

      <part-show-loading class="wo-flex column center align-center" v-if="!readyToShow">
        <!-- <part-dev>luk: 避免在电脑屏幕上 header 和 footer 碰到一起</part-dev> -->
      </part-show-loading>

      <view style="margin:auto" v-else-if="!wo.ss.Creation.creationNow.pexdataCidHash">
        <text
          style="padding: 20px; font-size: large; font-weight:bold; text-align: center; line-height:2em"
        >{{ wo.ll({zhCN:'找不到这个作品',enUS:'Cannot find this creation'}) }}</text>
        <button @click="wo.tt.naviback('menu-creation')" plain style="margin:20px; padding: 0 30px; border-radius: 30px">
          <uni-icons color="unset" size="22" type="undo"></uni-icons>
          {{ wo.ll({zhCN:'返回',enUS:'Back'}) }}
        </button>
      </view>

      <template v-else>
        <view class="wo-flex center" id="_标题" style="padding:0 10px 10px;font-weight: bold; font-size:16px">{{creationTitle || '&nbsp;'}}</view>

        <view
          class="wo-flex center wo-text-color-main"
          id="_原创者或所有者本人的下架标题"
          style="margin-bottom:10px"
          v-if="removedByMe"
        >{{wo.ll({zhCN:'该作品已被您下架', enUS:'This creation was removed by you'})}}</view>
        <view
          class="wo-flex center wo-text-color-main"
          id="_相关用户的下架标题"
          style="margin-bottom:10px"
          v-else-if="removedByOne && linkedByMe"
        >{{wo.ll({zhCN:'该作品已被下架', enUS:'This creation was removed'})}}</view>

        <view
          id="_无关用户的下架封面"
          style="position: relative; width: 100%; height: 0; padding-bottom: 100%; overflow: hidden;border-radius:4px; background:#333"
          v-if="removedByOne && !removedByMe && !linkedByMe"
        >
          <view
            class="wo-text-color-red-default wo-flex center align-center"
            id="_被下架提示"
            style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 5px;
            text-align: center;
            line-height: 1.9em;
            font-size: 16px;
            box-sizing: border-box;
            word-wrap: break-word;
          "
          >
            <text>{{wo.ll({zhCN:'该作品已下架', enUS:'This creation was removed from exhibition'})}}</text>
          </view>
        </view>

        <view
          id="_被隐藏封面"
          style="position: relative; width: 100%; height: 0; padding-bottom: 100%; background: #333; overflow: hidden;border-radius:4px"
          v-else-if="wo.ss.Creation.creationNow.hideState==='HIDED'"
        >
          <view
            class="wo-text-color-red-default"
            id="_被隐藏提示"
            style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 5px;
            text-align: center;
            line-height: 1.9em;
            font-size: 16px;
            box-sizing: border-box;
            word-wrap: break-word;
            display:flex; justify-content: center; align-items: center;
          "
          >
            <text>{{wo.ll({zhCN:'该作品已被您隐藏', enUS:'This creation was hidden by you'})}}</text>
          </view>
        </view>

        <view
          id="_中国地区待审核封面"
          style="position: relative; width: 100%; height: 0; padding-bottom: 100%; background: #333; overflow: hidden;border-radius:4px"
          v-else-if="wo.ss.Creation.creationNow.pexdataUser && wo.ss.i18n.userlandCode === 'CN' && (wo.envar.banChina||[]).includes(wo.ss.Creation.creationNow.censorState)"
        >
          <view
            class="wo-text-color-red-default"
            id="_状态提示"
            style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 5px;
            text-align: center;
            line-height: 1.9em;
            font-size: 16px;
            box-sizing: border-box;
            word-wrap: break-word;
            display:flex; justify-content: center; align-items: center;
          "
          >
            <text>
              {{wo.ll({zhCN:'尊敬的中国地区用户，\n由于中国政策法规，\n每个资源都要通过审查，\n烦请您耐心等候，\n审核将尽快完成。'
              , enUS:'Dear users in China, according to your government policy requirements, each resource must be censored. Please wait for a few hours, the review will be completed as soon as possible.'})}}
            </text>
          </view>
        </view>

        <part-story-reader
          :disabled="true"
          :mask="removedByOne?'rgba(0,0,0,0.5)':''"
          :story="wo.ss.Creation.creationNow.pexdataUser || []"
          class="wo-select-forbidden"
          id="_作品内容"
          style="border-color: transparent; background-color: white; box-shadow: 0 0 5px 1px rgba(0,0,0,0.1)"
          v-else-if="wo.ss.Creation.creationNow.pexdataUser"
        ></part-story-reader>

        <view
          :style="{ backgroundImage: wo.tt.make_bgurl(wo.ss.Creation.creationNow.openCover || '/static/matrix7.jpg') }"
          class="wo-text-color-green-default"
          id="_加密作品封面"
          style="position: relative; width: 100%; height: 0; padding-bottom: 100%; background: no-repeat center / cover border-box; overflow: hidden;border-radius:4px"
          v-else-if="wo.ss.Creation.creationNow.createTimeUnix"
        >
          <view
            :style="{fontSize:wo.envar.inPc?'20px':'16px',lineHeight:wo.envar.inPc?'2.8em':'1.9em'}"
            id="_作品秘文"
            style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 5px;
            text-align: center;
            letter-spacing: 20px;
            line-height: 3em;
            box-sizing: border-box;
            word-wrap: break-word;
            word-break: break-all;
          "
            v-if="!wo.ss.Creation.creationNow.openCover"
          >{{ wo.tt.read_varchain('creatorSeal.cidoSeal',wo.ss.Creation.creationNow) || creation.pexdataCidHash }}{{ wo.tt.read_varchain('creatorSeal.cidoSeal',wo.ss.Creation.creationNow) || creation.pexdataCidHash }} }}</view>
          <view
            id="_蒙罩"
            style="
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
          "
          >
            <button
              @click="() => { if (wo.tt.check_online()) $refs.dialogPayToView.open() }"
              class="wo-bg-color-main wo-text-color-grey-f"
              style="padding: 0 20px; border-radius: 30px"
              v-if="wo.tt.read_varchain('creationNow.viewerPact.type',wo.ss.Creation)!=='FORBIDDEN'"
            >
              <uni-icons color="unset" size="22" type="eye"></uni-icons>
              <text style="font-size: 22px">{{wo.ll({zhCN:'解 密',enUS:'Decrypt'})}}</text>
            </button>
          </view>
        </view>

        <part-show-loading v-else></part-show-loading>

        <view class="wo-flex end" style="height:0" v-if="wo.ss.Creation.creationNow.creatorUsid">
          <view
            :style="{ backgroundImage: wo.tt.make_bgurl(wo.ss.Creation.creationNow.portrait) }"
            @click="visit_creator"
            id="_用户头像"
            style="flex:none; width:70px; height:70px; line-height:70px; text-align:center; background:white no-repeat center / cover; border-radius:100%; box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.7);cursor:pointer;position:relative;top:-35px;right:10px;z-index:900"
          >
            <uni-icons color="lightgrey" size="30" style="margin:auto" type="person" v-if="!wo.ss.Creation.creationNow.portrait"></uni-icons>
            <!-- <image v-if="wo.ss.Creation.creationNow.portrait" mode="aspectFill"
            :src="wo.tt.make_server_url(wo.ss.Creation.creationNow.portrait)"
            style="height: 2em; width: 2em; border-radius: 100%; margin-left: 10px"></image>-->
          </view>
        </view>

        <view id="_作品周边" style="flex: none; box-sizing: border-box" v-if="wo.ss.Creation.creationNow.pextokenCid">
          <uni-list
            :border="true"
            class="wo-bg-color-white list-header-color wo-select-forbidden"
            style="margin: 2px 0 10px 0; padding:0; border-radius:4px; box-shadow: none"
          >
            <uni-list-item :customStyle="{ padding: '10px' }" clickable style="cursor:unset;font-style:italic">
              <view slot="header" style="flex: none;">
                <text>{{ wo.tt.formatDate(wo.ss.Creation.creationNow.createTimeUnix, 'yyyy-mm-dd') }}</text>
              </view>
              <view class="wo-flex end text-ellipsis wo-text-color-blue-default" slot="footer" style="flex:auto;padding-right:80px;">
                <text @click="visit_creator" class="text-ellipsis" style="cursor:pointer;padding:0 5px">{{ wo.ss.Creation.creationNow.nickname }}</text>
              </view>
            </uni-list-item>

            <!-- <uni-list-item :border="false" :customStyle="{ padding: '10px' }" clickable style="cursor:unset">
              <view slot="header" style="flex: none; padding-right: 10px">
                <text>{{ wo.ll({ zhCN: '创作者', enUS: 'Creator' }) }}</text>
              </view>
              <view class="text-ellipsis wo-text-color-blue-default wo-flex column end" slot="body" style="flex:auto; text-align:right; margin-right:10px">
                <span @click="visit_creator" class="text-ellipsis" style="cursor:pointer">{{ wo.ss.Creation.creationNow.nickname }}</span>
                <part-dev>用 span 能够强制生效 text-ellipsis</part-dev>
                <text
                  class="text-ellipsis wo-text-color-grey-6"
                  style="font-size:12px;"
                >{{ wo.ll({zhCN:'发布于 ', enUS:'Submitted at '}) }}{{ wo.tt.formatDate(wo.ss.Creation.creationNow.createTimeUnix, 'yyyy-mm-dd HH:MM') }}</text>
              </view>
              <view
                :style="{ backgroundImage: wo.tt.make_bgurl(wo.ss.Creation.creationNow.portrait) }"
                @click="visit_creator"
                id="_用户头像"
                slot="footer"
                style="flex:none; width:44px; height:44px; line-height:44px; text-align:center; background:white no-repeat center / cover; border-radius:100%; box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.7);cursor:pointer;"
              >
                <uni-icons color="lightgrey" size="24" style="margin:auto" type="person" v-if="!wo.ss.Creation.creationNow.portrait"></uni-icons>
              </view>
            </uni-list-item>-->

            <uni-list-item :border="false" :customStyle="{ padding: '10px' }" clickable style="cursor: unset">
              <view slot="header" style="flex: none; padding-right: 10px">{{ wo.ll({ zhCN: '永存证', enUS: 'BLX' }) }}</view>
              <view class="text-ellipsis wo-flex end" slot="footer" style="flex:auto;">
                <view
                  @click="wo.tt.open_url({url: wo.envar.ipfsGateway + wo.ss.Creation.creationNow.pextokenCid})"
                  class="text-ellipsis"
                  style="flex:0 1 auto;text-align:right;cursor:pointer; color: var(--blue-default)"
                >
                  <uni-icons color="unset" custom-prefix="icont-basic" type="icont-basic-hyperlink"></uni-icons>
                  <text>{{ wo.ss.Creation.creationNow.pextokenCid }}</text>
                </view>
                <view
                  @click="$refs.poptoSharePex.open()"
                  id="_分享按钮Pex"
                  style="margin-left:10px; cursor:pointer; font-size:13px; flex:none; color: var(--blue-default)"
                >
                  <uni-icons :type="wo.ss.iconShare" color="unset" size="20px"></uni-icons>
                </view>
              </view>
            </uni-list-item>
            <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="poptoSharePex">
              <!-- <part-dev>非常奇怪，这个 uni-popup 放在分享按钮内部，导致弹出窗里的链接越过popup边界，不会自动换行</part-dev> -->
              <part-share-pop
                :shareTitle="`${wo.ll(wo.envar.callnames)} - ${wo.ll({ zhCN: '永存证', enUS: 'BLX' })}`"
                :shareUrl="wo.envar.ipfsGateway + wo.ss.Creation.creationNow.pextokenCid"
                @closeMe="$refs.poptoSharePex.close()"
              ></part-share-pop>
            </uni-popup>

            <uni-list-item :border="false" :customStyle="{ padding: '10px' }" clickable style="cursor: unset" v-if="wo.ss.Creation.creationNow.mintTxHash">
              <view slot="header" style="flex: none; padding-right: 10px">{{ wo.ll({ zhCN: '产权币', enUS: 'NFT' }) }}</view>
              <view class="text-ellipsis wo-flex end" slot="body" style="flex:auto;">
                <view
                  @click="wo.tt.open_url({url:wo.envar.tucGateway + wo.ss.Creation.creationNow.mintTxHash})"
                  class="text-ellipsis"
                  style="flex:0 1 auto;text-align:right;cursor:pointer; color: var(--blue-default)"
                >
                  <uni-icons color="unset" custom-prefix="icont-basic" type="icont-basic-hyperlink"></uni-icons>
                  <text>{{ wo.ss.Creation.creationNow.mintTxHash }}</text>
                </view>
                <view
                  @click="$refs.poptoShareNft.open()"
                  id="_分享按钮Nft"
                  style="margin-left:10px; cursor:pointer; font-size:13px; flex:none; color: var(--blue-default)"
                >
                  <uni-icons :type="wo.ss.iconShare" color="unset" size="20px"></uni-icons>
                </view>
              </view>
            </uni-list-item>
            <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="poptoShareNft">
              <!-- <part-dev>非常奇怪，这个 uni-popup 放在分享按钮内部，导致弹出窗里的链接越过popup边界，不会自动换行</part-dev> -->
              <part-share-pop
                :shareTitle="`${wo.ll(wo.envar.callnames)} - ${wo.ll({ zhCN: '产权币', enUS: 'NFT' })}`"
                :shareUrl="wo.envar.tucGateway+'/tx/'+wo.ss.Creation.creationNow.mintTxHash"
                @closeMe="$refs.poptoShareNft.close()"
              ></part-share-pop>
            </uni-popup>

            <uni-list-item :border="false" :customStyle="{ padding: '10px' }" clickable id="_阅览权合约" style="cursor: unset">
              <view slot="header" style="flex: none; padding-right: 10px">
                <uni-icons color="unset" size="18" style="margin-right:5px" type="eye"></uni-icons>
                {{ wo.ll(wo.ss.pactDict.VIEWERSHIP) }}
              </view>
              <view class="wo-flex start" slot="body" style="flex:auto;margin:0">
                <view
                  :class="{'wo-text-color-blue-default' : wo.ss.Creation.creationNow.countViewer, 'wo-clickable': wo.ss.Creation.creationNow.countViewer}"
                  @click="show_viewer_list"
                  class="wo-flex align-center wo-bg-color-grey-e"
                  style="margin:0 10px; border-radius:15px; padding:0px 10px"
                  v-if="wo.tt.read_varchain('viewerPact.amount',wo.ss.Creation.creationNow)"
                >
                  <uni-icons color="unset" size="18" style="margin-right:2px" type="staff"></uni-icons>
                  <text style="font-size:16px">{{ wo.ss.Creation.creationNow.countViewer }}</text>
                </view>
              </view>
              <view class="text-ellipsis list-footer-color" slot="footer" style="flex:none">
                <text v-if="wo.tt.read_varchain('viewerPact.type', wo.ss.Creation.creationNow)==='FORBIDDEN'">{{ wo.ll(wo.ss.pactDict.VIEW_FORBIDDEN) }}</text>
                <text v-else-if="! wo.tt.read_varchain('viewerPact.amount',wo.ss.Creation.creationNow)">{{ wo.ll(wo.ss.pactDict.VIEW_FREE) }}</text>
                <text
                  class="priceTag"
                  v-else-if="wo.ss.Creation.creationNow.creatorUsid===wo.ss.User.onlineUser.usid || wo.ss.Creation.creationNow.mytxView_txAmount"
                >{{ wo.tt.number_precision(wo.tt.read_varchain('viewerPact.amount',wo.ss.Creation.creationNow)) + wo.envar.tucSymbol }}</text>
                <text
                  @click="() => { if (wo.tt.check_online()) $refs.dialogPayToView.open() }"
                  class="wo-text-color-blue-default wo-clickable priceTag"
                  v-else
                >{{ wo.tt.number_precision(wo.tt.read_varchain('viewerPact.amount',wo.ss.Creation.creationNow)) + wo.envar.tucSymbol }}</text>
              </view>
            </uni-list-item>

            <uni-list-item :border="false" :customStyle="{ padding: '10px' }" clickable id="_持有权合约" style="cursor: unset">
              <view slot="header" style="flex: none; padding-right: 10px;">
                <uni-icons color="unset" size="18" style="margin-right:5px" type="cart"></uni-icons>
                {{ wo.ll(wo.ss.pactDict.HOLDERSHIP) }}
              </view>
              <view
                class="wo-flex start"
                slot="body"
                style="flex:auto;margin:0px;font-size:14px"
                v-if="wo.tt.read_varchain('holderPact.type', wo.ss.Creation.creationNow)!=='FORBIDDEN'"
              >
                <!-- template 不知为何,如果把 v-if 写在 body 里,就导致footer紧靠header,而不是放在最右侧了. 20231022 发现没问题了 -->
                <view
                  :class="{'wo-text-color-blue-default' : wo.ss.Creation.creationNow.countHolder, 'wo-clickable': wo.ss.Creation.creationNow.countHolder}"
                  @click="show_holder_list"
                  class="wo-flex align-center wo-bg-color-grey-e"
                  style="margin:0 10px; border-radius:15px; padding:0px 10px"
                >
                  <uni-icons color="unset" size="18" style="margin-right:2px" type="staff"></uni-icons>
                  <text style="font-size:16px">{{ wo.ss.Creation.creationNow.countHolder }}</text>
                </view>
                <view class="wo-flex align-center wo-bg-color-grey-e" style="margin:0 10px; border-radius:15px; padding:0px 10px">
                  <uni-icons color="unset" custom-prefix="icont-basic" style="margin-right:2px" type="icont-basic-quota"></uni-icons>
                  <text>{{ isFinite(stockNumber) ? stockNumber : wo.ll({zhCN:'无限量',enUS:'Unlimited'}) }}</text>
                </view>
                <!-- </template> -->
              </view>
              <view class="text-ellipsis list-footer-color" slot="footer" style="flex:none">
                <text v-if="wo.tt.read_varchain('holderPact.type', wo.ss.Creation.creationNow)==='FORBIDDEN'">{{ wo.ll(wo.ss.pactDict.HOLD_FORBIDDEN) }}</text>
                <text v-else-if="! wo.tt.read_varchain('holderPact.amount',wo.ss.Creation.creationNow)">
                  {{wo.ll(wo.ss.pactDict.HOLD_FREE)}}
                  <!-- todo: 如果售价为0,也可以点击进行收购 -->
                </text>
                <text
                  class="priceTag"
                  v-else-if="belongToMe || wo.ss.Creation.creationNow.mytxHold_txAmount"
                >{{ wo.tt.number_precision(wo.tt.read_varchain('holderPact.amount',wo.ss.Creation.creationNow)) + wo.envar.tucSymbol }}</text>
                <text
                  @click="() => { if (wo.tt.check_online()) $refs.dialogPayToHold.open() }"
                  class="wo-text-color-blue-default wo-clickable priceTag"
                  v-else-if="stockNumber"
                >{{ wo.tt.number_precision(wo.tt.read_varchain('holderPact.amount',wo.ss.Creation.creationNow)) + wo.envar.tucSymbol }}</text>
                <text
                  class="priceTag"
                  v-else
                >{{ wo.tt.number_precision(wo.tt.read_varchain('holderPact.amount',wo.ss.Creation.creationNow)) + wo.envar.tucSymbol }}</text>
              </view>
            </uni-list-item>

            <uni-list-item :border="false" :customStyle="{ padding: '10px' }" clickable id="_所有权合约" style="cursor: unset">
              <view slot="header" style="flex: none; padding-right: 10px;">
                <uni-icons color="unset" size="18" style="margin-right:5px" type="flag"></uni-icons>
                {{ wo.ll(wo.ss.pactDict.OWNERSHIP) }}
              </view>
              <view class="text-ellipsis list-footer-color" slot="footer" style="flex:none">
                <text
                  v-if="wo.tt.read_varchain('ownerPact.type', wo.ss.Creation.creationNow)==='FORBIDDEN' || ! wo.tt.read_varchain('ownerPact.amount', wo.ss.Creation.creationNow)"
                >{{ wo.ll(wo.ss.pactDict.OWN_FORBIDDEN) }}</text>
                <text
                  class="priceTag"
                  v-else-if="wo.ss.Creation.creationNow.ownerUsid===wo.ss.User.onlineUser.usid || wo.ss.Creation.creationNow.mytxOwn_txAmount"
                >{{ wo.tt.number_precision(wo.tt.read_varchain('ownerPact.amount', wo.ss.Creation.creationNow)) + wo.envar.tucSymbol }}</text>
                <text
                  @click="() => { if (wo.tt.check_online()) $refs.dialogPayToOwn.open() }"
                  class="wo-text-color-blue-default wo-clickable priceTag"
                  v-else
                >{{ wo.tt.number_precision(wo.tt.read_varchain('ownerPact.amount', wo.ss.Creation.creationNow)) + wo.envar.tucSymbol }}</text>
              </view>
            </uni-list-item>
          </uni-list>

          <view class="wo-flex around align-center" style="margin:20px 0;padding:10px 0;font-size:11px;">
            <view class="wo-flex column align-center">
              <uni-icons color="unset" size="30" type="chat"></uni-icons>
              <text
                style="word-break: keep-all;white-space: nowrap;"
              >{{ wo.ll({ zhCN: '评论 ', enUS: 'Comment ' }) + (wo.ss.Creation.creationNow.countComment||'') }}</text>
            </view>
            <view
              :class="{ 'wo-text-color-red-default': wo.ss.Creation.creationNow.likeState === 'LIKED' }"
              @click="to_toggle_vote"
              class="wo-flex column align-center"
              style="cursor:pointer"
            >
              <uni-icons :type="wo.ss.Creation.creationNow.likeState === 'LIKED' ? 'hand-up-filled' : 'hand-up'" color="unset" size="30"></uni-icons>
              <text style="word-break: keep-all;white-space: nowrap;">{{ wo.ll({ zhCN: '点赞 ', enUS: 'Upvote ' }) + (wo.ss.Creation.creationNow.countLike||'') }}</text>
            </view>
            <view @click="$refs.poptoShare.open()" class="wo-flex column align-center" style="cursor:pointer">
              <uni-icons :type="wo.ss.iconShare" color="unset" size="30"></uni-icons>
              <text>{{ wo.ll({ zhCN: '分享', enUS: 'Share' }) }}</text>
              <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="poptoShare">
                <part-share-pop
                  :shareTitle="`${wo.ll(wo.envar.callnames)} - ${wo.ll(i18nPageTitle)} - ${wo.ll(creationTitle)}`"
                  :shareUrl="`${wo.envar.webUrlRoot}/#/pages/show-creation?pexdataCidHash=${wo.ss.Creation.creationNow.pexdataCidHash}&inhaid=${wo.ss.User.onlineUser._haid||''}`"
                  @closeMe="$refs.poptoShare.close()"
                ></part-share-pop>
              </uni-popup>
            </view>
            <view @click="to_toggle_creation_onshelf" class="wo-flex column align-center" style="cursor:pointer" v-if="belongToMe">
              <!-- 创作者或所有者可以上下架作品 from public listing. 已经存在的 creator/holder/viewer 不受影响 -->
              <uni-icons :type="removedByMe?'upload':'download'" color="unset" size="30"></uni-icons>
              <text>{{ wo.ll(removedByMe?{zhCN:'上架',enUS:'Restore'}:{ zhCN: '下架', enUS: 'Remove' }) }}</text>
            </view>
            <view @click="to_toggle_hide" class="wo-flex column align-center" style="cursor:pointer" v-if="!belongToMe">
              <!-- 每个人都可以对非本人的作品进行隐藏,只对自己生效 -->
              <uni-icons :type="wo.ss.Creation.creationNow.hideState==='HIDED'?'eye':'eye-slash'" color="unset" size="30"></uni-icons>
              <text>{{ wo.ll(wo.ss.Creation.creationNow.hideState==='HIDED' ? { zhCN:'显示',enUS:'Unhide'} : { zhCN: '隐藏', enUS: 'Hide' }) }}</text>
            </view>
            <view
              @click="()=>{ if (wo.tt.check_online()) $refs.poptoComplain.open() }"
              class="wo-flex column align-center"
              style="cursor:pointer"
              v-if="!belongToMe"
            >
              <uni-icons color="unset" size="30" type="hand-down"></uni-icons>
              <text>{{ wo.ll({ zhCN: '举报', enUS: 'Report' }) }}</text>
            </view>
          </view>

          <part-story-editor
            :allowImage="wo.envar.allowImageInComment"
            :allowVideo="false"
            :baseType="wo.envar.baseTypeFile"
            :isFocused="false"
            :maxLength="wo.envar.maxLengthInComment"
            :maxLengthText="1000"
            :onPublish="to_comment_creation"
            :publishing="publishing"
            :story="commentStory"
            :styleTextarea="{ borderColor: 'var(--grey-e)' }"
            :textPlaceholder="wo.ll({ zhCN: '我要评论', enUS: 'Add my comment' })"
            style="border-color: transparent; background-color: transparent; border-radius:0;box-shadow:none;margin-bottom:10px"
          >
            <!-- <part-dev>luk: focus设为false,避免每次换到本页就跳到页底部,在手机上不合适</part-dev> -->
          </part-story-editor>

          <uni-list :border="true" id="_评论列表" style="background-color: transparent;">
            <uni-list-item :border="true" :key="index" direction="row" style="cursor:unset" v-for="(comment, index) in commentList">
              <view
                :style="{ backgroundImage: wo.tt.make_bgurl(comment.portrait) }"
                @click="visit_comment_author(comment)"
                class="头像"
                slot="header"
                style="cursor:pointer; flex:none; width:40px; height:40px; line-height:40px; text-align:center; background:white no-repeat center / cover; border-radius:100%;box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);"
              >
                <uni-icons color="lightgrey" size="24" style="margin:auto" type="person" v-if="!wo.ss.Creation.creationNow.portrait"></uni-icons>
              </view>
              <view slot="body" style="flex: auto;display:flex;flex-flow:column nowrap;">
                <view id="_姓名日期" style="display: flex; align-items: flex-start; padding:0 12px; height:1.2em; line-height:1.2em; overflow: hidden;">
                  <!-- why 11 or 12px: story reader's each section has 1px border -->
                  <view class="text-ellipsis wo-flex start" style="flex: auto; font-size: 13px;width:100px">
                    <!-- 不知为何，加个 width 就能阻止长字符串顶破宽度-->
                    <view @click="visit_comment_author(comment)" class="text-ellipsis wo-clickable wo-text-color-blue-default">{{ comment.nickname }}</view>
                  </view>
                  <view class="wo-flex align-center wo-text-color-grey-9" style="flex: none; font-size: 11px; margin-left:10px">
                    <text>{{ wo.tt.formatDate(comment.commentTimeUnix, 'yyyy-mm-dd HH:MM') }}</text>
                    <uni-icons
                      @click="to_delete_comment(comment,index)"
                      color="unset"
                      style="margin-left:10px;cursor:pointer"
                      type="trash"
                      v-if="comment.commentFromUsid===wo.ss.User.onlineUser.usid"
                    ></uni-icons>
                  </view>
                </view>
                <part-story-reader :story="comment.commentStory || []" style="border-color: transparent; box-shadow:none;background:transparent;"></part-story-reader>
              </view>
            </uni-list-item>
          </uni-list>
          <part-load-more
            :loadMoreAction="load_comment_list"
            :loadMoreStatus="loadMoreStatus4Comment"
            :loadMoreText="{contentdown: wo.ll({ zhCN: '加载更多评论', enUS: 'Load more comments' }),
          contentnomore: wo.ll({ zhCN: '-- 没有更多评论了 --', enUS: '-- No more comments --' })}"
          ></part-load-more>
        </view>
      </template>
    </view>

    <uni-popup
      :is-mask-click="false"
      :type="wo.envar.inPc ? 'center' : 'bottom'"
      @change="payFeedback=''"
      background-color="white"
      ref="dialogPayToView"
      style="z-index:999"
    >
      <!-- <part-close-button @closeMe="$refs.dialogPayToView.close()"></part-close-button> -->
      <part-deposit
        :depositAmountInitial="depositAmountMinViewer"
        :depositAmountMin="depositAmountMinViewer"
        :depositTitle="{ zhCN: '余额不足，请先充值', enUS: 'Low Balance. Recharge Now!' }"
        :payAmount="wo.tt.read_varchain('viewerPact.amount', wo.ss.Creation.creationNow) || 0"
        :payFeedback="payFeedback"
        :payTitle="wo.ss.pactDict.VIEWERSHIP"
        :submitAction="to_pay_to_view"
        :submitText="{ zhCN: '解密', enUS: 'Decrypt' }"
        @closeMe="$refs.dialogPayToView.close()"
        submitIcon="eye"
      ></part-deposit>
    </uni-popup>

    <uni-popup
      :is-mask-click="false"
      :type="wo.envar.inPc ? 'center' : 'bottom'"
      @change="payFeedback=''"
      background-color="white"
      ref="dialogPayToHold"
      style="z-index:999"
    >
      <!-- <part-close-button @closeMe="$refs.dialogPayToHold.close()"></part-close-button> -->
      <part-deposit
        :depositAmountInitial="depositAmountMinHolder"
        :depositAmountMin="depositAmountMinHolder"
        :depositTitle="{ zhCN: '余额不足，请先充值', enUS: 'Low Balance. Recharge Now!' }"
        :payAmount="wo.tt.read_varchain('holderPact.amount', wo.ss.Creation.creationNow) || 0"
        :payFeedback="payFeedback"
        :payTitle="wo.ss.pactDict.HOLDERSHIP"
        :submitAction="to_pay_to_hold"
        :submitText="{ zhCN: '购买', enUS: 'Purchase' }"
        @closeMe="$refs.dialogPayToHold.close()"
        submitIcon="cart"
      ></part-deposit>
    </uni-popup>

    <uni-popup
      :is-mask-click="false"
      :type="wo.envar.inPc ? 'center' : 'bottom'"
      @change="payFeedback=''"
      background-color="white"
      ref="dialogPayToOwn"
      style="z-index:999"
    >
      <!-- <part-close-button @closeMe="$refs.dialogPayToOwn.close()"></part-close-button> -->
      <part-deposit
        :depositAmountInitial="depositAmountMinOwner"
        :depositAmountMin="depositAmountMinOwner"
        :depositTitle="{ zhCN: '余额不足，请先充值', enUS: 'Low Balance. Recharge Now!' }"
        :payAmount="wo.tt.read_varchain('ownerPact.amount', wo.ss.Creation.creationNow) || 0"
        :payFeedback="payFeedback"
        :payTitle="wo.ss.pactDict.OWNERSHIP"
        :submitAction="to_pay_to_own"
        :submitText="{ zhCN: '买断', enUS: 'Buy Out' }"
        @closeMe="$refs.dialogPayToOwn.close()"
        submitIcon="flag"
      ></part-deposit>
    </uni-popup>

    <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="dialogLikerList" style="z-index:999;">
      <view style="min-width:320px">
        <part-close-button @closeMe="$refs.dialogLikerList.close()"></part-close-button>
        <view class="wo-flex center" style="padding:10px;font-weight: bold; font-size:16px">{{wo.ll({zhCN:'点赞者',enUS:'Who liked this Creation'})}}</view>
        <part-user-list :creatorList="likerList" style="max-height:75vh;overflow-y:auto" timestampKey="likeTimeUnix"></part-user-list>
        <part-load-more :loadMoreAction="show_liker_list" :loadMoreStatus="loadMoreStatus4Liker"></part-load-more>
      </view>
    </uni-popup>

    <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="dialogViewerList" style="z-index:999;">
      <view style="min-width:320px">
        <part-close-button @closeMe="$refs.dialogViewerList.close()"></part-close-button>
        <view class="wo-flex center" style="padding:10px;font-weight: bold; font-size:16px">{{wo.ll({zhCN:'解密者',enUS:'Who decrypted this Creation'})}}</view>
        <part-user-list :creatorList="viewerList" style="max-height:75vh;overflow-y:auto" timestampKey="txTimeUnix"></part-user-list>
        <part-load-more :loadMoreAction="show_viewer_list" :loadMoreStatus="loadMoreStatus4Viewer"></part-load-more>
      </view>
    </uni-popup>

    <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="dialogHolderList" style="z-index:999">
      <view style="min-width:320px">
        <part-close-button @closeMe="$refs.dialogHolderList.close()"></part-close-button>
        <view class="wo-flex center" style="padding:10px;font-weight: bold; font-size:16px">{{wo.ll({zhCN:'持有者',enUS:'Who purchased this Creation'})}}</view>
        <part-user-list :creatorList="holderList" style="max-height:75vh;overflow-y:auto" timestampKey="txTimeUnix"></part-user-list>
        <part-load-more :loadMoreAction="show_holder_list" :loadMoreStatus="loadMoreStatus4Holder"></part-load-more>
      </view>
    </uni-popup>

    <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_举报弹窗" ref="poptoComplain" style="z-index:999;">
      <view :style="{ maxWidth:wo.ss.maxWidth600, minWidth:wo.ss.minWidth500 }">
        <view
          style="padding: 20px 10px; font-size: 16px; font-weight:bold; text-align: center; line-height:2em"
        >{{ wo.ll(wo.envar.uitComplainTitle || {zhCN:'您要举报这个作品吗？',enUS:'Report this creation?'}) }}</view>
        <textarea
          :auto-height="false"
          :placeholder="wo.ll({ zhCN: '请说明您的举报理由。提交成功后，服务团队将在24小时内进行处理。感谢您的举报！', enUS: 'Enter the reason of your complaints and then submit. The service team will act on your report within 24 hours. Thank you for your report!' })"
          :placeholder-style="wo.ss.placeholderStyle"
          class="wo-bg-color-fg wo-border-color-border"
          maxlength="512"
          style="border-radius:4px;box-sizing:border-box; margin:0 10px 20px; width: inherit; height: 5em;  line-height: 1.5em; padding: 5px; border-width: 1px; border-style: solid; word-break: break-word;flex:none"
          v-model="reportReason"
        ></textarea>
        <!-- <view style="padding:0 20px 20px">
          <text>
            {{ wo.ll(wo.envar.uitComplain || {
            zhCN: `举报编号已拷贝，请粘贴到邮件中，并说明举报理由，发送给 ${wo.envar.teamEmail} 。服务团队将在24小时内进行处理。感谢您的举报！`,
            enUS: `A Report ID is generated and copied, please paste it in email together with the reason of your complaint, then send to ${wo.envar.teamEmail} . The service team will act on your report within 24 hours. Thank you for your report!`}) }}
          </text>
        </view>-->
        <view class="wo-flex align-center">
          <button
            @click="$refs.poptoComplain.close()"
            class="wo-flex row center align-center"
            style="width:50%;height:60px;color:white;border-radius:0;border:0;background:var(--grey-9)"
          >
            <uni-icons color="unset" size="20" style="margin-right:5px" type="closeempty"></uni-icons>
            <text style="font-size:16px">{{wo.ll({zhCN:'取消',enUS:'Cancel'})}}</text>
          </button>
          <button
            :disabled="reportEmpty || loadingReport"
            :loading="loadingReport"
            :style="{opacity:(reportEmpty||loadingReport)?0.3:1}"
            @click="to_report_creation"
            class="wo-flex row center align-center"
            style="width:50%;height:60px;color:white;border-radius:0;border:0;background:var(--red-default)"
          >
            <!-- 20240102 发现在 uni-popup 里，button disabled 鼠标不会显示为禁用状态，要显性设置 cursor:not-allowed -->
            <template v-if="!reportEmpty">
              <uni-icons color="unset" size="20" style="margin-right:5px" type="hand-down"></uni-icons>
              <text style="font-size:16px">{{wo.ll({zhCN:'举报',enUS:'Report'})}}</text>
            </template>
          </button>
          <!-- <a
            :href="`mailto:${wo.envar.teamEmail}`"
            class="wo-flex row center align-center wo-bg-color-red-default"
            style="width:50%; text-decoration: none; height:60px;color:white;cursor:pointer;"
          >
            <uni-icons color="unset" size="20" style="margin-right:5px" type="email"></uni-icons>
            <text style="font-size:16px">{{wo.ll({zhCN:'举报',enUS:'Report'})}}</text>
          </a>-->
        </view>
      </view>
    </uni-popup>
  </part-window>
</template>

<style lang="scss">
.priceTag {
  font-weight: bold;
  font-size: 18px;
}
</style>
