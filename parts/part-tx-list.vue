<script>
export default {
  props: {
    txTag: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      bridgeOption: { loadMoreStatus: '' },
      takeLimit: 10,
      onceLoaded: false,
      myTxList: wo.ss.myTxDict[this.txTag]?.myTxList || [],
    }
  },
  computed: {
    txTypeDict () {
      return {
        PAY_TO_VIEW_TO_CREATOR: { zhCN: '我的作品被解密', enUS: 'My creation was decrypted' },
        PAY_TO_VIEW_TO_OWNER: { zhCN: '我的作品被解密', enUS: 'My creation was decrypted' },

        PAY_TO_HOLD_TO_CREATOR: { zhCN: '我的作品被购买', enUS: 'My creation was purchased' },
        PAY_TO_HOLD_TO_OWNER: { zhCN: '我的作品被购买', enUS: 'My creation was purchased' },

        PAY_TO_OWN_TO_CREATOR: { zhCN: '我的作品被买断主权', enUS: 'My creation was bought out' },
        PAY_TO_OWN_TO_OWNER: { zhCN: '我的作品被买断主权', enUS: 'My creation was bought out' },

        PAY_TO_VIEW: { zhCN: '我解密了作品', enUS: 'I decrypted a creation' },
        PAY_TO_HOLD: { zhCN: '我购买了作品', enUS: 'I bought a creation' },
        PAY_TO_OWN: { zhCN: '我买断了作品', enUS: 'I bought out a creation' },

        PAY_TO_MINT: { zhCN: '我铸造了作品', enUS: 'I minted a creation' },

        REWARD_REGIST: { zhCN: '注册奖励', enUS: 'Signup Rewards' },
        REWARD_INVITE: { zhCN: '邀请奖励', enUS: 'Invitation Rewards' },

        USER_RECHARGE: { zhCN: '能量充值', enUS: 'Energy Recharge' },

        AI_MODEL: { zhCN: 'AI 支出', enUS: 'AI Costs' },

        ...wo.envar.txTypeDict
      }
    }
  },
  async mounted () {
    await wo.tt.wait_autologin()
    if (!this.myTxList.length && !this.myTxList.onceLoaded) { // 首次打开本页面时
      await this.to_get_tx_list()
      this.myTxList.onceLoaded = true
    }
    this.onceLoaded = this.myTxList.onceLoaded
  },
  methods: {
    async to_get_tx_list () {
      if (!wo.ss.User.onlineUser.usid || this.bridgeOption.loadMoreStatus === 'loading') {
        return
      }
      this.bridgeOption.loadMoreStatus = 'loading'
      let { _state, count, txList } = await wo.tt.callBase({
        apiWho: 'User', apiTodo: 'get_tx_list',
        apiWhat: { skip: this.myTxList.length, take: this.takeLimit, txTag: this.txTag }
      })
      if (wo.bok(_state)) {
        if (txList?.length) {
          this.myTxList.push(...txList)
        }
        if (txList.length < this.takeLimit) {
          this.bridgeOption.loadMoreStatus = 'noMore'
          return
        }
      }
      this.bridgeOption.loadMoreStatus = 'more'
    }
  },
}
</script>

