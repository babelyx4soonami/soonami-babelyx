<script>
// import ticc from 'tic-crypto'

export default {
  props: {

  },
  data () {
    return {
      payToMintFeedback: '',
      minting: false,

      authTypeNow: 'AGENT',

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
  },

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

    async validate_creation () {
      wo.ss.Creation.pexdataRaw = wo.tt.filter_story(wo.ss.Creation.pexdataRaw)
      if (!wo.ss.Creation.pexdataRaw?.length) {      // 过滤掉空的段落
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

    async to_pay_to_mint () {
      if (!wo.tt.check_online()) {
        return
      }
      if (!this.minting && this.authTypeNow === 'AGENT') {
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
            title: { zhCN: '您的作品疑似违反中国审查政策无法发表', enUS: 'Your creation was rejected by China moderation policy' },
            content: rejectReason,
            confirmText: { zhCN: '知道了', enUS: 'Got it' },
            showCancel: false,
          })
        } else if (_state === 'ERROR_DUPLICATE_CREATION') {
          this.payToMintFeedback = { zhCN: '该作品已经存在，无法重复提交。', enUS: 'Conflict with an existing creation.' }
        } else {
          this.payToMintFeedback = wo.envar.sysdown
        }
      } else {
        wo.tt.showToast({
          type: wo.color.RED,
          title: wo.envar.sysdown, duration: 5000
        })
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
          :allowVideo="wo.envar.allowVideoInCreation"
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

      <button
        :style="{opacity:storyEmpty?0.2:1}"
        @click="validate_creation"
        class="wo-bg-color-main wo-text-color-white"
        style="margin:30px 0; border-radius:30px; background: linear-gradient(90deg, var(--yellow-light), var(--red-default))"
      >{{ wo.ll({ zhCN: '下一步', enUS: 'Next' }) }}</button>
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
          <text style="text-align:center; padding:0; font-size:20px; font-weight:bold">{{ wo.ll({zhCN:'设置合约',enUS:'Set Contract'})}}</text>
          <text
            style="text-align:center; padding-top:5px; font-size:14px;; color:#999"
          >{{ wo.ll({zhCN:'保护您的永久权益',enUS:'to protect your rights and benefits forever'})}}</text>
        </view>

        <view style="padding:20px;">
          <view class="wo-flex start align-end" id="_阅览权">
            <uni-icons color="unset" type="eye"></uni-icons>
            <text class="pact-title">{{ wo.ll(wo.ss.pactDict.VIEWERSHIP) }}</text>
            <text class="pact-description">
              {{ wo.ll(wo.envar.uitViewer || {
              zhCN: '其他用户向您付费后，才能阅览本作品内容。',
              enUS: 'Others must pay a decryption fee to view this creation.'
              }) }}
            </text>
          </view>
          <view class="wo-flex row align-center" style="padding-top:5px; margin-bottom:30px;">
            <view class="wo-flex column center align-center" style="margin-right:10px;height:40px">
              <switch :checked="wo.ss.Creation.allowViewer" @change="({ detail: { value } }) => { wo.ss.Creation.allowViewer = value }" class="pact-switch"></switch>
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
            </template>
          </view>

          <view class="wo-flex start align-end" id="_持有权">
            <uni-icons color="unset" type="cart"></uni-icons>
            <text class="pact-title">{{ wo.ll(wo.ss.pactDict.HOLDERSHIP) }}</text>
            <text class="pact-description">
              {{ wo.ll(wo.envar.uitHolder || {
              zhCN: '出售本作品的拷贝、席位、份额给其他用户。',
              enUS: 'Sell this creation\'s copies, shares, seats, etc. to buyers.'
              }) }}
            </text>
          </view>
          <view class="wo-flex row align-center" style="padding-top:5px;margin-bottom:30px">
            <view class="wo-flex column center align-center" style="margin-right:10px;height:40px">
              <switch :checked="wo.ss.Creation.allowHolder" @change="({ detail: { value } }) => { wo.ss.Creation.allowHolder = value }" class="pact-switch"></switch>
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
            </template>
          </view>

          <view class="wo-flex start align-end" id="_所有权">
            <uni-icons color="unset" type="flag"></uni-icons>
            <text class="pact-title">{{ wo.ll(wo.ss.pactDict.OWNERSHIP) }}</text>
            <text class="pact-description">
              {{ wo.ll(wo.envar.uitOwner || {
              zhCN: '转让本作品完整产权给下一任主人，一次性变现。',
              enUS: 'Sell this creation at a total price to the next owner.'
              }) }}
            </text>
          </view>
          <view class="wo-flex row align-center" style="padding:5px 0 10px">
            <view class="wo-flex column center align-center" style="margin-right:10px;height:40px">
              <switch :checked="wo.ss.Creation.allowOwner" @change="({ detail: { value } }) => { wo.ss.Creation.allowOwner = value }" class="pact-switch"></switch>
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
              <text style="font-size:22px;padding-left:6px;color:#808080">{{ wo.envar.tucSymbol }}</text>
            </template>
          </view>
        </view>

        <view class="wo-text-color-red-dark" style="min-height:20px; line-height:20px; text-align:center;font-size:13px;padding:0 10px;">
          <text>{{wo.ll(payToMintFeedback)}}</text>
        </view>

        <button
          :loading="minting"
          @click="to_pay_to_mint"
          class="wo-bg-color-main wo-text-color-white"
          style="flex: auto; height: 60px; text-align: center; font-weight: bold; border-width: 0; border-radius: 0"
        >
          <uni-icons color="unset" size="20" type="fire-filled"></uni-icons>
          {{ wo.ll({ zhCN: '提交', enUS: 'Submit' }) }}
        </button>
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
