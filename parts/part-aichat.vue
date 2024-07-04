<script>
// #ifndef APP
// 经测试，recorder-core 在 iOS app 里无效
import Recorder from 'recorder-core'
import 'recorder-core/src/engine/mp3'
import 'recorder-core/src/engine/mp3-engine'
// import 'recorder-core/src/extensions/waveview'
// import 'recorder-core/src/extensions/wavesurfer.view'
import 'recorder-core/src/extensions/frequency.histogram.view'
import 'recorder-core/src/extensions/lib.fft'
// #endif

export default {
  props: {
    // aichatWelcome: {
    //   type: [Object, String],
    //   default: '',
    // },
    // aichatWelcomeAvatar: {
    //   type: String,
    //   default: ''
    // },
    srAction: {
      type: String,
      default: '',
    },
    isFocused: {
      type: Boolean,
      default: false,
    },
    chatHeight: {
      type: String,
      default: 'unset'
    },
    // defaultNickname: {
    //   type: String,
    //   default: wo.ll({ zhCN: '我', enUS: 'Me' })
    // },
    showWelcome: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      loadingSend: false,
      loadingRead: false,

      focusList: { 0: false, 1: this.isFocused },

      chatList: wo.ss.AI.chatList4All,
      pickedChatIndex: undefined,
      loadMoreStatus: 'more',
      takeLimit: 10,

      reportReason: '',
      loadingReport: false,

      aiSetTitle: { zhCN: 'AI', enUS: 'AI' },

      actionsOnPopmenu: {
        drop: { action: 'drop', icon: 'trash-filled', i18T: { zhCN: '删除', enUS: 'Drop' }, color: '#ff2972' },
        copy: { action: 'copy', icon: 'icont-basic-copy-fill', customPrefix: 'icont-basic', i18T: { zhCN: '拷贝', enUS: 'Copy' }, color: '#01bdab' },
        ...(wo.envar.clientInfo.appkey === 'AKBABELY' ? {
          save: { action: 'save', icon: 'upload-filled', i18T: { zhCN: '转载', enUS: 'Transfer' }, color: '#00b0fe' }
        } : {})
      },
      actionRead: { action: 'read', icon: 'sound-filled', i18T: { zhCN: '朗读', enUS: 'Read' }, color: '#a529ff' },
      actionPreview: { action: 'preview', icon: 'eye', i18T: { zhCN: '预览', enUS: 'View' }, color: '#fea600' },
      actionDownload: { action: 'download', icon: 'download-filled', i18T: { zhCN: '下载', enUS: 'Download' }, color: '#01bdab' },

      // actionsOnBottom: {
      // },

      recorder: undefined,
      recordingTimer: undefined,
      recordingTimerValue: '',
      recorderFeedback: { zhCN: '语音识别中...', enUS: 'Speech Recognizing...' },

      soundPlayer: uni.createInnerAudioContext(),

      transcribing: false,

      thisAippDict: wo.ss.aippDict,

    }
  },

  computed: {
    reportEmpty () {
      return !this.reportReason?.trim?.()
    },
    promptEmpty () {
      return !wo.ss.AI.promptNow?.trim?.()
    },

    thisAintSetAll () {
      return Object.assign({}, wo.ss.aiModelSet, wo.tt.objectize_array(wo.ss.AI.aippListAll, 'aicode'), wo.tt.objectize_array(wo.ss.AI.aippListMyCreated, 'aicode'), wo.ss.AI.aintNow?.aicode ? { [wo.ss.AI.aintNow.aicode]: wo.ss.AI.aintNow } : {})
    },

    isTextModel () {
      // 有历史的对话
      return wo.envar.aiModelSet[wo.envar.AI.aicodeNow]?.AIT_TEXT_CHAT
    },

    promptMaxlen () {
      return wo.ll(wo.ss.AI.aintNow?.promptMaxlen) || wo.ll(wo.envar.aiModelSet[wo.ss.AI.aintNow?.aicodeModel]?.promptMaxlen) || wo.ll(wo.envar.aiConfig.promptMaxlen)
    },

    // promptSet () {
    //   return /^(gpt|text|cnwenxin)/.test(wo.envar.AI.aicodeNow) ? {
    //     p1: { title: { zhCN: '文秘', enUS: 'Writer' }, color: '#ff2972', prompt: { zhCN: '你是一名文秘，你拥有优秀的专业技能，精通各种类型的公司文件的编写。请为以下主题编写一份文件: ', enUS: 'As a highly experienced secretary, you have an excellent skill set in writing different types of corporate documents. Please use your expertise to write a flawless document on the given topic: ' } },
    //     p2: { title: { zhCN: '心理师', enUS: 'psychologist' }, color: '#2b85e4', prompt: { zhCN: '你是一个心理学家，我希望你给我建议，让我感觉更好。我最近觉得: ', enUS: 'You are a psychologist. I would like your advice on how to feel better. Recently, I have been in this situation: ' } },
    //     p3: { title: { zhCN: '厨师', enUS: 'Cook' }, color: '#71d5a1', prompt: { zhCN: '你是一名厨师，请给我推荐一份晚餐菜谱，要求是: ', enUS: 'As a skilled chef, I trust your expertise in creating mouth-watering dinners. Kindly recommend a delectable dinner recipe that satisfies the following criteria: ' } },
    //     p4: { title: { zhCN: '翻译', enUS: 'Translator' }, color: '#fe00f1', prompt: { zhCN: '你是一名翻译，请把这段话翻译成英文: ', enUS: 'You are a skilled translator. Please translate the following paragraph into English: ' } },
    //     p5: { title: { zhCN: '老师', enUS: 'Teacher' }, color: '#00b0fe', prompt: { zhCN: '你是一个历史老师，我想要了解: ', enUS: 'As a history teacher, can you tell me more about ' } },
    //     p6: { title: { zhCN: '记者', enUS: 'Jounalist' }, color: '#fea600', prompt: { zhCN: '你是一名记者，擅长报道突发新闻，撰写专题报道和评论文章。请写一篇文章，关于:', enUS: 'You are a journalist who specializes in covering breaking news, writing feature stories, and opinion pieces. Please write an article about:' } },
    //     p7: { title: { zhCN: '律师', enUS: 'Lawyer' }, color: '#01bdab', prompt: { zhCN: '你是一名律师，请写一份协议合同，涵盖商业权利、数据隐私、违约条款，用于: ', enUS: 'You are a lawyer. Please write a contract agreement covering commercial rights, data privacy, and breach of contract clauses for use in:' } },
    //     p8: { title: { zhCN: '• • •', enUS: '• • •' }, color: '#a529ff', prompt: { zhCN: '你是一个: \n我的问题是: \n请你一步一步的进行: \n注意事项包括: ', enUS: 'You are a: \nMy question is: \nPlease provide step-by-step instructions on: \nImportant considerations include:' } },
    //     ...wo.envar.prompts4Text
    //   }
    //     : /^code/.test(wo.envar.AI.aicodeNow) ? {
    //       p1: { title: { zhCN: 'Python', enUS: 'Python' }, color: '#ff2972', prompt: '# Write a python function to reverse a string.\n# The function should be an optimal solution in terms of time and space complexity.\n# Example input to the function: abcd123\n# Example output to the function: 321dcba' },
    //       p2: { title: { zhCN: 'JS', enUS: 'JS' }, color: '#2b85e4', prompt: '// a Javascript function to generate random numbers of length 6' },
    //       p3: { title: { zhCN: 'SQL', enUS: 'SQL' }, color: '#71d5a1', prompt: '### Postgres SQL tables, with their properties:\n#\n# Employee(id, name, department_id)\n# Department(id, name, address)\n# Salary_Payments(id, employee_id, amount, date)\n#\n### A query to list the names of the departments which employed more than 10 employees in the last 3 months\n\nSELECT' },
    //       p4: { title: { zhCN: '• • •', enUS: '• • •' }, color: '#a529ff', prompt: '// Use Language: \n// Write a function: \n// Explain this: ' },
    //       ...wo.envar.prompts4Code
    //     }
    //       : /^dalle/.test(wo.envar.AI.aicodeNow) ? {
    //         p1: { title: { zhCN: '动物', enUS: 'Animal' }, color: '#ff2972', prompt: { zhCN: '一只小猫在草地上,远处夕阳,高清,生动,极细节', enUS: 'A little cat is on the grassland, far away from the setting sun. High definition, vivid, and highly detailed' } },
    //         p2: { title: { zhCN: '创意', enUS: 'Dream' }, color: '#2b85e4', prompt: { zhCN: '一个可爱的机器人站在森林里', enUS: 'A cute robot standing in the forest' } },
    //         p3: { title: { zhCN: '人像', enUS: 'Portrait' }, color: '#71d5a1', prompt: { zhCN: '数字绘画，Stanley Artgerm Lau在artstation上所绘制的，具有极高细节，华丽而又电影化的光照，栩栩如生的轻蓝色礼服女子正在窗边阅读书籍。分辨率为8k。', enUS: 'Digital painting of a young woman with light blue dress sitting next to a wooden window reading a book, by Stanley Artgerm Lau, artstation, 8k, extremely detailed, ornate, cinematic lighting, vivid.' } },
    //         p4: { title: { zhCN: '• • •', enUS: '• • •' }, color: '#fea600', prompt: 'Subject, Medium, Style, Artist, Website, Resolution, Details, Color, Lighting' },
    //         ...wo.envar.prompts4Dalle
    //       }
    //         : /^sd/.test(wo.envar.AI.aicodeNow) ? {
    //           p1: { title: { zhCN: '女孩', enUS: 'Girl' }, color: '#ff2972', prompt: '<lora:koreanDollLikeness_v10:0.3>,<lora:taiwanDollLikeness_v10:0.2>(8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37), ultra-detailed,1 girl,cute, solo,beautiful detailed sky,detailed cafe,night,sitting,dating,(nose blush),(smile:1.1),(closed mouth) medium breasts,beautiful detailed eyes,(collared shirt:1.1), bowtie,pleated skirt,(short hair:1.2),floating hair' },
    //           p2: { title: { zhCN: '人像', enUS: 'Portrait' }, color: '#2b85e4', prompt: 'a young female, highlights in hair, sitting outside restaurant, brown eyes, wearing a dress, side light' },
    //           p3: { title: { zhCN: '动物', enUS: 'Animal' }, color: '#71d5a1', prompt: 'National Geographic Wildlife photo of the year, red panda, evening light, sunset, rim lighting, depth of field' },
    //           p4: { title: { zhCN: '小镇', enUS: 'Town' }, color: '#fe00f1', prompt: 'a traditional Mediterranean town in the street of a small village on the Riviera. a terrace in the shade of a hundred-yyear-oold olive tree; a friendly atmosphere around pizzas and rose wine. dolce vita. unreal engine rendering, hyper-realist, ultra-detailed, oil painting, warm colors, happy, impressionism, Da Vinci, style of Garri Bardin --ar 2:3' },
    //           p5: { title: { zhCN: '太空城', enUS: 'Spacecity' }, color: '#00b0fe', prompt: 'Dark themed Authentic illustration of a city on space colony ,Magnificent wide angle, high quality, city landscape, Rule of Thirds, fibonacci, 4K, Retrofuturism, thomas kinkade, greg rutkowski, Dynamic Lighting, Surrealist, Fantasy' },
    //           p6: { title: { zhCN: '• • •', enUS: '• • •' }, color: '#fea600', prompt: 'subject? medium? style? artist? resolution? details? color? lighting?' },
    //           ...wo.envar.prompts4SD
    //         }
    //           : {}
    // },

    chatWelcome () {
      return {
        role: wo.ss.AI.aintNow?.ainote ? 'assistant' : 'system',
        portrait: wo.ss.AI.aintNow?.ainote ? wo.ss.AI.aintNow?.aiavatar : wo.pagesJson.appLogo,
        chatTimeUnix: Date.now(),
        story: [{
          text: wo.ll(wo.ss.AI.aintNow?.ainote || { zhCN: '您好！', enUS: 'Hello!' }) // + ' (' + wo.ll(wo.ss.AI.aintNow?.aiprice || wo.envar.aiModelSet[wo.ss.AI.aintNow?.aicodeModel]?.aiprice)  + ')' 
          // || wo.envar.aichatWelcome || {
          //   zhCN: `👋🏼🎉👋🏼🎊 尊敬的用户朋友，我们致力于永久提供高性价比的AI服务，保护您的隐私，释放您的创造力。如遇故障，请向客服报告。让我们开始新旅程吧！`
          //   // + (wo.ss.i18n.userlandCode === 'CN' ? `\n\n中国用户特别注意，由于中国地区政策法规，您与AI的对话必须符合当地言论规范。为了长期服务于您，${wo.envar.callnames.zhCN}中国区即日起实施了内容审查，并且提供了中国区专用AI。中国以外用户请访问全球平台 https://earth.${wo.envar.webDomain} 随心畅聊。` : '')
          //   , enUS: `👋🏼🎉🎊👋🏻 Dear friend, our mission is to permanently provide cost-effective AI services, protecting your privacy and unleashing your creativity. Should you encounter any problems, report to customer service. Let's start the journey!`
          // }
        }],
      }
    }
  },

  async mounted () {
    wo.ss.AI.aicodeNow = this.$route?.query?.aicode || wo.ss.AI.aicodeNow || wo.envar.aicodeDefault || Object.keys(wo.ss.aiModelSet)[0]
    if (this.thisAintSetAll[wo.ss.AI.aicodeNow]) {
      wo.ss.AI.aintNow = this.thisAintSetAll[wo.ss.AI.aicodeNow]
    } else {
      if (/^asst_/.test(wo.ss.AI.aicodeNow)) {
        wo.tt.showLoading()
        let { _state, aipp } = await wo.tt.callBase({
          apiWho: 'Aimodel',
          apiTodo: 'get_aipp',
          apiWhat: { aicode: wo.ss.AI.aicodeNow }
        })
        wo.tt.hideLoading()
        if (wo.bok(_state) && aipp?.aicode === wo.ss.AI.aicodeNow) {
          wo.ss.AI.aintNow = aipp
        } else {
          wo.ss.AI.aicodeNow = wo.envar.aicodeDefault || Object.keys(wo.ss.aiModelSet)[0]
          wo.ss.AI.aintNow = wo.ss.aiModelSet[wo.ss.AI.aicodeNow]
        }
      } else { // 有这种可能：app里集成的 aiModelSet 是老的，缺少某些后加的基础大模型。这种情况下，直接打开首页到某个新的特定大模型，这时尚未读取到后台发来的 aiModelSet，于是前端找不到它，但它不是 Aipp 而是大模型，所以也不应该向后台索取 get_aipp
        await wo.tt.wait_autologin()
        if (!wo.ss.aiModelSet[wo.ss.AI.aicodeNow]) {
          wo.ss.AI.aicodeNow = wo.envar.aicodeDefault || Object.keys(wo.ss.aiModelSet)[0]
        }
        wo.ss.AI.aintNow = wo.ss.aiModelSet[wo.ss.AI.aicodeNow]
      }
    }

    let self = this
    wo.unisocket.initListener('AICHAT_SUCCESS', ({ _state, berText, aicode, role, aiReply, aiUsage, tucCost, newBalance, timeCost, chatTimeUnix, ttsAudio }) => {
      if (wo.bok(_state)) {
        wo.ss.User.onlineUser.balanceTUC = newBalance
        self.chatList.push({
          role: role || 'assistant', aicode, aiUsage, tucCost, timeCost,
          chatTimeUnix,
          story: aiReply,
        })
        if (wo.ss.AI.autoTTS) {
          if (ttsAudio) {
            this.play_audio({ audio: ttsAudio })
          } else if (aiReply[0].textRejected) {
            // 播放固定的拒绝语句？
          }
        }
      } else {
        wo.tt.showToast({
          type: wo.color.WARN, title:
            ['MODEL_NOTEXIST', 'MODEL_UNKNOWN', 'ERROR_MODEL_NO_CONFIG'].includes(_state) ? { zhCN: '😰 找不到您要求的AI，请切换到其他AI', enUS: 'The AI you requested is not found. Please choose another one' } :
              _state === 'CLIENT_WOBASE_TIMEOUT' ? { zhCN: '😰 算力不足，AI 尚未回复，稍候再给您送上答案！您可以先聊点儿其他话题', enUS: '😰 Out of capacity now, AI has not replied yet, we will get the answer back to you later. You can ask something else now 🤗' } :
                _state === 'ERROR_BALANCE_NOT_ENOUGH' ? { zhCN: '您的能量已不足，无法激活 AI，请先充值！', enUS: 'Your energy is insufficient and unable to activate the AI. Recharge please.' } :
                  _state === 'ERROR_OVER_CONTEXT' ? { zhCN: '😰 内容太长了，超出本 AI 容量！请缩短您的问题或降低记忆力，再试一次', enUS: 'You input length exceeds the capacity of this AI! 😰 Please shorten your question or reduce memory, then try again 🤗' } :
                    aiStatus === 429 ? { zhCN: '当前请求过多，本AI忙晕啦，请稍后再试！', enUS: 'Too many requests now! This AI is too busy to accept your request. Please wait a moment and try again.' } :
                      aiErrorCode === 'content_policy_violation' ? { zhCN: '您的问题可能违反了内容政策，本AI无法回答', enUS: 'Your question may violate the content policy and the AI refuses to reply' } :
                        berText || { zhCN: '😰 AI 报错了。也许您的问题太难了。您可以试试更简单的问题，或者切换到其他Aipp。如遇多次故障，请向客服报告。', enUS: 'AI malfuntioned! 😰 Maybe your question is too difficult. Please try some simpler question or switch to another Aipp. If the problem occurs repeatedly, please report to customer service' }
        })
      }
    })

    await wo.tt.wait_autologin() // 不要 if (await wo.tt.wait_autologin()) 因为除了自动登录，还有用户中途登录。
    if (wo.ss.User.onlineUser.usid) { // 确保已经登录才能 get history，否则会被 to_get_chatHistory 里的 check_online 带跑到登录页
      await this.switch_chatHistory()
    }

    if (wo.envar.inPc) this.refocus() // 只有在 wo.envar.inPc 时才自动聚焦，以免在手机上激活软键盘
  },

  methods: {
    async pickup_file_to_ipfs (usage) {
      if (!wo.tt.check_online()) {
        return
      }
      const { _state, cid, size, ...rest } = await wo.tt.pickupFile({ baseType: wo.envar.baseTypeFile, mediaType: { KNOWBASE: wo.ss.aiConfig.openaiFileSearchExt, TEMPLIB: wo.ss.aiConfig.openaiCodeInterpreterExt }[usage] })
      if (wo.bok(_state)) {
        if (wo.ss.AI.promptFileList.some(file => file.cid === cid && file.usage === usage)) {
          wo.tt.showToast({ type: wo.color.YELLOW, title: { zhCN: '发现重复的文件。', enUS: 'Duplicate files detected.' } })
        } else {
          wo.ss.AI.promptFileList.push({ usage, cid, size, ...rest })
        }
      }
    },

    async to_report_aipp () {
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
          reportTargetId: wo.ss.AI.aicodeNow,
          reportTargetType: 'AIPP',
          reportReason: this.reportReason,
        },
      })
      this.loadingReport = false
      if (wo.bok(_state)) {
        this.$refs.poptoComplain.close()
        this.reportReason = ''
        wo.tt.showToast({ title: { zhCN: '您的举报已成功提交', enUS: 'Your report has been submitted successfully' } })
      } else {
        wo.tt.showToast({ type: wo.color.RED, title: { zhCN: '举报提交失败，请稍候再试一次', enUS: 'Failed to submit report, please try again later' } })
      }
    },

    async to_get_chatHistory () {
      if (!wo.ss.User.onlineUser.usid || this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      let { _state, chatHistory } = await wo.tt.callBase({
        apiWho: 'Aimodel',
        apiTodo: 'get_chat_history',
        apiWhat: {
          before: this.chatList?.[0]?.chatTimeUnix, take: this.takeLimit,
          aicode: !wo.ss.AI.allChatInOne ? wo.ss.AI.aicodeNow : undefined
        }
      })
      if (wo.bok(_state)) {
        if (chatHistory?.length) {
          this.chatList.unshift(...chatHistory)
        }
        if (chatHistory?.length < this.takeLimit) {
          this.loadMoreStatus = 'noMore'
          return
        }
      }
      this.loadMoreStatus = 'more'
    },

    async switch_chatHistory () {
      if (wo.ss.AI.allChatInOne) {
        if (this.chatList !== wo.envar.AI.chatList4All) {
          this.chatList = wo.envar.AI.chatList4All
        }
        if (!this.chatList.length) {
          await this.to_get_chatHistory()
        }
      } else if (this.chatList !== wo.envar.AI.chatList4One[wo.envar.AI.aicodeNow]) {
        if (wo.envar.AI.chatList4One[wo.envar.AI.aicodeNow]) {
          this.chatList = wo.envar.AI.chatList4One[wo.envar.AI.aicodeNow]
        } else {
          this.chatList = []
          await this.to_get_chatHistory()
        }
      }
      if (wo.envar.inPc) this.refocus()
    },

    enable_focus () {
      this.focusList[0] = false
      this.focusList[1] = true
      // #ifdef APP
      // uni.hideKeyboard() // 避免在app上新开聊天页面时弹出软键盘
      // #endif
    },
    disable_focus () {
      this.focusList[0] = false
      this.focusList[1] = false
    },
    async refocus () {
      wo.tt.next_focus(1, this.focusList)
      await wo.tt.sleep(250)
      wo.tt.next_focus(0, this.focusList)
    },

    // save_message_to_creation () {
    //   if (this.loadingSend) {
    //     wo.tt.showToast({ type: wo.color.YELLOW, title: wo.ll({ zhCN: '请先等待完成这一轮对话', enUS: 'Please wait until AI replies' }) })
    //     return
    //   }
    //   if (!this.chatList.length) {
    //     wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '当前对话为空，不能发表', enUS: 'Current conversation is empty and cannot be published' }) })
    //     return
    //   }
    //   this.chatList.forEach(({ story }, index) => {
    //     if (['user', 'assistant'].includes(this.chatList[index].role)) {
    //       wo.ss.Creation.pexdataRaw.push(...story)
    //     }
    //   })
    //   // wo.ss.Creation.pexdataRaw = wo.tt.filter_story(wo.ss.Creation.pexdataRaw)
    //   // if (!wo.ss.Creation.pexdataRaw?.length) { // 删除空段落
    //   //   wo.ss.Creation.pexdataRaw.push({text:''})
    //   // }
    //   if (wo.envar.clientInfo.appkey === 'AKAIZOIC') {
    //     uni.navigateTo({ url: 'mid-aippia-mint' })
    //   } else if (wo.envar.clientInfo.appkey === 'AKBABELY') {
    //     uni.navigateTo({ url: wo.pagesJson.tabBar.midButton.midPage })
    //   } else {
    //     // #ifdef WEB
    //     uni.redirectTo({ url: `${wo.pagesJson.tabBar.midButton.midPage}?tagnow=SEAL` })
    //     // #endif
    //     // #ifndef WEB
    //     wo.ss.midTagNow = 'SEAL'
    //     // #endif
    //   }
    // },

    async send_message_to_ai ({ multimodal } = {}) {
      if (!wo.tt.check_online()) {
        return
      }
      if (this.loadingSend) {
        return
      }
      if (!wo.envar.AI.aicodeNow) {
        wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '尚未选择AI应用', enUS: 'Please select an Aipp' }) })
        return
      }
      if (wo.ss.User.onlineUser.balanceTUC <= 0) {
        this.$refs.dialogDeposit.open()
        return
      }
      if (multimodal) wo.ss.AI.promptStory = wo.tt.filter_story(wo.ss.AI.promptStory) // delete sections of empty text: `{text:''}`
      if (multimodal && !wo.ss.AI.promptStory.length || !multimodal && this.promptEmpty) { // if promptStory is empty or prompt is empty
        wo.tt.showToast({ type: wo.color.RED, title: { zhCN: '请输入您的问题！', enUS: 'Please enter your question!' } })
        return
      }

      let history = []
      if (this.isTextModel && wo.ss.AI.contextToRemember) {
        // for each chat item in chatList, if it is from ai or user, add it to history, maximum of wo.ss.AI.contextToRemember
        let count = 0
        for (let i = this.chatList.length - 1; i >= 0; i--) {
          if (['assistant', 'user'].includes(this.chatList[i].role) && this.chatList[i].story[0].text) {
            history.unshift({
              role: this.chatList[i].role,
              content: multimodal ? this.chatList[i].story : (this.chatList[i].story[0].textRejected || this.chatList[i].story[0].text) // 后台的 gpt 能够识别数组消息，可以直接 content: this.chatList[i].story 但其他模型的方法目前都是要求单条string消息的。
            })
            count++
            if (count >= wo.ss.AI.contextToRemember) {
              break
            }
          }
        }
      }

      // add my question
      let userChatTimeUnix = Date.now()
      this.chatList.push({
        role: 'user',
        aicode: wo.envar.AI.aicodeNow,
        story: (multimodal ? wo.ss.AI.promptStory : [{ text: wo.ss.AI.promptNow }]).concat(wo.ss.AI.promptFileList?.map?.(file => ({ link: file.cid, linkText: file.originalname }))),
        chatTimeUnix: userChatTimeUnix,
        // portrait: wo.ss.User.onlineUser.portrait, nickname: wo.ss.User.onlineUser.nickname || this.defaultNickname,  
      })
      const prompt4base = multimodal ? wo.ss.AI.promptStory : wo.ss.AI.promptNow // 保留下来，在清理界面后再发给后台
      const promptFileList4base = wo.ss.AI.promptFileList
      wo.ss.AI.promptNow = ''
      wo.ss.AI.promptStory = [{ text: '' }]
      wo.ss.AI.promptFileList = []
      const aicodeChat = wo.envar.AI.aicodeNow // 在等待AI回答期间，aicodeNow 可能被用户重新选择而改变，callBase 可能超时，导致返回的 aicode 为空，因此不能依赖返回的 aicode。

      this.loadingSend = true
      let remainingSeconds = 60
      const progressPrefix = wo.ll({ zhCN: '思考中... ', enUS: 'Thinking... ' })

      let waitingChat = {
        role: 'assistant',
        portrait: this.thisAintSetAll[aicodeChat]?.aiavatar,
        aicode: aicodeChat,
        chatTimeUnix: Date.now(),
        story: [{ text: progressPrefix + remainingSeconds }]
      }
      this.chatList.push(waitingChat)

      this.refocus()

      let timer = setInterval(() => {
        if (remainingSeconds > 0) {
          waitingChat.story[0].text = progressPrefix + --remainingSeconds
        } else {
          clearInterval(timer)
        }
      }, 1000)

      let { _state, berText, aicode, role, aiStatus, aiErrorCode, aiReply, aiUsage, tucCost, newBalance, timeCost, chatTimeUnix, ttsAudio } = await wo.tt.callBase({
        apiWho: 'Aimodel',
        apiTodo: 'reply_challenge',
        apiWhat: {
          aicode: aicodeChat,
          prompt: prompt4base,
          promptFileList: promptFileList4base,
          history,
          imgNum: wo.ss.AI.imgNumToCreate,
          userChatTimeUnix,
          autoTTS: wo.ss.AI.autoTTS
        },
      })
      this.loadingSend = false
      clearInterval(timer)

      if (wo.bok(_state)) {
        wo.ss.User.onlineUser.balanceTUC = newBalance
        wo.ss.User.onlineUser.sumOutSR = wo.tt.number_precision(wo.ss.User.onlineUser.sumOutSR + tucCost)
        // 直接覆盖掉 waitingChat
        this.chatList[this.chatList.length - 1] = {
          role: role || 'assistant',
          chatTimeUnix,
          aicode, aiUsage, tucCost, timeCost,
          story: aiReply,
        }
        if (wo.ss.AI.autoTTS) {
          if (ttsAudio) {
            this.play_audio({ audio: ttsAudio })
          } else if (aiReply[0].textRejected) {
            //
          }
        }
      } else if (_state === 'ERROR_BALANCE_NOT_ENOUGH') {
        this.$refs.dialogDeposit.open()
      } else {
        // 直接覆盖掉 waitingChat
        this.chatList[this.chatList.length - 1] = {
          role: 'system',
          portrait: wo.pagesJson.appLogo,
          chatTimeUnix: Date.now(),
          aicode: aicodeChat,
          story: [{
            text: wo.ll(
              ['MODEL_NOTEXIST', 'MODEL_UNKNOWN', 'ERROR_MODEL_NO_CONFIG'].includes(_state) ? { zhCN: '😰 找不到您要求的AI，请切换到其他AI', enUS: 'The AI you requested is not found. Please choose another one' } :
                _state === 'CLIENT_WOBASE_TIMEOUT' ? { zhCN: '😰 算力不足，AI 尚未回复，稍候再给您送上答案！您可以先聊点儿其他话题', enUS: '😰 Out of capacity now, AI has not replied yet, we will get the answer back to you later. You can ask something else now 🤗' } :
                  _state === 'ERROR_BALANCE_NOT_ENOUGH' ? { zhCN: '您的能量已不足，无法激活 AI，请先充值！', enUS: 'Your energy is insufficient and unable to activate the AI. Recharge please.' } :
                    _state === 'ERROR_OVER_CONTEXT' ? { zhCN: '😰 内容太长了，超出本 AI 容量！请缩短您的问题或降低记忆力，再试一次', enUS: 'You input length exceeds the capacity of this AI! 😰 Please shorten your question or reduce memory, then try again 🤗' } :
                      aiStatus === 429 ? { zhCN: '当前请求过多，本AI忙晕啦，请稍后再试！', enUS: 'Too many requests now! This AI is too busy to accept your request. Please wait a moment and try again.' } :
                        aiErrorCode === 'content_policy_violation' ? { zhCN: '您的问题可能违反了内容政策，本AI无法回答', enUS: 'Your question may violate the content policy and the AI refuses to reply' } :
                          berText || { zhCN: '😰 AI 报错了。也许您的问题太难了。您可以试试更简单的问题，或者切换到其他Aipp。如遇多次故障，请向客服报告。', enUS: 'AI malfuntioned! 😰 Maybe your question is too difficult. Please try some simpler question or switch to another Aipp. If the problem occurs repeatedly, please report to customer service' }
            )
          }],
        }
        // todo if (wo.ss.AI.autoTTS) {
        //  this.play_audio({audio:''})
        // }
      }

      this.refocus()

    },

    async to_reset_thread () {
      wo.tt.showModal({
        title: { zhCN: '清空当前AI应用的记忆？', enUS: 'Clear memory of this Aipp?' },
        content: { zhCN: 'AI应用会自动记住所有对话，更贴心的为您服务，但也可能导致更高的成本耗费，或者不必要的垃圾信息。因此，您可以定期清空AI应用的历史记忆，开始全新对话。', enUS: 'Aipp automatically remember all conversations to better serve you, but this may also lead to higher costs or unnessessary junk information. Therefore, you can periodially clear previous memory of this Aipp and start the conversion anew.' },
        showCancel: true,
        confirmText: { zhCN: '清空', enUS: 'Reset' },
        success: async ({ confirm, cancel }) => {
          if (confirm) {
            wo.tt.showLoading()
            let { _state, message } = await wo.tt.callBase({
              apiWho: 'Aimodel',
              apiTodo: 'reset_thread',
              apiWhat: { aicode: wo.ss.AI.aicodeNow }
            })
            wo.tt.hideLoading()
            if (wo.bok(_state)) {
              this.chatList.push({
                role: 'system',
                aicode: wo.ss.AI.aicodeNow,
                portrait: wo.pagesJson.appLogo,
                story: [{ text: message }], chatTimeUnix: Date.now(),
              })
            } else {
              wo.tt.showToast({ type: wo.color.RED, title: wo.envar.sysdown, duration: 5000 })
            }
          }
        }
      })
    },

    toggle_autoTTS () {
      wo.ss.AI.autoTTS = !wo.ss.AI.autoTTS
      if (wo.ss.AI.autoTTS) {
        wo.tt.showToast({ title: wo.ll({ zhCN: '从现在起，自动朗读AI的回复', enUS: 'AI replies will be read aloud automatically' }), duration: 3000 })
      } else {
        this.soundPlayer?.stop()
        wo.tt.showToast({ title: wo.ll({ zhCN: '取消自动朗读后，您可以点击某一段话，单独朗读', enUS: 'Click on a section to readout it alone' }), duration: 3000 })
      }
    },

    play_audio ({ audio }) {
      this.soundPlayer = this.soundPlayer || uni.createInnerAudioContext()
      //      this.soundPlayer.autoplay = true
      this.soundPlayer.src = wo.tt.make_server_url(audio)
      this.soundPlayer.play()
    },

    async act_on_message (action) {
      if (!wo.tt.check_online()) {
        return
      }

      let targetStory = this.chatList[this.pickedChatIndex]?.story

      if (action === 'copy') {
        let targetContent = []
        targetStory.forEach((section) => {
          if (section?.textRejected || section?.text) {
            targetContent.push(section.textRejected || section.text)
          } else if (section?.image) {
            targetContent.push('<' + wo.tt.make_server_url(section.image) + '>')
          } else if (section?.link) {
            targetContent.push(`[${section.linkText}](${wo.tt.make_server_url(section.link)})`)
          }
        })
        wo.tt.copy_to_clipboard(targetContent.join('\n'))
      } else if (action === 'read') {
        let readContent = []
        // 只朗读文字段落，过滤掉图像段落。
        targetStory.forEach((section) => {
          if (section?.text) {
            readContent.push(section.textRejected || section.text)
          }
        })
        this.loadingRead = true
        wo.tt.showLoading()
        const { _state, tucCost, ttsAudio } = await wo.tt.callBase({
          apiWho: 'Aimodel',
          apiTodo: 'text_to_speech',
          apiWhat: {
            inputText: readContent.join('\n')
          }
        })
        setTimeout(wo.tt.hideLoading, 500)
        this.loadingRead = false
        if (wo.bok(_state)) {
          this.play_audio({ audio: ttsAudio })
          if (tucCost) {
            wo.ss.User.onlineUser.balanceTUC = wo.tt.number_precision(wo.ss.User.onlineUser.balanceTUC - tucCost)
            wo.ss.User.onlineUser.sumOutTTS = wo.tt.number_precision(wo.ss.User.onlineUser.sumOutTTS + tucCost)
          }
        } else {
          wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '暂时无法朗读', enUS: 'Cannot readout' }) })
        }
      } else if (action === 'drop') {
        // if (['system'].includes(this.chatList[this.pickedChatIndex]?.role)) {
        //   wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '不能删除系统消息', enUS: 'Cannot delete a system message' }) })
        //   return
        // }
        let targetContent = []
        targetStory.forEach((section) => {
          if (section?.textRejected || section?.text) {
            targetContent.push(section.textRejected || section.text)
          } else if (section?.image) {
            targetContent.push('<' + wo.tt.make_server_url(section.image) + '>')
          } else if (section?.link) {
            targetContent.push(`[${section.linkText}](${wo.tt.make_server_url(section.link)})`)
          }
        })
        wo.tt.showModal({
          title: { zhCN: "您要删除这一段吗？", enUS: 'To delete this section?' },
          content: targetContent.join('\n'),
          showCancel: true,
          confirmText: { zhCN: '删除', enUS: 'Delete' },
          cancelText: { zhCN: '取消', enUS: 'Cancel' },
          success: ({ confirm, cancel }) => {
            if (confirm) {
              let { role, chatUuid, chatTimeUnix } = this.chatList[this.pickedChatIndex]
              wo.tt.callBase({
                apiWho: 'Aimodel',
                apiTodo: 'delete_chat_item',
                apiWhat: { chatUuid, chatTimeUnix }
              })
              //wo.tt.showToast({ title: wo.ll({ zhCN: '成功删除', enUS: 'Deleted Successfully' }) })
              this.chatList.splice(this.pickedChatIndex, 1)
            }
          }
        })
      } else if (action === 'preview') {
        let imageContent = []
        targetStory.forEach((section) => {
          if (section?.image) {
            imageContent.push(wo.tt.make_server_url(section.image))
          }
        })
        imageContent.length > 0 && uni.previewImage({ urls: imageContent })
      } else if (action === 'save') {
        // wo.ss.Creation.pexdataRaw = wo.tt.filter_story(wo.ss.Creation.pexdataRaw)
        wo.ss.Creation.pexdataRaw.push(...targetStory)
        //uni.navigateTo({ url: wo.pagesJson.tabBar.midButton.midPage })
        wo.tt.showToast({ title: { zhCN: '已转载到新作品，等待提交。', enUS: 'This section has been transfered to a new creation waiting for submit.' }, duration: 10000 })
      } else if (action === 'download') {
        for (let section of targetStory) {
          if (section.link) {
            wo.tt.open_url({ url: wo.tt.make_server_url(section.link) })
            break
          }
        }
      }

      //if (wo.envar.inPc) wo.tt.next_focus(0, this.focusList) // 这一句会发生在 showModal 完毕之前，在手机上不够舒服
    },

    async recognize_speech () {
      this.recorderFeedback = ''
      if (!wo.tt.check_online()) {
        return
      }
      // #ifdef APP
      wo.tt.showToast({ title: { zhCN: '当前识别语种：中文 \n（您可以修改语言偏好以识别其他语种)', enUS: 'Current language: English \n(You can change your language preference to recoginize other languages)' }, duration: 5000 })
      plus.speech.startRecognize({
        //        continue: true,
        engine: 'baidu',
        lang: wo.ss.i18n.mylang === 'zhCN' ? 'zh-cn' : 'en-us'
      }, (text) => {
        wo.ss.AI.promptNow += text
        this.send_message_to_ai()
      }, (err) => {
        //        wo.ccerror(err)
        plus.speech.stopRecognize()
        plus.nativeUI.toast(wo.ll({ zhCN: '没有识别到语音', enUS: 'No speech was recognized' }), { align: 'center', verticalAlign: 'center', duration: 'short' })
      })
      //      setTimeout( plus.speech.stopRecognize, 10000 )
      // #endif
      // #ifndef APP
      this.$refs.poptoSpeech.open()
      // #endif
    },

    async onRecorderChange ({ show, type }) {
      const self = this
      if (show) {
        wo.cclog('start recording')
        if (!Recorder?.Support?.()) {
          this.recorderFeedback = { zhCN: '您的浏览器不支持语音', enUS: 'Your browser do not support speech' }
          setTimeout(self.$refs.poptoSpeech.close, 3000)
          return
        }
        if (!this.recorder) {
          this.recorder = Recorder({
            type: 'mp3',
            onProcess (buffers, powerLevel, duration, sampleRate) {
              // this.duration=duration
              // this.powerLevel=powerLevel
              self.speechWaver && self.speechWaver.input(buffers[buffers.length - 1], powerLevel, sampleRate)
            }
          })
        }
        this.recorder.open(() => {
          //this.recorderFeedback = {zhCN:'10 秒后自动关闭', enUS:'10 Seconds before Auto Close'}
          this.speechWaver = Recorder.FrequencyHistogramView({ elem: this.$refs.speechWaverView }) // 必须每次都新建
          this.recorder.start()
          setTimeout(self.$refs.poptoSpeech.close, 10000)
          this.recordingTimerValue = 10
          this.recordingTimer = setInterval(() => {
            if (this.recordingTimerValue > 0) {
              this.recordingTimerValue--
              //this.recorderFeedback = this.recordingTimerValue + wo.ll({zhCN:' 秒后自动关闭', enUS:' Seconds before Auto Close'})
            } else {
              clearInterval(this.recordingTimer)
            }
          }, 1000)
        }, (msg, userNotAllow) => {
          if (userNotAllow) {
            this.recorderFeedback = { zhCN: '用户拒绝了语音识别', enUS: 'User rejected speech recognition' }
            wo.ccinfo('用户拒绝录音')
          } else {
            this.recorderFeedback = { zhCN: '系统无法启动语音识别', enUS: 'System failed speech recognition' }
            wo.ccinfo('系统无法录音', msg)
          }
          setTimeout(self.$refs.poptoSpeech.close, 3000)
        })
      } else {
        wo.ccinfo('Stop recording')
        if (!this.recorder || !Recorder.IsOpen()) {
          wo.ccinfo('没有开启录音')
          return
        }
        clearInterval(this.recordingTimer)
        this.recorder.stop(async (blob, duration) => {
          let recUrl = (window.URL || webkitURL).createObjectURL(blob)
          wo.ccinfo('录音成功结束', blob, duration, recUrl)
          this.recorder?.close?.()

          this.loadingSend = true
          let remainingSeconds = 30
          const progressPrefix = wo.ll({ zhCN: '听写中... ', enUS: 'Transcribing... ' })
          let waiting = wo.tt.showLoading({ title: progressPrefix, mask: true })
          let timer = setInterval(() => {
            if (remainingSeconds > 0) {
              // #ifdef APP
              waiting.setTitle(progressPrefix + --remainingSeconds)
              // #endif
              // #ifndef APP
              uni.showLoading({ title: progressPrefix + --remainingSeconds, mask: true })
              // #endif
            } else {
              clearInterval(timer)
              wo.tt.hideLoading()
            }
          }, 1000)

          let [errorUpload, { data, statusCode } = {}] = await uni.uploadFile({
            url: wo.tt.make_server_url('api/Aimodel/transcribe_whisper'),
            filePath: recUrl, // 不要自己添加 .mp3 等后缀名，因为不符合 blob 的原名，无法被找到！
            name: 'file',
            formData: { _passtoken: uni.getStorageSync('_passtoken'), lang: wo.ss.i18n.mylang }
          })
          clearInterval(timer)
          wo.tt.hideLoading()
          this.loadingSend = false

          // 不知为何，uni.uploadFile返回的 data 是字符串而不是对象
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data)
            } catch (exp) {
              data = {}
            }
          }

          if (wo.bok(data?._state)) {
            if (data?.tucCost) {
              wo.ss.User.onlineUser.balanceTUC = wo.tt.number_precision(wo.ss.User.onlineUser.balanceTUC - data.tucCost)
              wo.ss.User.onlineUser.sumOutSR = wo.tt.number_precision(wo.ss.User.onlineUser.sumOutSR + data.tucCost)
            }
            if (data?.text) {
              wo.ss.AI.promptNow += (data?.text || '')
              if (srAction || wo.ss.srAction) this.send_message_to_ai()
            } else {
              wo.tt.showToast({ type: wo.color.YELLOW, title: { zhCN: '没有识别出语音', enUS: 'No speech text is recoginized' } })
            }
          } else {
            wo.tt.showToast({ type: wo.color.RED, title: wo.envar.sysdown, duration: 5000 })
          }
        }, (error) => {
          wo.ccinfo("Error when closing recorder:", error)
          this.recorder?.close?.()
          //          this.recorder = null
        })

      }
    },

    to_modify_aipp () {
      if (wo.tt.check_online()) {
        wo.ss.AI.aippToModify = wo.ss.AI.aintNow
        uni.navigateTo({ url: 'menu-aipp-modify?aicode=' + wo.ss.AI.aicodeNow })
      }
    }
  }
}
</script>