<template>
  <uni-card style="flex:none;margin:10px 0">
    <!-- <uni-list-item slot="title" style="cursor:unset" :customStyle="{padding:'15px 5px'}">
        <view slot="header" class="wo-flex align-center">
          <text>{{ wo.ll({zhCN:'我的收支明细',enUS:'My Income & Expenses'}) }}</text>
        </view>
    </uni-list-item>-->

    <uni-list>
      <uni-list-item :customStyle="{ padding: '15px 10px' }" :key="index" style="cursor:unset" v-for="(tx, index) in myTxList">
        <view class="wo-flex column text-ellipsis" slot="body" style="flex:auto;padding-right:10px">
          <view class="wo-flex between align-center" id="_标题行" style="font-size:14px">
            <text class="text-ellipsis" style="font-weight:bold; flex:none; margin-right:10px;">
              {{
              wo.ll(txTypeDict[tx.txType] || { zhCN: '未分类', enUS: 'Unclassified' }) }}
            </text>
            <text
              @click="wo.ss.Creation.creationNow = { pexdataCidHash: tx.pexdataCidHash, openTitle: tx.openTitle }; uni.navigateTo({ url: 'show-creation?pexdataCidHash=' + tx.pexdataCidHash })"
              class="text-ellipsis wo-text-color-blue-default"
              style="cursor:pointer;font-weight:bold;font-style:italic;padding:0 5px;"
              v-if="tx.pexdataCidHash"
            >{{ tx.openTitle || (wo.ll({ zhCN: '无题 #', enUS: 'Untitled #' }) + tx.pexdataCidHash.slice(-6)) }}</text>
            <text class="text-ellipsis" v-else-if="tx.dpAmount">{{ wo.tt.number_precision(tx.dpAmount / 100, 2) }} {{ tx.dpCoinCode }}</text>
          </view>

          <view class="wo-flex between align-center" id="_日期行" style="margin-top:5px;font-size:13px">
            <text style="flex:none; margin-right:10px;">{{ wo.tt.formatDate(tx.txTimeUnix, 'yyyy-mm-dd HH:MM') }}</text>
            <view
              @click="wo.ss.User.hostUser = { usid: tx.usid }; uni.navigateTo({ url: 'show-creator?hostUsid=' + tx.usid })"
              class="wo-flex row end align-center text-ellipsis wo-bg-color-grey-f"
              id="_关联用户"
              style="flex:0 1 auto;cursor:pointer;border-radius:20px;padding-left:10px"
              v-if="tx.nickname"
            >
              <text class="text-ellipsis wo-text-color-blue-default" style="flex:auto;margin-right:5px;text-align:right">{{ tx.nickname }}</text>
              <view
                :style="{ backgroundImage: wo.tt.make_bgurl(tx.portrait) }"
                class="wo-flex center align-center"
                style="flex:none; width:24px; text-align:center; height:24px; margin:1px; background:white no-repeat center / cover; border-radius:100%;box-shadow:0 0 5px 0 rgba(0,0,0,0.3);"
              >
                <uni-icons color="lightgrey" type="person" v-if="!tx.portrait"></uni-icons>
              </view>
            </view>
            <text class="text-ellipsis" id="_支付渠道" v-else-if="tx.dpChannel">
              {{ wo.ll(
              /IAP/.test(tx.dpChannel) ? { zhCN: '苹果应用内购', enUS: 'Apple IAP' }
              : /WXPAY/.test(tx.dpChannel) ? { zhCN: '微信支付', enUS: 'Wechat' }
              : /ALIPAY/.test(tx.dpChannel) ? { zhCN: '支付宝', enUS: 'AliPay' }
              : /ETH_MAINNET/.test(tx.dpChannel) ? { zhCN: '以太坊', enUS: 'Ethereum' }
              : /MATIC_MAINNET/.test(tx.dpChannel) ? { zhCN: '马蹄链', enUS: 'Polygon' }
              : ''
              ) }}
            </text>
          </view>
        </view>

        <view class="wo-flex end align-center" slot="footer" style="flex:none; min-width:40px;text-align: right;">
          <text
            :class="{ 'wo-text-color-main': tx.fromUsid !== wo.ss.User.onlineUser.usid, 'wo-text-color-yellow-default': tx.fromUsid === wo.ss.User.onlineUser.usid }"
            style="flex:none;font-size:22px;font-weight:bold"
          >
            {{ tx.fromUsid === wo.ss.User.onlineUser.usid ? '-' : '+' }}{{ wo.tt.number_precision(tx.sumAmount ||
            tx.txAmount) }}{{ wo.envar.tucSymbol }}
          </text>
        </view>
      </uni-list-item>
    </uni-list>

    <part-empty-list
      :aboveAction="to_get_tx_list"
      :prompt="wo.ll({ zhCN: '暂时没有收支条目', enUS: 'Transaction history is empty' })"
      aboveIcon="refresh"
      v-if="!myTxList.length && onceLoaded"
    ></part-empty-list>

    <part-load-more :bridgeOption="bridgeOption" :loadMoreAction="to_get_tx_list" v-else></part-load-more>
  </uni-card>
</template>

<style scoped lang="scss"></style>
