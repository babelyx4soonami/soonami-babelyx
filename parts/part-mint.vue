<script>
import ticc from 'tic-crypto'

export default {
  props: {

  },
  data () {
    return {
      payToMintFeedback: '',
      minting: false,

      authorizationList: {
        AGENT: { zhCN: '全权委托', enUS: 'Agent', intro: { zhCN: '您全权委托平台加密封印您的作品。\n（公寓模式，你委托物业管理全部钥匙）', enUS: 'You authorize the agent to manage your creation' } },
        SELF: { zhCN: '自主管理', enUS: 'Self', intro: { zhCN: '您自行加密封印并响应日常访问请求。\n（民宿模式，您本人掌管全部钥匙）', enUS: 'You take full responsibility to manage this creation. Never leak or forget this mnemonic!' } },
        JOINT: { zhCN: '联合管理', enUS: 'Joint', intro: { zhCN: '您和平台联合管理。（中介模式，您和中介各自持有钥匙）', enUS: 'You and the agent manage the creation together' } },
      },
      authTypeNow: 'SELF',
      secword: '',

      //pexdataRaw: [{ text: '' }], // 搜了下也没做什么处理，但每次回到本页面，pexdataRaw 都恰好是被重置了的，挺实用，但是很奇怪。似乎是，通过navigationBar的返回按钮返回的页面，就会自动重置，其他页面上就不会这样自动重置。

      focusList: {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false
      },

      showErrorEmptyStory: false,
      storyFeedback: '',

      loadingImage: false,

      hasBgColor: false,
      hasBorder: false,

    }
  },
  computed: {
    storyEmpty () {
      return !wo.ss.Creation.pexdataRaw.some(section => Object.values(section).some(val => val?.trim?.()))
    },
    depositAmountMin () {
      let min = 0
      if (wo.ss.User.onlineUser.balanceTUC < this.totalPriceToMint) {
        // 避免存钱不够，不要四舍五入，要用 Math.ceil
        min = Number(Math.ceil((this.totalPriceToMint - wo.ss.User.onlineUser.balanceTUC) / wo.envar.coinToTUC?.[wo.ss.i18n.depositCoinNow.coinCode] * 100) / 100)
      }
      return min < wo.envar.depositAmountMin ? wo.envar.depositAmountMin : min
    },
    totalPriceToMint () {
      return wo.envar.priceToMint * wo.ss.Creation.pexdataRaw.length
    }
  },
  // watch: {
  //   storyEmpty(vnew, vold){
  //     if (vnew){
  //       this.storyFeedback = ''
  //       this.showErrorEmptyStory = false
  //     }
  //   }
  // },

  methods: {

    disable_focus () {
      this.focusList = {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false
      }
    },

    enable_focus () {
      this.focusList[0] = true
    },

    create_random_secword () {
      try {
        this.secword = ticc.randomize_secword({ lang: wo.ss.i18n.mylang })
      } catch (exception) {
        wo.tt.showToast({
          type: wo.color.RED,
          title: wo.ll({
            zhCN: '无法生成密语，也许是您的设备不支持加密，请尝试换用其他设备吧',
            enUS: 'Unable to create a mnemonics on this device. Please try with another device.',
          }),
          icon: false,
        })
      }
    },

    async validate_creation () {
      wo.ss.Creation.pexdataRaw = wo.tt.filter_story(wo.ss.Creation.pexdataRaw)
      if (!wo.ss.Creation.pexdataRaw?.length) {     // 过滤掉空的段落
        wo.ss.Creation.pexdataRaw = [{ text: '' }]
        this.showErrorEmptyStory = true
        this.storyFeedback = { zhCN: '内容不能为空！', enUS: 'Content cannot be empty!' }
        this.focusList[1] = true
        setTimeout(() => {
          // 虽然在 part-story-editor 里会自动清空 feedback，但不是这里被传过去的 prop，如果不在这里清空，就只能出现一次警告提示
          this.storyFeedback = ''
        }, 3000)
        return
      }

      this.$refs.formContent
        .validate()
        .then(async (formData) => {
          this.$refs.dialogPact.open()
        })
        .catch((err) => {
          wo.ccerror(err)
        })
    },

    async validate_contract () {
      this.$refs.dialogEncrypt.open()
    },

    async to_mint_by_agent () {
      if (this.minting) {
        return
      }
      if (!wo.tt.check_online()) {
        return
      }
      this.payToMintFeedback = ''
      wo.tt.showLoading({ title: wo.ll({ zhCN: '铸造中...', enUS: 'Minting...' }), mask: wo.envar.waitMask })
      this.minting = true
      let { _state, creation, rejectReason } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'mint_creation_by_agent',
        apiWhat: {
          pexdataRaw: wo.ss.Creation.pexdataRaw,
          openTitle: wo.ss.Creation.openTitle,
          openCover: wo.ss.Creation.openCover,
          viewerPact: {
            type: wo.ss.Creation.allowViewer ? undefined : 'FORBIDDEN',
            amount: Number(wo.ss.Creation.priceViewerPact) || 0,
            coin: wo.ss.Creation.coinViewerPact,
          },
          holderPact: {
            type: wo.ss.Creation.allowHolder ? undefined : 'FORBIDDEN',
            amount: Number(wo.ss.Creation.priceHolderPact) || 0,
            coin: wo.ss.Creation.coinHolderPact,
            quota: Number(wo.ss.Creation.quotaHolderPact) || 0,
          },
          ownerPact: {
            type: wo.ss.Creation.allowOwner ? undefined : 'FORBIDDEN',
            amount: Number(wo.ss.Creation.priceOwnerPact) || 0,
            coin: wo.ss.Creation.coinOwnerPact,
          },
          totalPriceToMint: this.totalPriceToMint
        },
      })
      this.minting = false
      wo.tt.hideLoading()

      if (wo.bok(_state)) {
        this.$refs.dialogEncrypt.close()
        this.$refs.dialogPact.close()
        wo.store.commit('Creation/reset_pexdataRaw')
        //wo.tt.normalize_creation(creation)
        wo.ss.User.onlineUser.countAsCreator++
        wo.ss.Creation.myCollectionAsCreator.unshift(creation)
        wo.ss.User.onlineUser.balanceTUC -= this.totalPriceToMint
        wo.ss.Creation.creationNow = creation
        uni.navigateTo({ url: 'show-creation?pexdataCidHash=' + creation.pexdataCidHash })
      } else if (wo.ss.i18n.userlandCode === 'CN' && wo.envar.banChina?.includes?.(_state)) { // _state === 'CENSOR_BAD_IN_CN'
        wo.tt.showModal({
          title: { zhCN: '您的评论疑似违反中国审查政策无法发表', enUS: 'Your creation was rejected by China moderation policy' },
          content: rejectReason,
          confirmText: { zhCN: '知道了', enUS: 'Got it' },
          showCancel: false,
        })
      } else if (_state === 'ERROR_DUPLICATE_CREATION') {
        this.payToMintFeedback = { zhCN: '该作品已经存在，无法重复提交。', enUS: 'Conflict with an existing creation.' }
      } else {
        this.payToMintFeedback = wo.envar.sysdown
      }
    },

    async to_mint_by_choice (bymode) {
      if (this.minting) {
        return
      }
      if (!ticc.is_secword({ secword: this.secword })) {
        wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ enUS: 'Lack of secword', zhCN: '请输入您的密语' }) })
        return
      }

      this.payToMintFeedback = ''
      wo.tt.showLoading({ title: wo.ll({ zhCN: '铸造中...', enUS: 'Minting...' }), mask: wo.envar.waitMask })
      this.minting = true

      let { _state, pexdataCid } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'story_to_cid',
        apiWhat: { pexdataRaw: wo.ss.Creation.pexdataRaw },
      })
      if (!wo.bok(_state)) {
        this.minting = false
        wo.tt.hideLoading()

        this.payToMintFeedback = { zhCN: '该作品没有成功地存入IPFS。请稍后再试一次，或请向客服报告。', enUS: 'Failed to store this creation in IPFS. Please try again later, or report to the customer service.' }
      } else {
        const creatorKeypair = ticc.secword_to_keypair({ secword: this.secword, coin: wo.envar.chainCoin })
        let { _state, creation, rejectReason } = await wo.tt.callBase({
          apiWho: 'Creation',
          apiTodo: 'mint_creation_by_choice',
          apiWhat: {
            bymode,
            pexdataRaw: wo.ss.Creation.pexdataRaw,
            openTitle: wo.ss.Creation.openTitle,
            openCover: wo.ss.Creation.openCover,
            viewerPact: {
              type: wo.ss.Creation.allowViewer ? undefined : 'FORBIDDEN',
              amount: Number(wo.ss.Creation.priceViewerPact) || 0,
              coin: wo.ss.Creation.coinViewerPact,
            },
            holderPact: {
              type: wo.ss.Creation.allowHolder ? undefined : 'FORBIDDEN',
              amount: Number(wo.ss.Creation.priceHolderPact) || 0,
              coin: wo.ss.Creation.coinHolderPact,
              quota: Number(wo.ss.Creation.quotaHolderPact) || 0,
            },
            ownerPact: {
              type: wo.ss.Creation.allowOwner ? undefined : 'FORBIDDEN',
              amount: Number(wo.ss.Creation.priceOwnerPact) || 0,
              coin: wo.ss.Creation.coinOwnerPact,
            },
            totalPriceToMint: this.totalPriceToMint,

            creatorAddress: ticc.secword_to_address({ secword: this.secword, coin: wo.envar.chainCoin }),
            creatorSeal: {
              sealMode: 'ecrsa',
              cidoSeal: await ticc.encrypt_easy({
                data: { cidType: 'IPFS', pexdataCid },
                key: creatorKeypair
              }),
            },
            creatorPubkey: creatorKeypair.pubkey,
          }
        })

        this.minting = false
        wo.tt.hideLoading()

        if (wo.bok(_state)) {
          this.$refs.dialogEncrypt.close()
          this.$refs.dialogPact.close()
          wo.store.commit('Creation/reset_pexdataRaw')
          //wo.tt.normalize_creation(creation)
          if (wo.ss.User.onlineUser.usid) {
            wo.ss.User.onlineUser.countAsCreator++
            wo.ss.Creation.myCollectionAsCreator.unshift(creation)
            wo.ss.User.onlineUser.balanceTUC -= this.totalPriceToMint
          }
          wo.ss.Creation.creationListAll.unshift(creation)
          wo.ss.Creation.creationNow = creation
          // uni.navigateTo({ url: 'show-creation?pexdataCidHash=' + creation.pexdataCidHash })
        } else if (wo.ss.i18n.userlandCode === 'CN' && wo.envar.banChina?.includes?.(_state)) { // _state === 'CENSOR_BAD_IN_CN'
          wo.tt.showModal({
            title: { zhCN: '您的评论疑似违反中国审查政策无法发表', enUS: 'Your creation was rejected by China moderation policy' },
            content: rejectReason,
            confirmText: { zhCN: '知道了', enUS: 'Got it' },
            showCancel: false,
          })
        } else if (_state === 'ERROR_DUPLICATE_CREATION') {
          this.payToMintFeedback = { zhCN: '该作品已经存在，无法重复提交。', enUS: 'Conflict with an existing creation.' }
        } else {
          this.payToMintFeedback = wo.envar.sysdown
        }
      }
    },

    async upload_creation_cover () {
      if (!wo.tt.check_online()) {
        return
      }
      this.loadingImage = true
      let { _state, ...fileInfo } = await wo.tt.pickupFile({ baseType: wo.envar.baseTypeFile, mediaType: 'image' })
      this.loadingImage = false
      if (wo.bok(_state)) {
        wo.ss.Creation.openCover = wo.tt.choose_url(fileInfo)
      } else {
        wo.tt.showToast({
          type: wo.color.RED,
          title: wo.envar.sysdown, duration: 5000
        })
      }
    },
  },
}
</script>