<template>
  <view id="_aichatter" style="display:flex;flex-flow:column;">
    <uni-popup :is-mask-click="false" :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="dialogDeposit" style>
      <part-deposit
        :depositAmountMin="wo.envar.depositAmountMin"
        :depositOnly="true"
        :depositTitle="{ zhCN: '余额不足，请先充值', enUS: 'Low Balance. Recharge Now!' }"
        @closeMe="()=> { $refs.dialogDeposit.close() }"
      ></part-deposit>
    </uni-popup>

    <part-menu-ring @clickMenuitem="act_on_message" ref="popmenu"></part-menu-ring>

    <uni-list-item
      :border="true"
      style="cursor:unset; border:1px solid var(--border); border-radius:10px;background:var(--blue-matt);"
      thumb-size="lg"
      v-if="!showWelcome"
    >
      <view
        :style="{backgroundImage:wo.tt.make_bgurl(wo.ss.AI.aintNow.aiavatar)}"
        slot="header"
        style="flex:none; background: var(--grey-f) no-repeat center / cover; border-radius:100%; border-radius:100%; height:60px; width:60px;margin-right:10px;"
      ></view>
      <view class="wo-flex column" slot="body" style="flex:auto">
        <!-- <view>{{wo.ll(wo.ss.AI.aintNow.ainame)}}</view> -->
        <text>{{wo.ll(wo.ss.AI.aintNow.ainote)}}</text>
      </view>
      <view class="wo-flex column align-end" slot="footer" style="flex:none">
        <text style="font-size:16px;">{{wo.tt.merge_model_and_owner_price(wo.ss.AI.aintNow)}}</text>
      </view>
    </uni-list-item>

    <part-load-more
      :loadMoreAction="to_get_chatHistory"
      :loadMoreStatus="loadMoreStatus"
      :loadMoreText="{ contentdown: wo.ll({ zhCN: '加载聊天记录', enUS: 'Load chat history' }), contentnomore: wo.ll({ zhCN: '-- 没有更多记录了 --', enUS: '-- No more history --' }) }"
      style="margin-top:0"
    ></part-load-more>

    <uni-list
      :border="false"
      :style="{ height: chatHeight, marginBottom: wo.envar.inPc?'50px':'100px' }"
      id="_聊天记录"
      style="background-color:transparent;overflow:auto;"
    >
      <!-- <part-dev>margin-bottom至少留50px，因为底部操作栏如果设为 wrap，就可能变成2行，就多出50px需要隔开</part-dev> -->

      <uni-list-item :border="false" :customStyle="{ padding: '5px 5px' }" direction="row" id="_欢迎" style="flex:none; cursor:unset" v-if="showWelcome">
        <view
          :style="{ backgroundImage: wo.tt.make_bgurl(chatWelcome.portrait) }"
          id="_欢迎头像"
          slot="header"
          style="flex:none; width:40px; height:40px; line-height:40px; font-size:20px; text-align:center; background:white no-repeat center / cover; border-radius:100%; word-break: keep-all;"
        ></view>
        <view slot="body" style="flex: auto;display:flex;flex-flow:column nowrap;padding:0 10px;">
          <view
            :style="{ flexFlow: chatWelcome.role !== 'user' ? 'row' : 'row-reverse' }"
            class="wo-text-color-grey-9"
            id="_欢迎日期"
            style="display: flex; flex-flow:row; justify-content: space-between; align-items: center; margin-bottom: 4px;"
          >
            <view style="flex: none; font-size: x-small; font-style: italic;display:flex;">
              <text>
                {{
                wo.tt.formatDate(chatWelcome.chatTimeUnix)
                }}
              </text>
            </view>
          </view>
          <view
            :class="{ 'wo-bg-color-blue-matt': chatWelcome.role !== 'user', 'wo-bg-color-red-matt': chatWelcome.role === 'user' }"
            :style="{ width: chatWelcome.story[0].image ? '75%' : 'unset', alignSelf: chatWelcome.role !== 'user' ? 'flex-start' : 'flex-end', textAlign: chatWelcome.role !== 'user' ? 'left' : 'left' }"
            style="width:auto;max-width:75%;border-radius:10px;line-height:1.6em;"
          >
            <!-- <text style="margin:0;word-wrap:break-word;word-break: break-all;">{{ chat.story }}</text> -->
            <part-story-reader :story="chatWelcome.story" style="background:transparent;box-shadow:none;border:0px solid transparent;"></part-story-reader>
          </view>
        </view>
      </uni-list-item>
      <uni-list-item
        :border="false"
        :class="{ 'wo-bg-color-grey-d': isTextModel && 0 <= index && chatList.length - index <= wo.ss.AI.contextToRemember }"
        :customStyle="{ padding: '5px 5px' }"
        :key="index"
        direction="row"
        style="flex:none; cursor:unset"
        v-for="(chat, index) in chatList"
      >
        <!-- todo 注意，如果中间有system chat，那么目前的实现不准确 -->
        <!-- 在安卓和苹果app里, 都无法正确识别 :slot="chat.role==='assistant' ? 'header' : 'footer' 所以只好拆开写" -->
        <view
          :style="{ backgroundImage: wo.tt.make_bgurl(chat.portrait || (chat.role==='system' ? wo.pagesJson.appLogo : wo.ss.AI.aintNow.aiavatar)) }"
          id="_AI头像"
          slot="header"
          style="flex:none; width:40px; height:40px; line-height:40px; font-size:20px; text-align:center; background:white no-repeat center / cover; border-radius:100%; word-break: keep-all;"
          v-if="chat.role !== 'user'"
        >
          <!-- {{ (no portrait) ? '' : chat.ainame ? chat.ainame.substr(0, 2) : 'AI' }} -->
        </view>
        <view
          :style="{ backgroundImage: wo.tt.make_bgurl(chat.portrait || wo.ss.User.onlineUser.portrait) }"
          id="_用户头像"
          slot="footer"
          style="flex:none; width:40px; height:40px; line-height:40px; font-size:18px; text-align:center; background:white no-repeat center / cover; border-radius:100%; word-break: keep-all;"
          v-else
        >
          <uni-icons color="lightgrey" size="26" type="person-filled" v-if="!chat.portrait && !wo.ss.User.onlineUser.portrait"></uni-icons>
          <!-- {{ (chat.portrait || wo.ss.User.onlineUser.portrait) ? '' : wo.ss.User.onlineUser.nickname.substr(0, 2) }} -->
        </view>
        <view slot="body" style="flex: auto;display:flex;flex-flow:column nowrap;padding:0 10px;">
          <view
            :style="{ flexFlow: chat.role !== 'user' ? 'row' : 'row-reverse' }"
            class="wo-text-color-grey-9"
            id="_日期代号消耗"
            style="display: flex; margin-bottom: 4px;"
          >
            <view style="flex: none; font-size: x-small; font-style: italic;display:flex; align-items:center;">
              <text v-if="chat.chatTimeUnix">
                {{
                wo.tt.formatDate(chat.chatTimeUnix)
                }}
              </text>
              <template v-if="chat.role === 'assistant'">
                <text style="margin-left:10px" v-if="chat.aicode">{{ wo.ss.AI.aintNow.ainame || '' }}</text>
                <!-- <text style="margin-left:20px">{{
                (chat.aiUsage||{}).total_tokens || '' }} tokens</text>-->
                <text style="margin-left:10px" v-if="chat.tucCost>0">{{ wo.tt.number_precision(chat.tucCost) + wo.envar.tucSymbol }}</text>
                <text style="margin-left:10px" v-if="chat.timeCost">{{ parseInt(chat.timeCost / 1000) + 's' }}</text>
              </template>
            </view>
          </view>
          <view
            :class="{ 'wo-bg-color-blue-matt': chat.role !== 'user', 'wo-bg-color-red-matt': chat.role === 'user' }"
            :style="{ width: chat.story[0].image ? '75%' : 'unset', alignSelf: chat.role !== 'user' ? 'flex-start' : 'flex-end', textAlign: chat.role !== 'user' ? 'left' : 'left' }"
            @click="(event) => { pickedChatIndex = index; $refs.popmenu.setActions(Object.assign({}, actionsOnPopmenu, chat.story.some(item=>item.text) ? {read: actionRead} : undefined, chat.story.some(item=>item.image) ? {preview:actionPreview} : undefined, chat.story.some(item=>item.link) ? {download:actionDownload} : undefined)); $refs.popmenu.toggleMenu(event) }"
            style="width:auto;max-width:75%;border-radius:10px;line-height:1.6em;cursor:pointer"
          >
            <!-- <text style="margin:0;word-wrap:break-word;word-break: break-all;">{{ chat.story }}</text> -->
            <part-story-reader :story="chat.story" style="background:transparent;box-shadow:none;border:0px solid transparent;"></part-story-reader>
          </view>
        </view>
      </uni-list-item>
    </uni-list>

    <view
      :style="{ position: wo.envar.inPc ? 'relative' : 'fixed', backgroundColor: wo.envar.inPc ? '#606266' : '', boxShadow: wo.envar.inPc ? 'none' : '0 0 20px rgba(0,0,0,0.8)', borderRadius: wo.envar.inPc ? '10px' : '0' }"
      class="wo-flex column wo-bg-color-grey-3 wo-text-color-white"
      id="_底栏"
      style="flex:none;bottom:0;left:0;right:0;margin 0 auto;padding:10px 5px 0;"
    >
      <view id="_聊天输入条" style="padding: 0 5px">
        <part-story-editor
          :allowVideo="false"
          :onPublish="()=>{send_message_to_ai({multimodal:true})}"
          :publishing="loadingSend"
          :story="wo.ss.AI.promptStory"
          :textPlaceholder="wo.ll({ zhCN: '输入文字，或点击下方按钮添加更多段落。', enUS: 'Enter text or click buttons below to add more sections.' })"
          style="flex:auto;border-color: transparent; background-color: var(--bg); border-radius:10px;box-shadow:none;color:black"
          v-if="wo.ss.AI.aintNow.AIT_MULTIMODAL"
        ></part-story-editor>

        <view class="wo-flex column wo-bg-color-grey-f" style="border-radius:10px; border:0px solid transparent; height:unset;padding:10px;" v-else>
          <view class="wo-flex" style="margin-bottom:5px">
            <textarea
              :auto-height="true"
              :focus="focusList[1]"
              :maxlength="promptMaxlen"
              :placeholder="(wo.ss.AI.aicodeNow.startsWith('asst_') ? wo.ll({
                zhCN: '请输入您的问题',
                enUS: 'Ask your question!'
              }) : wo.ss.AI.aicodeNow.startsWith('code') ? wo.ll({
                zhCN: '请输入代码并在注释里提问，例如：//用js写一个函数生成随机数',
                enUS: 'Enter code and ask in comments! Example: //write a js function to generate random number'
              }) : wo.ss.AI.aicodeNow.startsWith('dalle') ? wo.ll({
                zhCN: '请描述你想要的画面，例如：一只海鸥在海边飞',
                enUS: 'Describe your imagination! Example: A seagull is flying by the seaside'
              }) : /sdxl/.test(wo.envar.AI.aicodeNow) ? wo.ll({
                zhCN: '请用英文描述你想要的画面，例如：A seagull is flying by the seaside',
                enUS: 'Describe your imagination in English! Example: A seagull is flying by the seaside'
              }) : wo.ss.AI.aicodeNow.startsWith('cn') ? wo.ll({
                zhCN: '本AI模型为中国区用户专用，请使用中文提问，并遵守中国言论政策要求',
                enUS: 'This AI model is for users in China, please use Chinese language and follow China local policies.',
              }) : isTextModel ? wo.ll({
                zhCN: '请随意提问！例如：用五种语言说你好',
                enUS: 'Ask any question! Example: Say hello in 5 languages'
              }) : '') 
              + (wo.envar.inPc ? wo.ll({ zhCN: `\n（小技巧: 同时按下 Ctrl 和 Enter 即可发送消息）`, enUS: `\n(Tips: Press Ctrl+Enter together to send a message）` }) : '')"
              :placeholder-style="wo.ss.placeholderStyle"
              @keydown.ctrl.13="send_message_to_ai"
              class="wo-bg-color-fg wo-border-color-bg"
              style="flex:auto; border-radius:0;color:black;min-height:3em;line-height: 1.5em; padding: 5px; border-width: 1px; border-style: solid; word-break: break-word"
              v-model="wo.ss.AI.promptNow"
            ></textarea>
          </view>
          <uni-table border ref="table" stripe v-if="wo.ss.AI.promptFileList.length">
            <uni-tr>
              <!-- <uni-th align="left" width="60%">{{wo.ll({zhCN:'文件名',enUS:'File Name'})}}</uni-th>
                <uni-th align="right">{{wo.ll({ zhCN: '大小', enUS: 'Size' })}}</uni-th>
                <uni-th align="right">{{wo.ll({ zhCN: '用途', enUS: 'Usage' })}}</uni-th>
              <uni-th align="right">{{wo.ll({ zhCN: '操作', enUS: 'Action' })}}</uni-th>-->
            </uni-tr>
            <uni-tr :key="index" v-for="(file,index) in wo.ss.AI.promptFileList">
              <uni-td>{{ file.originalname }}</uni-td>
              <!-- <uni-td align="right">{{ wo.tt.format_number(file.size) }}</uni-td> -->
              <uni-td align="right">
                {{ wo.ll( {
                KNOWBASE : {zhCN:'检索',enUS:'Search'},
                TEMPLIB : {zhCN:'编辑',enUS:'Edit'}
                }[file.usage] ) }}
              </uni-td>
              <uni-td align="right">
                <view class="wo-flex end">
                  <view
                    :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}"
                    @click="wo.tt.confirm_to_delete({ content: file.originalname, action: ()=>{wo.ss.AI.promptFileList.splice(index,1)} })"
                    class="wo-button"
                  >
                    <uni-icons color="unset" size="18" type="trash"></uni-icons>
                    <!-- <text style="font-size:12px;">{{wo.ll({zhCN:'删除',enUS:'Remove'})}}</text> -->
                  </view>
                </view>
              </uni-td>
            </uni-tr>
          </uni-table>
          <view class="wo-flex row between align-center">
            <view class="wo-flex wrap align-center" style="color:var(--grey-6);font-size:13px">
              <uni-tooltip :content="wo.envar.inPc?wo.ll({zhCN:'语音输入自动转文字',enUS:'Enter text by speech recognition'}):''">
                <view
                  :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
                  @click="recognize_speech"
                  class="wo-button border-radius-20px wo-border-color-transparent"
                  style="margin-left: 0; white-space: nowrap; flex: none; padding: 2px 8px 2px 5px; margin-right: 10px;"
                >
                  <uni-icons color="unset" size="22" type="mic"></uni-icons>
                  {{wo.ll({zhCN:'语音',enUS:'Speak'})}}
                </view>
              </uni-tooltip>
              <template v-if="wo.envar.AI.aicodeNow.startsWith('asst_')">
                <template v-if="wo.ss.inWeb">
                  <!-- <part-dev>知识库/模版库是assistant level的概念，在具体的thread level上，不要叫这些名字，也不要叫“添加/add"，而是以用户操作的角度命名为"attach to search/edit"</part-dev> -->
                  <uni-tooltip :content="wo.envar.inPc?wo.ll({zhCN:'添加知识文件以供检索',enUS:'Attach a knowledge file for search'}):''">
                    <view
                      :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
                      @click="pickup_file_to_ipfs('KNOWBASE')"
                      class="wo-button border-radius-20px wo-border-color-transparent"
                      style="margin-left: 0; white-space: nowrap; flex: none; padding: 5px 8px; margin-right: 10px;"
                    >
                      <uni-icons color="unset" custom-prefix="icont-basic" size="18" style="margin-right:2px" type="icont-basic-file-search-line"></uni-icons>
                      {{wo.ll({zhCN:'知识',enUS:'Knowledge'})}}
                    </view>
                  </uni-tooltip>
                  <uni-tooltip :content="wo.envar.inPc?wo.ll({zhCN:'添加模版文件以供编辑',enUS:'Attach a template file for edit'}):''">
                    <view
                      :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
                      @click="pickup_file_to_ipfs('TEMPLIB')"
                      class="wo-button border-radius-20px wo-border-color-transparent"
                      style="margin-left: 0; white-space: nowrap; flex: none; padding: 5px 8px; margin-right: 10px;"
                    >
                      <uni-icons color="unset" custom-prefix="icont-basic" size="18" style="margin-right:2px" type="icont-basic-file-edit-line"></uni-icons>
                      {{wo.ll({zhCN:'模版',enUS:'Template'})}}
                    </view>
                  </uni-tooltip>
                </template>
                <view class="wo-button" style="margin-left:5px;color:var(--blue-default)" v-else>
                  <uni-icons color="unset" custom-prefix="icont-basic" style="margin-right:2px" type="icont-basic-hyperlink"></uni-icons>
                  <uni-link
                    :href="wo.ss.linkTree.apps.subtags.webapp.linkUrl+'/#/pages/menu-aipp-aichat?aicode='+wo.envar.AI.aicodeNow"
                    :showUnderLine="false"
                    :text="wo.ll({zhCN:'到网页端添加文件',enUS:'Add files in WebApp'})"
                    color="unset"
                    fontSize="13"
                  ></uni-link>
                </view>
              </template>
            </view>
            <button
              :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
              :disabled="loadingSend || promptEmpty"
              :loading="loadingSend"
              :style="{opacity: promptEmpty?0:1,pointerEvents:promptEmpty?'none':'auto'}"
              @click="send_message_to_ai"
              class="wo-bg-color-main wo-text-color-white"
              plain
              size="mini"
              style="height:32px; line-height:32px; border-radius:5px;margin: 0 0 0 auto; border: 0 solid transparent; white-space: nowrap; flex: none;"
            >
              <uni-icons color="unset" size="18" type="paperplane-filled" v-if="!loadingSend"></uni-icons>
              <!-- <text>{{ wo.ll({ zhCN: '发 表', enUS: 'Publish' }) }}</text> -->
            </button>
          </view>
        </view>
      </view>

      <view class="wo-flex between align-center wo-select-forbidden" id="_操作设置条" style="box-sizing:border-box;padding-top:3px;margin:10px 0;overflow-x:auto">
        <!-- <part-dev>如果想在操作按钮太多时换行，加一个 class=wrap 即可</part-dev> -->
        <view class="wo-flex start" id="_左侧操作集">
          <view @click="$refs.poptoPickAintity.open()" class="wo-flex column between align-center wo-clickable lo-action-item">
            <text class="lo-title">{{ wo.ll(aiSetTitle) }}</text>
            <view
              class="wo-flex align-center wo-clickable"
              style="max-width:40vw;height:28px;font-size:14px;border: 1px solid white; border-radius: 20px;padding:0 10px"
            >
              <text class="text-ellipsis">
                {{ wo.ss.AI.aintNow.ainame || ''
                }}
              </text>
              <uni-icons color="unset" style="margin:0 0 0 5px;" type="bottom"></uni-icons>
            </view>
          </view>

          <!-- <view class="wo-flex column between align-center wo-clickable lo-action-item" v-if="false">
            <text class="lo-title">{{ wo.ll(wo.ss.AI.allChatInOne ? { zhCN: '混合', enUS: 'Mixed' } : { zhCN: '聚焦', enUS: 'Focused' }) }}</text>
            <switch
              :checked="wo.ss.AI.allChatInOne"
              @change="({ detail: { value } }) => { wo.ss.AI.allChatInOne = value; switch_chatHistory(); wo.tt.showToast({ title: 
              wo.ss.AI.allChatInOne 
              ? { zhCN: '显示与所有AI的聊天记录', enUS: 'Show mixed chat history with all AI' } 
              : { zhCN: '只显示与当前AI的聊天记录', enUS: 'Show chat history with the current AI' } }) }"
              style="transform: scale(0.9);margin-left:5px"
            ></switch>
          </view>-->

          <view
            @click="toggle_autoTTS"
            class="wo-flex column between align-center wo-clickable lo-action-item"
            v-if="/^asst_/.test(wo.ss.AI.aicodeNow) || isTextModel"
          >
            <text class="lo-title">{{ wo.ll({ zhCN: '自动朗读', enUS: 'Readout' }) }}</text>
            <uni-icons
              :style="{ backgroundColor: wo.ss.AI.autoTTS ? '#fea600' : 'unset' }"
              :type="wo.ss.AI.autoTTS ? 'sound-filled' : 'sound'"
              class="wo-flex align-center center lo-action-icon"
              color="unset"
              size="26"
              style="width:30px;height:30px;border-radius:50%"
            ></uni-icons>
          </view>

          <view class="wo-flex column between align-center lo-action-item" v-if="!/^asst_/.test(wo.ss.AI.aicodeNow)">
            <template v-if="isTextModel">
              <text class="lo-title">{{ wo.ll({ zhCN: '记忆力', enUS: 'Memory' }) }}</text>
              <uni-number-box
                :actionStyle="{ background: 'transparent', color: 'white', padding: '0' }"
                :inputStyle="{ background: 'transparent', color: 'white', fontSize: 'medium', margin: '0' }"
                :max="99"
                :min="0"
                :value="wo.ss.AI.contextToRemember"
                @change="(value) => { wo.ss.AI.contextToRemember = value }"
                class="lo-scaler"
              ></uni-number-box>
            </template>
            <template v-else-if="/^(dalle2)/.test(wo.envar.AI.aicodeNow)">
              <text class="lo-title">{{ wo.ll({ zhCN: '出图数', enUS: 'Image Number' }) }}</text>
              <uni-number-box
                :actionStyle="{ background: 'transparent', color: 'white', padding: '0' }"
                :inputStyle="{ background: 'transparent', color: 'white', fontSize: 'medium', margin: '0' }"
                :max="10"
                :min="1"
                :value="wo.ss.AI.imgNumToCreate"
                @change="(value) => { wo.ss.AI.imgNumToCreate = value }"
                class="lo-scaler"
              ></uni-number-box>
            </template>
            <template v-else-if="/^code/.test(wo.envar.AI.aicodeNow)">
              <text class="lo-title">{{ wo.ll({ zhCN: '灵活度', enUS: 'Temperature' }) }}</text>
              <uni-number-box
                :actionStyle="{ background: 'transparent', color: 'white', padding: '0' }"
                :inputStyle="{ background: 'transparent', color: 'white', fontSize: 'medium', margin: '0' }"
                :max="1"
                :min="0"
                :step="0.1"
                :value="wo.ss.AI.temperature"
                @change="(value) => { wo.ss.AI.temperature = value }"
                class="lo-scaler"
              ></uni-number-box>
            </template>
          </view>

          <view @click="to_reset_thread" class="wo-flex column between align-center wo-clickable lo-action-item" v-if="/^asst_/.test(wo.ss.AI.aicodeNow)">
            <text class="lo-title">{{ wo.ll({ zhCN: '清空记忆', enUS: 'Reset' }) }}</text>
            <uni-icons class="wo-flex align-center center lo-action-icon" color="unset" size="26" type="refreshempty"></uni-icons>
          </view>

          <!-- 
          <view v-if="Object.keys(promptSet).length>0" class="wo-flex column between align-center wo-clickable lo-action-item" @click="$refs.poptoPickPrompt.open()">
             <text class="lo-title">{{ wo.ll({ zhCN: '帮助', enUS: 'Help' }) }}</text>
             <uni-icons type="help" color="unset" size="26" class="wo-flex align-center center wo-clickable"></uni-icons>
          </view>
          -->
        </view>

        <!--        <view id="_底部开花按钮" v-if="actionsOnBottom"
          style="font-size:13px;width:50px;height:50px;border:1px solid white;margin:0;padding:0; border-radius:100%;background:transparent;color:white;" class="wo-flex column align-center center"
          @click="(e) => { $refs.popmenu.setActions(actionsOnBottom); 
          e.detail.y -= 110; $refs.popmenu.toggleMenu(e) }">
          <uni-icons type="more-filled" color="unset" size="20"></uni-icons>
          <text style="word-break: keep-all">{{ wo.ll({ zhCN: '更多', enUS: 'More' }) }}</text>
        </view>-->

        <view class="wo-flex end align-center wo-clickable lo-action-item" id="_右侧操作集" style="margin-left:auto">
          <!-- <view id="_发表"
            :style="{ cursor: chatList.length > 0 ? 'pointer' : 'not-allowed', opacity: chatList.length > 0 ? 1 : 0 }"
            @click="save_message_to_creation"
            class="wo-flex column between align-center"
          >
            <text class="lo-title">
              {{ wo.ll({ zhCN: '发表', enUS: 'Publish' })
              }}
            </text>
            <uni-icons class="wo-flex align-center center wo-clickable" color="unset" size="26" style="height:30px;" type="upload"></uni-icons>
          </view>-->

          <view
            @click="()=>{
              if (wo.ss.AI.aintNow.accessLevel==='PRIVATE') {
                wo.tt.showModal({
                  title:{zhCN:'请先设为公开应用，即可分享',enUS:'Only public Aipps can be shared'},
                  content:{zhCN:'这是您的私密应用，无法分享给其他朋友。请先修改为公开应用，然后即可分享。',enUS:'This is a private Aipp and is not shareable. Please modify it to be public, then share it to others.'},
                  showCancel:true,
                  confirmText: {zhCN:'去修改',enUS:'To Modify It'},
                  success:({confirm,cancel})=>{
                    if (confirm) {
                      to_modify_aipp()
                    }
                  }
                })
              } else {
                $refs.poptoShare.open()
              }
            }"
            class="wo-flex column between align-center wo-clickable lo-action-item"
          >
            <!-- <part-dev>v-if="wo.ss.aiModelSet[wo.ss.AI.aicodeNow] || wo.ss.AI.aintNow.accessLevel!=='PRIVATE'"
            </part-dev>-->
            <text class="lo-title">{{ wo.ll({ zhCN: '分享', enUS: 'Share' }) }}</text>
            <uni-icons :type="wo.ss.iconShare" class="wo-flex align-center center lo-action-icon" color="unset" ref="shareButton" size="26"></uni-icons>
            <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="poptoShare">
              <part-share-pop
                :shareTitle="`${wo.ll(wo.envar.callnames)} - ${wo.ll(wo.ss.AI.aintNow.ainame)}`"
                :shareUrl="`${wo.envar.webUrlRoot}/#/pages/menu-aipp-aichat?aicode=${wo.ss.AI.aicodeNow}&inhaid=${wo.ss.User.onlineUser._haid||''}`"
                @closeMe="() => { $refs.poptoShare.close() }"
              ></part-share-pop>
            </uni-popup>
          </view>

          <view
            @click="to_modify_aipp"
            class="wo-flex column between align-center wo-clickable lo-action-item"
            v-if="wo.ss.User.onlineUser.usid && wo.ss.AI.aintNow.creatorUsid===wo.ss.User.onlineUser.usid"
          >
            <text class="lo-title">{{ wo.ll({ zhCN: '修改', enUS: 'Modify' }) }}</text>
            <uni-icons class="wo-flex align-center center lo-action-icon" color="unset" size="26" type="compose"></uni-icons>
          </view>

          <view
            @click="()=>{ if (wo.tt.check_online()) $refs.poptoComplain.open() }"
            class="wo-flex column between align-center wo-clickable lo-action-item"
            v-else
          >
            <text class="lo-title">{{ wo.ll({ zhCN: '举报', enUS: 'Report' }) }}</text>
            <uni-icons class="wo-flex align-center center lo-action-icon" color="unset" size="26" type="hand-down"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <view :style="{ height: wo.envar.inPc ? '5px' : '120px' }" id="_滚动到底部锚定">
      <input :focus="focusList[0]" style="width:0px;height:1px" />
      <!-- <part-dev>luk: uni.pageScrollTo 不起作用,可能因为: 应该是布局的问题， 它是页面级的滚动：所有的 滚动单元 必须是在根元素下，由 滚动单元 直接撑起来的高度，就可以滚动到指定位置。(https://www.cnblogs.com/jiayouba/p/14322803.html). 但是发现了这个小技巧, focus到一个input, 就可以滚动到这个focused element.</part-dev> -->
    </view>

    <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_AI列表" ref="poptoPickAintity">
      <view :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth750 }" class="wo-flex column" style="max-height:75vh;margin:0 auto;">
        <view
          class="wo-select-forbidden wo-flex center align-center wo-bg-color-white"
          style="position:absolute;top:0;left:0;right:0;margin:0; color:white;z-index:800;height:44px"
        >
          <view :style="{maxWidth:wo.envar.inPc?'100%':'unset'}" class="wo-flex between align-center" style="width:100%;margin:0 auto">
            <uni-segmented-control
              :current="Object.keys(thisAippDict).indexOf(wo.envar.aippTagNow)"
              :style="{ alignSelf: wo.envar.inPc ? 'center' : 'unset' }"
              :values="Object.values(thisAippDict).map(wo.ll)"
              @clickItem="({currentIndex}) => { wo.envar.aippTagNow = Object.keys(thisAippDict)[currentIndex] }"
              activeColor="var(--blue-default)"
              padding="0 6px"
              style="margin: 10px 0"
              styleType="text"
            ></uni-segmented-control>
            <view
              @click="()=>{ $refs.poptoPickAintity.close(); if (wo.tt.check_online()) uni.navigateTo({ url: 'menu-aipp-create' }) }"
              class="wo-flex align-center wo-bg-color-main wo-text-color-white"
              id="_创建按钮"
              style="cursor:pointer;font-size:12px;border-radius:20px;padding:5px 8px;border:0px;margin-right:5px"
              v-if="wo.ss.Ident.autologgingState !== 'WAITING'"
            >
              <uni-icons color="unset" size="14" style="margin-right:2px" type="plusempty"></uni-icons>
              {{ wo.ll(wo.pageSet['menu-aipp-create'].i18nPageTitle) }}
            </view>
          </view>
        </view>

        <part-show-loading v-if="wo.ss.Ident.autologgingState === 'WAITING'">
          <!-- <part-dev>luk: 1. 等待自动登录结束； 2. 避免在电脑屏幕上 header 和 footer 碰到一起</part-dev> -->
        </part-show-loading>

        <view style="margin-top:44px; padding:10px 0; overflow-y: auto" v-else>
          <part-aipp-models
            @clickAintity="({aicode}) => { $refs.poptoPickAintity.close(); if (aicode !== wo.envar.AI.aicodeNow) { if (wo.envar.inWeb){ uni.redirectTo({url:getCurrentPages().pop().pageName+'?aicode='+aicode}) } else { wo.envar.AI.aicodeNow = aicode; wo.ss.AI.aintNow = wo.ss.aiModelSet[aicode]; switch_chatHistory() } } }"
            v-if="wo.envar.aippTagNow === 'MODELS'"
          ></part-aipp-models>
          <part-aipp-shared
            @clickAintity="({aicode}) => { $refs.poptoPickAintity.close(); if (aicode !== wo.envar.AI.aicodeNow) { if (wo.envar.inWeb){ uni.redirectTo({url:getCurrentPages().pop().pageName+'?aicode='+aicode}) } else { wo.envar.AI.aicodeNow = aicode; wo.ss.AI.aintNow = thisAintSetAll[aicode]; switch_chatHistory() } } }"
            v-if="wo.envar.aippTagNow === 'ALLKINDS'"
          ></part-aipp-shared>
          <part-aipp-my-created
            @clickAintity="({aicode}) => { $refs.poptoPickAintity.close(); if (aicode !== wo.envar.AI.aicodeNow) { if (wo.envar.inWeb){ uni.redirectTo({url:getCurrentPages().pop().pageName+'?aicode='+aicode}) } else { wo.envar.AI.aicodeNow = aicode; wo.ss.AI.aintNow = thisAintSetAll[aicode]; switch_chatHistory() } } }"
            v-else-if="wo.envar.aippTagNow === 'MYCREATED'"
          ></part-aipp-my-created>
        </view>
      </view>
    </uni-popup>

    <!-- <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_AI列表" ref="poptoPickAintity_baseModel">
      <view
        :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth750 }"
        class="wo-flex column"
        style="max-height:75vh;margin:0 auto"
      >
        <part-close-button @closeMe="() => { $refs.poptoPickAintity.close() }"></part-close-button>
        <text style="font-weight:bold;margin:10px 10px 0;text-align: center;">{{ wo.ll(aiSetTitle) }}</text>
        <text
          style="margin:5px 10px 10px; font-size:13px;text-align:center"
        >{{ wo.ll({ zhCN: '价格为AI模型原始成本价，不加价！', enUS: 'Prices are the same as original AI providers' }) }}</text>
        <view style="flex:auto;overflow-y:auto">
          <uni-list :border="true">
            <uni-list-chat
              :avatar="wo.tt.make_server_url(aintity.aiavatar)"
              :avatar-circle="true"
              :key="key"
              :note="wo.ll(aintity.ainote)"
              :style="{ backgroundColor: aintity.aicode === wo.envar.AI.aicodeNow ? 'var(--green-light)' : 'unset', cursor: aintity.aicode === wo.envar.AI.aicodeNow ? 'unset' : 'pointer' }"
              :title="aintity.ainame"
              @click="() => { if (aintity.aicode !== wo.envar.AI.aicodeNow) { wo.envar.AI.aicodeNow = key; switch_chatHistory() }; $refs.poptoPickAintity.close() }"
              badge-positon="right"
              clickable
              v-for="(aintity, key) in thisAintSetAll"
            >
              <view class="wo-flex end align-center" style="flex:auto">
                <text style="font-size:16px">{{ wo.ll(aintity.aiprice || wo.envar.aiModelSet[aintity.aicodeModel].aiprice) }}</text>
              </view>
            </uni-list-chat>
          </uni-list>
          <uni-load-more :contentText="{ contentnomore: '----' }" status="noMore"></uni-load-more>
        </view>
      </view>
    </uni-popup>-->

    <!-- <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_AI列表" ref="poptoPickAintity_baseModel_table">
      <view
        :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth750 }"
        class="wo-flex column"
        style="max-height:75vh;margin:0 auto"
      >
        <part-close-button @closeMe="() => { $refs.poptoPickAintity.close() }"></part-close-button>
        <text style="font-weight:bold;margin:10px 10px 0;text-align: center;">{{ wo.ll(aiSetTitle) }}</text>
        <text
          style="margin:5px 10px 10px; font-size:13px;text-align:center"
        >{{ wo.ll({ zhCN: '价格为AI模型原始成本价，不加价！', enUS: 'Prices are the same as original AI providers' }) }}</text>
        <view style="flex:auto;overflow-y:auto">
          <uni-table data-comment="uni-table有排序和搜索功能,但无法点击选择某一行,并且表头无法固定不动.因此和uni-list联合起来使用" style="flex:none;overflow:visible;">
            <uni-tr>
              <uni-th style="padding-left:10px" width="30%">{{ wo.ll({ zhCN: '模型', enUS: 'Model' }) }}</uni-th>
              <uni-th align="center" style width="40%">{{ wo.ll({ zhCN: '简介', enUS: 'Purpose' }) }}</uni-th>
              <uni-th align="right" style="padding-right:10px" width="30%">
                {{ wo.ll({ zhCN: '耗能', enUS: 'Cost' })
                }}
              </uni-th>
            </uni-tr>
            <uni-tr></uni-tr>
          </uni-table>
          <view class="modelListContainer" style="flex:auto;overflow-y:auto">
            <uni-list>
              <uni-list-item
                :border="false"
                :customStyle="{ padding: '', backgroundColor: aintity.aicode === wo.envar.AI.aicodeNow ? '#f3f4f6' : 'unset' }"
                :key="key"
                @click="wo.envar.AI.aicodeNow = key; $refs.poptoPickAintity.close()"
                clickable
                v-for="(aintity, key) in thisAintSetAll"
              >
                <view slot="header" style="flex:none;display: flex;flex-flow:row nowrap;align-items: center;">{{ wo.ll(aintity.ainame) }}</view>
                <view class="text-ellipsis" slot="body" style="flex:auto;text-align: center;">{{ wo.ll(aintity.ainote || { zhCN: '未知', enUS: 'unknown' }) }}</view>
                <view slot="footer" style="flex:none;">{{ wo.ll(aintity.aiprice || { zhCN: '未知', enUS: 'unknown' }) }}</view>
              </uni-list-item>
            </uni-list>
            <uni-load-more :contentText="{ contentnomore: wo.ll({ zhCN: '-- 更多AI上线中 --', enUS: '-- More AIs are coming --' }) }" status="noMore"></uni-load-more>
          </view>
        </view>
      </view>
    </uni-popup>-->

    <!-- <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_提问范例" ref="poptoPickPrompt">
      <view
        :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth750 }"
        class="wo-flex column"
        style="max-height:75vh;margin:0 auto"
      >
        <view class="text-ellipsis wo-flex center" style="margin:20px;">
          {{ wo.ll({
          zhCN: '提问范例', enUS: 'Prompt Examples'
          }) }}
        </view>
        <view class="wo-flex wrap center align-center" style="overflow-y:auto; flex:auto; color:white; font-size:14px; font-weight:bold; margin-bottom: 20px">
          <view
            :key="key"
            :style="{ backgroundColor: color || 'var(--blue-default)' }"
            @click="wo.ss.AI.promptNow = wo.ll(prompt); $refs.poptoPickPrompt.close()"
            class="wo-flex center align-center"
            style="cursor:pointer;flex:none; border-radius: 10px;margin:10px; padding:8px 16px; height:100px;font-size:30px; text-align: center;"
            v-for="({ title, color, prompt }, key) in promptSet"
          >
            <text>{{ wo.ll(title) }}</text>
          </view>
        </view>
      </view>
    </uni-popup>-->

    <uni-popup :is-mask-click="false" @change="onRecorderChange" background-color="black" ref="poptoSpeech" type="center">
      <view :style="{ width: wo.envar.inPc ? '500px' : '500rpx' }" class="wo-flex column align-center" style="margin:0 auto;">
        <uni-icons color="red" size="60" style="padding:20px 20px 10px" type="mic"></uni-icons>
        <!-- <view style="color:white;font-size:30px;padding:10px;text-align: center;">{{wo.ll({zhCN:'语音输入',enUS:'Talk to Me'})}}</view> -->
        <view style="color:white;font-size:16px;padding:10px;text-align: center;" v-if="recorderFeedback">{{ wo.ll(recorderFeedback) }}</view>
        <div ref="speechWaverView" style="height:100px;width:60%;"></div>
        <view class="wo-flex between align-center" style="width:100%;padding-top:40px">
          <!-- <view class="wo-flex row center align-center" style="width:50%; height:60px;color:white;font-size:16px;cursor:pointer; background: linear-gradient(90deg, var(--yellow-dark), var(--yellow-matt))"
            @click="recorder && recorder.pause()">
            <text>{{wo.ll({zhCN:'暂停',enUS:'Pause'})}}</text>
            <uni-icons type="paperplane-filled" size="20" color="unset" style="margin-left:5px"></uni-icons>
          </view>-->
          <view
            @click="() => { $refs.poptoSpeech.close() }"
            class="wo-flex row center align-center"
            style="flex:auto;height:60px;color:white;font-size:16px;cursor:pointer; background: linear-gradient(90deg, var(--red-dark), var(--red-light))"
          >
            <!-- click 和 longpress 冲突：https://blog.csdn.net/snow_love_beer/article/details/124380540 -->
            <!-- <uni-icons type="micoff" size="20" color="unset"></uni-icons> -->
            <text style="margin:0 5px">{{ wo.ll({ zhCN: '停止', enUS: 'Stop' }) }}</text>
            <text>{{ recordingTimerValue }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_举报弹窗" ref="poptoComplain" style="z-index:999">
      <view :style="{ maxWidth:wo.envar.inPc?'600px':'unset', minWidth:wo.envar.inPc?'500px':'unset' }">
        <view
          style="padding: 20px 10px; font-size: 16px; font-weight:bold; text-align: center; line-height:2em"
        >{{ wo.ll(wo.envar.uitComplainTitle || {zhCN:'您要举报这个应用吗？',enUS:'Report this Aipp?'}) }}</view>
        <textarea
          :auto-height="false"
          :placeholder="wo.ll({ zhCN: '请说明您的举报理由。提交成功后，服务团队将在24小时内进行处理。感谢您的举报！', enUS: 'Enter the reason of your complaints and then submit. The service team will act on your report within 24 hours. Thank you for your report!' })"
          :placeholder-style="wo.ss.placeholderStyle"
          class="wo-bg-color-fg wo-border-color-border"
          maxlength="512"
          style="border-radius:4px;box-sizing:border-box; margin:0 10px 20px; width: inherit; height: 5em;  line-height: 1.5em; padding: 5px; border-width: 1px; border-style: solid; word-break: break-word;flex:none"
          v-model="reportReason"
        ></textarea>
        <view class="wo-flex align-center">
          <button
            @click="() => { $refs.poptoComplain.close() }"
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
            @click="to_report_aipp"
            class="wo-flex row center align-center"
            style="width:50%;height:60px;color:white;border-radius:0;border:0;background:var(--red-default)"
          >
            <!-- 20240102 发现在 uni-popup 里，button disabled 鼠标不会显示为禁用状态，要显性设置 cursor:not-allowed -->
            <template v-if="!reportEmpty">
              <uni-icons color="unset" size="20" style="margin-right:5px" type="hand-down"></uni-icons>
              <text style="font-size:16px">{{wo.ll({zhCN:'举报',enUS:'Report'})}}</text>
            </template>
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style scoped lang="scss">
//.modelListContainer::-webkit-scrollbar{width:0 !important} // 不显示滚动条

.lo-action-item {
  //  height: 100%;
  margin: 0 5px;
}

.lo-action-icon {
  //  width: 50px;
  height: 30px;
}

.lo-scaler {
  height: 28px;
  border: 0px solid white;
  border-radius: 20px;
}

.lo-title {
  white-space: nowrap;
  word-break: keep-all;
  font-size: 12px;
}
</style>