<template>
  <view id="_创作铸造">
    <uni-forms label-position="left" label-width="0" ref="formContent" validate-trigger="submit">
      <!-- <uni-card isFull style="background: transparent;margin:40rpx 0;" :title="wo.ll({ zhCN: '本体存在', enUS: 'Content' })"
              subTitle="" :extra="wo.ll({ zhCN: '将被加密保存', enUS: 'Existence Content' })" :spacing="'0'"
      :headerStyle="{ backgroundColor: 'var(--border)' }">-->

      <view
        :class="{ 'wo-bg-color-grey-e': hasBgColor }"
        :style="{ border: hasBorder ? '1px var(--border) solid' : '0' }"
        style="padding:10px; margin-bottom:1px;border-radius:4px 4px 4px 4px"
      >
        <view class="wo-flex start align-center" style="padding-bottom:5px">
          <text class="section-title" style="flex:none">{{ wo.ll({ zhCN: '标题', enUS: 'Title' }) }}</text>
          <text class="section-description">{{ wo.ll({ zhCN: '将被公开。可以省略', enUS: 'Public. Can leave blank.' }) }}</text>
        </view>
        <input
          :focus="focusList[0]"
          :placeholder="wo.ll({ zhCN: '无题', enUS: 'Untitled' })"
          :placeholder-style="wo.ss.placeholderStyle"
          @keydown.enter.native="wo.tt.next_focus(0, focusList)"
          class="wo-bg-color-fg"
          style="padding:5px;border-radius:4px"
          type="text"
          v-model="wo.ss.Creation.openTitle"
        />

        <template v-if="wo.envar.allowCover">
          <view class="wo-flex start align-center" id="_封面" style="padding:10px 0 5px; margin-top:10px">
            <text class="section-title" style="flex:none">{{ wo.ll({ zhCN: '封面', enUS: 'Cover' }) }}</text>
            <text class="section-description">{{ wo.ll({ zhCN: '将被公开。可以省略', enUS: 'Public. Can leave blank.' }) }}</text>
            <view class="wo-flex end" style="flex:auto" v-if="wo.envar.smallCover">
              <view>
                <button
                  :style="{ backgroundImage: wo.tt.make_bgurl(wo.ss.Creation.openCover) }"
                  @click="upload_creation_cover"
                  style="width:40px; height:40px; box-sizing: border-box; background: white no-repeat scroll center / cover border-box; display: flex; justify-content: center; align-items: center;"
                >
                  <uni-icons size="24" style="color:lightgrey; margin:0;" type="plusempty"></uni-icons>
                </button>
              </view>
            </view>
          </view>
          <view class="wo-flex start" v-if="!wo.envar.smallCover">
            <view>
              <button
                :style="{ width: wo.envar.inPc ? '80px' : '160rpx', height: wo.envar.inPc ? '80px' : '160rpx', backgroundImage: wo.tt.make_bgurl(wo.ss.Creation.openCover) }"
                @click="upload_creation_cover"
                style="box-sizing: border-box; background: white no-repeat scroll center / cover border-box; display: flex; justify-content: center; align-items: center;"
              >
                <uni-icons size="60" style="color:lightgrey; margin:0;" type="plusempty"></uni-icons>
              </button>
            </view>
          </view>
        </template>
      </view>

      <view
        :class="{ 'wo-bg-color-grey-e': hasBgColor }"
        :style="{ border: hasBorder ? '1px var(--border) solid' : '0' }"
        style="padding:10px 5px 0 5px; border-radius:4px 4px 4px 4px; margin-top:10px"
      >
        <view class="wo-flex start align-center" style="padding:0 5px">
          <text class="section-title" style="flex:none">
            <text style="color:red; margin-right:5px">*</text>
            {{ wo.ll({ zhCN: '内容', enUS: 'Content' }) }}
          </text>
          <text class="section-description">
            {{ wo.ll({
            zhCN: '将被加密保存在IPFS，天长地久，坚不可摧',
            enUS: 'To be encrypted & stored in IPFS'
            }) }}
            <template
              v-if="wo.envar.priceToMint"
            >
              {{ wo.ll({ zhCN: '。预估能量耗费 = ', enUS: '. Estimated Cost = ' }) }}
              {{ String(wo.envar.priceToMint * wo.ss.Creation.pexdataRaw.length) + wo.envar.tucSymbol }}
            </template>
          </text>
        </view>
        <part-story-editor
          :allowVideo="true || wo.envar.allowVideoInCreation"
          :baseType="wo.envar.baseTypeFile"
          :feedback="storyFeedback"
          :isFocused="focusList[1]"
          :maxLength="12"
          :maxLengthText="2000"
          :story="wo.ss.Creation.pexdataRaw"
          :style="{ borderColor: storyEmpty && showErrorEmptyStory ? '#dd6161' : 'transparent' }"
          :textPlaceholder="wo.ll({ zhCN: '输入文字，或点击下方按钮添加更多段落。', enUS: 'Enter text or click buttons below to add more sections.' })"
          style="box-shadow:none;padding:0px;background-color:transparent;border-width:1px;border-style:solid;"
        ></part-story-editor>
      </view>

      <!-- </uni-card> -->
      <!-- </uni-forms> -->

      <!-- <uni-collapse style="margin-top:10px">
        <uni-collapse-item
          :class="{ 'wo-bg-color-grey-e': hasBgColor }"
          :open="uni.getSystemInfoSync().windowHeight > 800 ? true : false"
          :style="{ border: hasBorder ? '1px var(--border) solid' : '0' }"
          style="border-radius:4px;"
        >
          <template v-slot:title>
            <view class="wo-flex start align-center" style="padding:10px; cursor:pointer">
              <text class="section-title" style="flex:none">{{ wo.ll({ zhCN: '合约', enUS: 'Pact' }) }}</text>
              <text class="section-description">
                {{ wo.ll({
                zhCN: '设置合约，自主经营您的永久权益', enUS: 'Sign contract to obtain benefits forever'
                }) }}
              </text>
            </view>
          </template>
        </uni-collapse-item>
      </uni-collapse>-->

      <button
        :disabled="storyEmpty"
        :style="{opacity:storyEmpty?0.2:1}"
        @click="validate_creation"
        class="wo-bg-color-main wo-text-color-white"
        style="margin:30px 0; border-radius:30px; background: linear-gradient(90deg, var(--yellow-light), var(--red-default))"
      >
        {{ wo.ll({ zhCN: '下一步', enUS: 'Next' }) }}
        <uni-icons color="unset" size="20" style="margin-left:5px" type="forward"></uni-icons>
      </button>
    </uni-forms>

    <uni-popup
      :is-mask-click="true"
      :type="wo.envar.inPc ? 'center' : 'bottom'"
      @change="payToMintFeedback = ''"
      background-color="white"
      ref="dialogPact"
      style="z-index:999"
    >
      <view :style="{ minWidth: wo.ss.minWidth600, maxWidth: wo.ss.maxWidth750 }" style="max-height:75vh;margin:0 auto;background-color:var(--grey-f)">
        <part-close-button @closeMe="() => { $refs.dialogPact.close() }"></part-close-button>

        <view class="wo-flex column" style="padding:20px 20px 0">
          <text style="text-align:center; padding:0; font-size:20px; font-weight:bold">{{ wo.ll({zhCN:'定义您的合约',enUS:'Define Your Contract'})}}</text>
          <part-dev
            style="text-align:center; padding-top:5px; font-size:14px;; color:#999"
          >{{ wo.ll({zhCN:'定义合约，为您带来长久收益',enUS:'Define contracts to earn passive incomes forever'})}}</part-dev>
        </view>

        <view style="padding:20px;">
          <!-- <uni-card isFull style="background: transparent;margin:40rpx 0" :title="wo.ll({ zhCN: '设置选项', enUS: 'Settings' })"
        subTitle="" :extra="wo.ll({ zhCN: '以下都可留空', enUS: 'All can leave blank' })" :spacing="'0'"
          :headerStyle="{ backgroundColor: 'var(--border)' }">-->
          <!-- <uni-forms ref="formOptions" label-position="left" label-width="0" validate-trigger="submit"> -->
          <!-- <view style="padding:0 5px"> 为了配合 uni-card 对齐本体内容 -->

          <view class="wo-flex start align-end" id="_阅览权">
            <uni-icons color="unset" type="eye"></uni-icons>
            <text class="pact-title">{{ wo.ll(wo.ss.pactDict.VIEWERSHIP) }}</text>
            <text class="pact-description">
              {{ wo.ll(wo.envar.uitViewer || {
              zhCN: '其他用户向您付费后，才能阅览本作品内容。', // 您可以设置一个解密费用，其他用户付费后，才能解密并阅览内容。作为原创作者，您将从每次解密中获得收益。',
              enUS: 'Others must pay a decryption fee to view this creation.'
              }) }}
            </text>
          </view>
          <view class="wo-flex row align-center" style="padding-top:5px; margin-bottom:30px;">
            <view class="wo-flex column center align-center" style="margin-right:10px;height:40px">
              <switch :checked="wo.ss.Creation.allowViewer" @change="({ detail: { value } }) => { wo.ss.Creation.allowViewer = value }" class="pact-switch"></switch>
              <!-- <text class="pact-switch-label">{{ wo.ss.Creation.allowViewer ? wo.ll(wo.ss.pactDict.VIEW_PERMIT) : wo.ll(wo.ss.pactDict.VIEW_FORBIDDEN) }}</text> -->
            </view>
            <text class="pact-switch-label" style="font-size:14px" v-if="!wo.ss.Creation.allowViewer">
              {{
              wo.ss.Creation.allowViewer ? wo.ll(wo.ss.pactDict.VIEW_PERMIT) : wo.ll(wo.ss.pactDict.VIEW_FORBIDDEN)
              }}
            </text>
            <template v-else>
              <input
                :disabled="!wo.ss.Creation.allowViewer"
                :focus="focusList[2]"
                :placeholder="'0: ' + wo.ll(wo.ss.pactDict.VIEW_FREE)"
                :placeholder-style="wo.ss.placeholderStyle"
                :style="{ backgroundColor: wo.ss.Creation.allowViewer ? '#fff' : '#808080' }"
                @keydown.enter.native="wo.tt.next_focus(2, focusList)"
                onkeypress="return '-' !== event.key"
                type="digit"
                v-model="wo.ss.Creation.priceViewerPact"
              />
              <text style="font-size:22px;padding-left:6px;color:#808080">{{ wo.envar.tucSymbol }}</text>
              <!-- <uni-forms-item style="flex: none;">
            <part-coin-picker :coinList="Object.values(wo.ss.i18n.cryptocoinSet)"
              :coinInit="Object.keys(wo.ss.i18n.cryptocoinSet).indexOf(wo.envar.chainCoin)" :coinFixed="true"
              @coinPicked="(coin) => wo.ss.Creation.coinViewerPact = coin"></part-coin-picker>
              </uni-forms-item>-->
            </template>
          </view>

          <!-- <uni-section type="" style="background:transparent;" :styleHeader="{ paddingBottom: '5px' }"
          titleDirection="column" :title="" :subTitle=""></uni-section>-->
          <view class="wo-flex start align-end" id="_持有权">
            <uni-icons color="unset" type="cart"></uni-icons>
            <text class="pact-title">{{ wo.ll(wo.ss.pactDict.HOLDERSHIP) }}</text>
            <text class="pact-description">
              {{ wo.ll(wo.envar.uitHolder || {
              zhCN: '出售本作品的拷贝、席位、份额给其他用户。', //'您可以销售作品的限量拷贝、席位、份额，用户购买后可持有、使用或转售。作为主人，您将从每份销售中获得收益。',
              enUS: 'Sell this creation\'s copies, shares, seats, etc. to buyers.'
              }) }}
            </text>
          </view>
          <view class="wo-flex row align-center" style="padding-top:5px;margin-bottom:30px">
            <view class="wo-flex column center align-center" style="margin-right:10px;height:40px">
              <switch :checked="wo.ss.Creation.allowHolder" @change="({ detail: { value } }) => { wo.ss.Creation.allowHolder = value }" class="pact-switch"></switch>
              <!-- <text class="pact-switch-label">{{ wo.ss.Creation.allowHolder ? wo.ll(wo.ss.pactDict.HOLD_PERMIT) : wo.ll(wo.ss.pactDict.HOLD_FORBIDDEN)}}</text> -->
            </view>
            <text class="pact-switch-label" style="font-size:14px" v-if="!wo.ss.Creation.allowHolder">
              {{
              wo.ss.Creation.allowHolder ? wo.ll(wo.ss.pactDict.HOLD_PERMIT) :
              wo.ll(wo.ss.pactDict.HOLD_FORBIDDEN) }}
            </text>
            <template v-else>
              <input
                :disabled="!wo.ss.Creation.allowHolder"
                :focus="focusList[3]"
                :placeholder="wo.ll({ zhCN: '0: 无限库存', enUS: '0: Unlimited quota' })"
                :placeholder-style="wo.ss.placeholderStyle"
                :style="{ backgroundColor: wo.ss.Creation.allowHolder ? '#fff' : '#808080' }"
                @keydown.enter.native="wo.tt.next_focus(3, focusList)"
                onkeypress="return !['-','.'].includes(event.key)"
                type="number"
                v-model="wo.ss.Creation.quotaHolderPact"
              />
              <!-- <text style="flex:none;margin-left:5px;font-size:14px">{{ wo.ll({ zhCN: '名额', enUS: 'Quota' }) }}</text> -->
              <uni-icons custom-prefix="icont-basic" size="20" style="margin-left:5px; color:#808080" type="icont-basic-quota"></uni-icons>
              <input
                :disabled="!wo.ss.Creation.allowHolder"
                :focus="focusList[4]"
                :placeholder="'0: ' + wo.ll(wo.ss.pactDict.HOLD_FREE)"
                :placeholder-style="wo.ss.placeholderStyle"
                :style="{ backgroundColor: wo.ss.Creation.allowHolder ? '#fff' : '#808080' }"
                @keydown.enter.native="wo.tt.next_focus(4, focusList)"
                onkeypress="return '-' !== event.key"
                style="margin-left:15px;"
                type="digit"
                v-model="wo.ss.Creation.priceHolderPact"
              />
              <text style="font-size:22px;padding-left:6px;color:#808080">{{ wo.envar.tucSymbol }}</text>
              <!-- <uni-forms-item style="flex: none">
            <part-coin-picker :coinList="Object.values(wo.ss.i18n.cryptocoinSet)"
              :coinInit="Object.keys(wo.ss.i18n.cryptocoinSet).indexOf(wo.envar.chainCoin)" :coinFixed="true"
              @coinPicked="(coin) => wo.ss.Creation.coinHolderPact = coin"></part-coin-picker>
              </uni-forms-item>-->
            </template>
          </view>

          <!-- <uni-section type="" style="background:transparent;" :styleHeader="{ paddingBottom: '5px' }"
          titleDirection="column" :title="" :subTitle=""></uni-section>-->
          <view class="wo-flex start align-end" id="_所有权">
            <uni-icons color="unset" type="flag"></uni-icons>
            <text class="pact-title">{{ wo.ll(wo.ss.pactDict.OWNERSHIP) }}</text>
            <text class="pact-description">
              {{ wo.ll(wo.envar.uitOwner || {
              zhCN: '转让本作品完整产权给下一任主人，一次性变现。', //'您可以一次性出售完整产权给下一任主人。出售后，您仍然是原创作者，但不再是所有者，不再享有未来的大部分收益。',
              enUS: 'Sell this creation at a total price to the next owner.'
              }) }}
            </text>
          </view>
          <view class="wo-flex row align-center" style="padding:5px 0 10px">
            <view class="wo-flex column center align-center" style="margin-right:10px;height:40px">
              <switch :checked="wo.ss.Creation.allowOwner" @change="({ detail: { value } }) => { wo.ss.Creation.allowOwner = value }" class="pact-switch"></switch>
              <!-- <text class="pact-switch-label">{{ wo.ss.Creation.allowOwner?wo.ll(wo.ss.pactDict.OWN_PERMIT):wo.ll(wo.ss.pactDict.OWN_FORBIDDEN) }}</text> -->
            </view>
            <text class="pact-switch-label" style="font-size:14px" v-if="!wo.ss.Creation.allowOwner">
              {{
              wo.ss.Creation.allowOwner ? wo.ll(wo.ss.pactDict.OWN_PERMIT) : wo.ll(wo.ss.pactDict.OWN_FORBIDDEN)
              }}
            </text>
            <template v-else>
              <input
                :disabled="!wo.ss.Creation.allowOwner"
                :focus="focusList[5]"
                :placeholder="'0: ' + wo.ll(wo.ss.pactDict.OWN_FORBIDDEN)"
                :placeholder-style="wo.ss.placeholderStyle"
                :style="{ backgroundColor: wo.ss.Creation.allowOwner ? '#fff' : '#808080' }"
                @keydown.enter.native="wo.tt.next_focus(5, focusList)"
                onkeypress="return '-' !== event.key"
                type="digit"
                v-model="wo.ss.Creation.priceOwnerPact"
              />
              <!-- 0/空：禁止转让 -->
              <text style="font-size:22px;padding-left:6px;color:#808080">{{ wo.envar.tucSymbol }}</text>
              <!-- <uni-forms-item>
            <part-coin-picker :coinList="Object.values(wo.ss.i18n.cryptocoinSet)"
              :coinInit="Object.keys(wo.ss.i18n.cryptocoinSet).indexOf(wo.envar.chainCoin)" :coinFixed="true"
              @coinPicked="(coin) => wo.ss.Creation.coinOwnerPact = coin"></part-coin-picker>
              </uni-forms-item>-->
            </template>
          </view>

          <!-- </view> 为了配合 uni-card 对齐本体内容 -->
          <!-- </uni-card> -->
        </view>

        <button
          @click="validate_contract"
          class="wo-bg-color-main wo-text-color-white"
          style="margin:10px 10px; border-radius:30px; background: linear-gradient(90deg, var(--yellow-light), var(--red-default))"
          v-if="wo.envar.mintByChoice"
        >
          {{ wo.ll({ zhCN: '下一步', enUS: 'Next' }) }}
          <uni-icons color="unset" size="20" style="margin-left:5px" type="forward"></uni-icons>
        </button>

        <template v-else>
          <view class="wo-text-color-red-dark" style="min-height:20px; line-height:20px; text-align:center;font-size:13px;padding:0 10px;">
            <text>{{wo.ll(payToMintFeedback)}}</text>
          </view>
          <part-button-submit
            :disabled="minting"
            :loading="minting"
            @click="to_mint_by_agent"
            class="wo-bg-color-main wo-text-color-white"
            style="flex: auto; height: 60px; text-align: center; font-weight: bold; border-width: 0; border-radius: 0"
          >
            <uni-icons :type="wo.ss.User.onlineUser.usid ? 'fire-filled' : 'auth'" color="unset" size="20"></uni-icons>
            {{ wo.ss.User.onlineUser.usid ? wo.ll({ zhCN: '提交', enUS: 'Submit' }) : wo.ll({zhCN:'请先登录',enUS:'Signup or Login'})}}
          </part-button-submit>
        </template>
      </view>
    </uni-popup>

    <uni-popup :is-mask-click="true" :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="dialogEncrypt" style="z-index:999">
      <view
        :style="{ minWidth: wo.ss.minWidth600, maxWidth: wo.ss.maxWidth750 }"
        class="wo-flex column between"
        style="max-height:75vh;margin:0 auto;background-color:var(--grey-f)"
      >
        <view class="wo-flex column" style="padding:20px 20px">
          <text style="text-align:center; font-size:20px; font-weight:bold">{{ wo.ll({ zhCN: '加密', enUS: 'Mnemonic' })}}</text>
          <part-dev style="text-align:center; padding-top:5px; font-size:14px; color:#999">{{ wo.ll({zhCN:'选择加密方式',enUS:'Choose an encryption mode'})}}</part-dev>
        </view>
        <!-- <uni-segmented-control
          :current="Object.keys(authorizationList).indexOf(authTypeNow)"
          :values="Object.values(authorizationList).map(wo.ll)"
          @clickItem="({currentIndex}) => {
          authTypeNow = Object.keys(authorizationList)[currentIndex]
        }"
          activeColor="var(--blue-default)"
          padding="0 10px"
          style="margin: 10px 10px 0"
          styleType="button"
        ></uni-segmented-control>-->
        <view style="padding:10px">
          <text>{{ wo.ll(authorizationList[authTypeNow].intro) }}</text>
        </view>
        <view style="display: flex; flex-flow: column nowrap">
          <view v-show="authTypeNow === 'AGENT'">
            <part-button-submit
              :disabled="minting"
              :loading="minting"
              @click="to_mint_by_agent"
              class="wo-bg-color-main wo-text-color-white"
              style="flex: auto; height: 60px; text-align: center; font-weight: bold; border-width: 0; border-radius: 0"
            >{{ wo.ss.User.onlineUser.usid ? wo.ll({ zhCN:'铸造',enUS:'Mint'}) : wo.ll({zhCN:'请先登录',enUS:'Signup or Login'}) }}</part-button-submit>
          </view>
          <view class="wo-flex column" v-show="authTypeNow === 'SELF'">
            <view style="padding:10px">
              <uni-easyinput
                :auto-height="true"
                :border="true"
                :focus="true"
                :placeholder="wo.ll({ zhCN: '请输入您的密语，由12个汉字组成', enUS: 'Please enter your mnemonics consisting of 12 words' })"
                maxlength="140"
                style="background: white; margin: 10px 0"
                type="textarea"
                v-model="secword"
              ></uni-easyinput>
              <view
                @click="create_random_secword"
                style="float: right; cursor: pointer; display: flex; flex-flow: row nowrap; justify-content: flex-end; align-items: center; color: var(--blue-default)"
              >
                <!-- <u-icon name="/static/common-dice.svg" size="16px" style="margin: 0 4px"></u-icon> -->
                {{ wo.ll({ zhCN: '还没有密语？随机创建一个', enUS: 'Generate a mnemonic' }) }}
              </view>
            </view>
            <view class="wo-text-color-red-dark" style="margin-top:20px;min-height:20px; line-height:20px; text-align:center;font-size:13px;padding:0 10px;">
              <text>{{wo.ll(payToMintFeedback)}}</text>
            </view>
            <view>
              <part-button-submit
                :disabled="minting || !secword"
                :loading="minting"
                @click="to_mint_by_choice('BYCREATOR')"
                class="wo-bg-color-main wo-text-color-white"
                style="flex: auto; height: 60px; text-align: center; font-weight: bold; border-width: 0; border-radius: 0"
              >{{wo.ll({zhCN:'铸造',enUS:'Mint'})}}</part-button-submit>
            </view>
          </view>
          <view class="wo-flex column" v-show="authTypeNow === 'JOINT'">
            <view style="padding:10px">
              <uni-easyinput
                :auto-height="true"
                :border="true"
                :focus="true"
                :placeholder="wo.ll({ zhCN: '请输入您的密语，由12个汉字组成', enUS: 'Please enter your mnemonics consisting of 12 words' })"
                maxlength="140"
                style="background: white; margin: 10px 0"
                type="textarea"
                v-model="secword"
              ></uni-easyinput>
              <view
                @click="create_random_secword"
                style="float: right; cursor: pointer; display: flex; flex-flow: row nowrap; justify-content: flex-end; align-items: center; ; color: var(--blue-default)"
              >
                <!-- <u-icon name="/static/common-dice.svg" size="16px" style="margin: 0 4px"></u-icon> -->
                {{ wo.ll({ zhCN: '还没有密语？随机创建一个', enUS: 'Generate a mnemonic' }) }}
              </view>
            </view>
            <view class="wo-text-color-red-dark" style="margin-top:20px;min-height:20px; line-height:20px; text-align:center;font-size:13px;padding:0 10px;">
              <text>{{wo.ll(payToMintFeedback)}}</text>
            </view>
            <view>
              <part-button-submit
                :disabled="minting || !secword"
                :loading="minting"
                @click="to_mint_by_choice('BYJOINT')"
                class="wo-bg-color-main wo-text-color-white"
                style="flex: auto; height: 60px; text-align: center; font-weight: bold; border-width: 0; border-radius: 0"
              >{{ wo.ll({zhCN:'铸造',enUS:'Mint'}) }}</part-button-submit>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss">
uni-input {
  height: 30px;
  padding: 5px;
  border-radius: 4px;
  flex: auto;
}

.section-description {
  font-size: 13px;
  margin-left: 20px;
  color: #999;
}

.section-title {
  font-size: 14px;
  //  font-weight:bold;
}

.pact-description {
  font-size: 12px;
  padding-left: 10px;
  color: #999;
}

.pact-title {
  font-size: 13px;
  flex: none;
  padding-left: 2px;
}

.pact-switch-label {
  font-size: 11px;
  flex: none;
}

.pact-switch {
  transform: scale(1);
}
</style>
