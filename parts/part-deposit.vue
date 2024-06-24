<script>
const my = {
  make_order_no () {
    // 20-28 位，但不能24位在阿里云空间可能会有问题 >https://uniapp.dcloud.net.cn/uniCloud/uni-pay.html#create-order
    return `${wo.ss.User.onlineUser._haid}_${Date.now()}`
  },
  make_out_trade_no (order_no) {
    return order_no + Math.floor(Math.random() * 36).toString(36)
  },
  // #ifdef APP
  iapChannel: undefined,
  IapTransactionState: {
    purchasing: "0", // A transaction that is being processed by the App Store.
    purchased: "1", // A successfully processed transaction.
    failed: "2", // A failed transaction.
    restored: "3", // A transaction that restores content previously purchased by the user.
    deferred: "4" // A transaction that is in the queue, but its final status is pending external action such as Ask to Buy.
  },
  to_getProduct (productIds) {
    return new Promise((resolve, reject) => {
      my.iapChannel.requestProduct(productIds, (res) => {
        resolve(res)
      }, (err) => {
        reject(err)
      })
    })
  },
  to_requestPayment (orderInfo) {
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        provider: 'appleiap',
        orderInfo: orderInfo,
        success: (transaction) => {
          resolve(transaction)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  to_restoreCompletedTransactions (username) {
    return new Promise((resolve, reject) => {
      my.iapChannel.restoreCompletedTransactions({
        manualFinishTransaction: true,
        username
      }, (res) => {
        resolve(res)
      }, (err) => {
        reject(err)
      })
    })
  },
  to_finishTransaction (transaction) {
    return new Promise((resolve, reject) => {
      my.iapChannel.finishTransaction(transaction, (res) => {
        resolve(res)
      }, (err) => {
        reject(err)
      })
    })
  }
  // #endif
}
export default {
  props: {
    usdtChainSet: { type: Object, default: () => ({ ETH: { name: { zhCN: 'Ethereum', enUS: 'Ethereum' } }, POL: { name: { zhCN: 'Polygon', enUS: 'Polygon' } } }) },
    cnyChannelSet: { type: Object, default: () => ({ wxpay: { name: { zhCN: '微信支付', enUS: 'WxPay' } }, alipay: { name: { zhCN: '支付宝', enUS: 'Alipay' } } }) },
    depositTitle: { type: [String, Object], default: '' },
    depositAmountInitial: { type: [Number, String], default: 10 },
    depositAmountMin: { type: [Number, String], default: 1 },
    depositAmountMax: { type: [Number, String], default: 10000000 },
    depositOnly: { type: Boolean, default: false },
    depositFeedback: { type: [String, Object], default: '' }, // 充值外部货币后检查是否到账
    payTitle: { type: [String, Object], default: '' },
    payAmount: { type: Number, default: 100 }, // 为了在支付价为0，或者 depositOnly 时，不调用支付后台，利用 payAmount>0 来做判断，因此不要默认为0
    payFeedback: { type: [String, Object], default: '' }, // 支付TUC后的反馈结果
    submitText: { type: [String, Object], default: '' },
    submitAction: { type: Function, default: () => { } },
    submitIcon: { type: String, default: '' },
    isPaying: { type: Boolean, default: false },
  },
  data () {
    return {
      refreshing: false,

      depositAmountMinLocal: ['10eea744-f248-4301-8156-418590204220', '02217dcc-54d0-45f5-bee2-27d19df37ab1', '64858ed5-0dc1-4775-b68b-8be836fea4a7'].includes(wo.ss.User.onlineUser.usid) ? 0.01 : this.depositAmountMin,
      depositAmount: this.depositAmountInitial, // Math.floor((this.depositAmountInitial > 0.01 ? this.depositAmountInitial : 0.01) * 100) / 100 || 0.01,

      usdtChainNow: 'ETH',
      cnyChannelNow: 'wxpay',

      iapSuccess: false,
      iapPaying: false,

      myPayFeedback: this.payFeedback,
      myDepositFeedback: this.depositFeedback,

      unipayco: wo.envar.inAppIos ? undefined : uniCloud.importObject('uni-pay-co'),
      cnyPayUrl: '',
      payServerUrl: wo.envar.payServerUrl
    }
  },
  computed: {
    isValidAmount () {
      return (
        Number(this.depositAmount) && Number(this.depositAmountMinLocal) <= Number(this.depositAmount) && Number(this.depositAmount) <= Number(this.depositAmountMax)
      )
    },
    tucToRecharge () {
      return wo.tt.number_precision(parseFloat(this.depositAmount) *
        wo.envar.coinToTUC[wo.ss.i18n.depositCoinNow.coinCode])
    },
    usdtPayTitle () {
      return wo.ll(wo.envar.callnames) + wo.ll({ zhCN: ' - 转账 ', enUS: ' - Transfer ' }) + this.depositAmount + ' ' + wo.ss.i18n.depositCoinNow.coinCode
        + wo.ll({ zhCN: ' 到 ', enUS: ' To ' }) + wo.ll(this.usdtChainSet[this.usdtChainNow].name) + ' ' + wo.ss.User.onlineUser.caddETH
    },
    usdtPayUrl () {
      return `${wo.envar.tucGateway}/address/${wo.ss.User.onlineUser.caddETH}`
    },
    cnyPayTitle () {
      return wo.ll(wo.envar.callnames) + ' - ' + wo.ll(this.cnyChannelSet[this.cnyChannelNow].name) + wo.ll({ zhCN: '充值 ', enUS: ' Recharge ' }) + this.depositAmount + ' ' + wo.ll(wo.ss.i18n.depositCoinNow.coinIname)
    }
  },
  watch: {
    payFeedback (vnew, vold) {
      const self = this
      self.myPayFeedback = vnew
      if (vnew) {
        setTimeout(() => {
          self.myPayFeedback = ''
        }, 10000)
      }
    },
    depositFeedback (vnew, vold) {
      const self = this
      self.myDepositFeedback = vnew
      if (vnew) {
        setTimeout(() => {
          self.myDepositFeedback = ''
        }, 10000)
      }
    },
    depositAmount: {
      immediate: true,
      handler (vnew, vold) {
        this.update_cnyPayUrl()
      }
    },
    cnyChannelNow (vnew, vold) {
      this.update_cnyPayUrl()
    },
  },
  async mounted () {
    let self = this
    wo.unisocket.initListener('RECHARGE_SUCCESS', ({ sumInRecharges, balanceTUC }) => {
      if (balanceTUC > wo.ss.User.onlineUser.balanceTUC) wo.ss.User.onlineUser.balanceTUC = balanceTUC
      if (sumInRecharges > wo.ss.User.onlineUser.sumInRecharges) wo.ss.User.onlineUser.sumInRecharges = sumInRecharges
      self.confirm_recharge_done()
    })

    // #ifdef APP
    if (Number(this.payAmount) > 0 && wo.envar.inAppIos && !wo.envar.aiapUnipay2) {
      wo.tt.showLoading({ title: wo.ll({ zhCN: '准备充值...', enUS: 'Prepare for recharging...' }), mask: true })
      try {
        my.iapChannel = (await uni.getProvider({ service: 'payment' }))?.[1]?.providers?.find?.(provider => (provider.id === 'appleiap'))
        if (my.iapChannel) {
          await my.to_getProduct(Object.keys(wo.envar.aiapSet))
        }
      } catch (e) {
        wo.tt.showModal({
          title: { zhCN: '找不到有效的支付渠道', enUS: 'Invalid Enviroment' },
          content: wo.envar.sysdown,
          showCancel: false
        })
      }
      wo.tt.hideLoading()
    }
    // #endif
  },
  methods: {
    confirm_recharge_done () {
      this.myDepositFeedback = ''
      let self = this
      wo.tt.showModal({
        title: { zhCN: '您的充值已入账！', enUS: 'Your recharge is recorded!' },
        content: this.tucToRecharge + wo.envar.tucSymbol,
        showCancel: false,
        success: () => {
          self.$emit('closeMe')
        }
      })
    },
    update_cnyPayUrl () {
      if (!Number(this.payAmount)) { // 在 midButton 页面，启动铸造时，虽然 totalPriceToMint===0，也会调用到这里，导致弹窗提示“加载中”
        return
      }
      if (wo.ss.i18n.depositCoinNow.coinCode !== 'CNY') {
        return
      }
      if (!this.isValidAmount) {
        // this.cnyPayUrl = '' // 对无效金额，就不要修改之前的链接，或者设为 '' 就会让 qrcode 显示为等待雪花
        return
      }
      let qso = {
        provider: this.cnyChannelNow,
        app: wo.envar.idname + '_', // 徐磊的 docker 支付要求传入4个字母的 app 标识符。
        appkey: wo.envar.clientInfo.appkey, // 给我自己开发的 payportal by unipay2
        m: parseInt(this.depositAmount * 100),
        orderCode: my.make_order_no(),
        title: wo.ll(wo.envar.callnames) + this.tucToRecharge + wo.envar.tucSymbol,
        note: `(haid_${wo.ss.User.onlineUser._haid})`, // `usid_${wo.ss.User.onlineUser.usid}`,
      }
      // 在本页面里直接实现了二维码，不需要让支付后台来处理二维码了 wo.envar.clientInfo.browser==='wechat' || (queryStringObj.type = 'qr')
      this.payServerUrl = wo.envar.payServerUrl + `provider=${qso.provider}&app=${qso.app}&appkey=${qso.appkey}&m=${qso.m}&tradecode=${qso.orderCode}&title=${qso.title}&note=${qso.note}` // new wo.tt.URLSearchParams(qso).toString() // 发现在 华为荣耀7手机上，不存在 URLSearchParams // 把 note 放到最后，因为可能把文字描述放在 url 后一起拷贝，导致放在最后的 tradecode=5eaaa5_1706528299855%20Babely%20-%20Alipay%20Recharge%201000000%20Chinese%20Yuan，导致在 payportal 里产生的out_trade_no超出32字符限额。
      if ('CN' === wo.ss.i18n.userlandCode && this.unipayco?.createOrder) { // 从海外连接 unicloud 上的 unipay2 会弹出错误窗口"request:fail"，所以加个判断，在海外则直接使用 payServerUrl。20240312: 刚刚发现我并没有在 pex-user-uniapp 项目的 uni-config-center/uni-pay/config.js 里开通 alipay { enable: true } 也没有设置密钥文件，但是居然下面这一句 createOrder 也能一直能用！是否 qr_code:true 的就不需要？也可能是因为在 base-pay-unipay 项目里已经上传了新版？
        this.unipayco.createOrder({
          provider: this.cnyChannelNow, // 支付供应商
          total_fee: qso.m, // 支付金额，单位分 100 = 1元
          order_no: qso.orderCode, // 业务系统订单号（即你自己业务系统的订单表的订单号）
          out_trade_no: my.make_out_trade_no(qso.orderCode), // 插件支付单号。添加一位0-9a-z的随机数
          description: `${qso.title}${qso.note}`.replace(/\s/g, ''), // 支付描述。不能为空。wxpay可以空格；alipay连空格也不可以。
          type: 'pex-recharge', // 支付回调类型
          qr_code: true, // 是否强制使用扫码支付
          cancel_popup: true, // 配合qr_code:true使用，是否只生成支付二维码，没有二维码弹窗
          custom: {
            appkey: wo.envar.clientInfo.appkey,
            usid: wo.ss.User.onlineUser.usid,
          }, // 自定义数据
        }).then(({ errCode, errMsg, order: { codeUrl } = {}, order_no, out_trade_no, provider, provider_pay_type, qr_code_image }) => {
          this.cnyPayUrl = codeUrl || this.payServerUrl
        }).catch(() => {
          this.cnyPayUrl = this.payServerUrl
        })
      } else {
        this.cnyPayUrl = this.payServerUrl
      }
    },
    async to_refresh_balance () {
      if (!wo.tt.check_online()) {
        return
      }
      if (!this.refreshing) {
        this.refreshing = true
        let { _state, sumInRecharges, balanceTUC } = await wo.tt.callBase({
          apiWho: 'User',
          apiTodo: 'get_current_balance',
          apiWhat: {
            coin: wo.envar.chainCoin,
          },
        }) || {}
        this.refreshing = false
        if (wo.bok(_state)) {
          if (balanceTUC > wo.ss.User.onlineUser.balanceTUC) {
            wo.ss.User.onlineUser.balanceTUC = balanceTUC
            if (sumInRecharges > wo.ss.User.onlineUser.sumInRecharges) wo.ss.User.onlineUser.sumInRecharges = sumInRecharges
            this.confirm_recharge_done()
          } else {
            this.myDepositFeedback = { zhCN: '您的充值尚未到账，请稍候再试。\n如超过一分钟仍未到账，请联系客服。', enUS: 'Your recharge is still on way, please try again later.\nIf it has not been credited after one minute, please contact customer service.' }
          }
        } else {
          this.myDepositFeedback = wo.envar.sysdown
        }
      }
    },

    to_change_depositcoin (coin) {
      if (wo.ss.i18n.depositCoinNow.coinCode !== coin.coinCode) {
        wo.ss.i18n.depositCoinNow = coin
        if (coin.coinCode === 'CNY') { // 切换到cny时，由于之前的金额变化被watch筛除掉了，因此这时的 cnyPayUrl 要么是空要么是基于上一次成功获取的老的金额，需要更新
          this.update_cnyPayUrl()
        }
      }
      this.$refs.poptoPickDepositCoin.close()
    },

    // #ifdef APP

    to_deposit_appleiap (product) {
      if (!wo.tt.check_online()) {
        return
      }
      if (wo.envar.aiapUnipay2 && this.$refs.unipay2) {
        this.to_deposit_appleiap_unipay2(product)
      } else {
        this.to_deposit_appleiap_request(product)
      }
    },

    async to_deposit_appleiap_unipay2 (product) {
      // 使用 unipay2 比较简便，但是不知为何，在手机上，会出现两次正在支付的提示，耗时长，并且只有中文。
      const order_no = my.make_order_no()
      const out_trade_no = my.make_out_trade_no(order_no)
      await this.$refs.unipay2.createOrder({
        provider: "appleiap",
        order_no: order_no,
        out_trade_no: out_trade_no, // 插件支付单号
        type: 'pex-appleiap', // 支付回调
        productid: product.iapid, // ios内购产品id（仅ios内购生效）
        custom: {
          appkey: wo.envar.clientInfo.appkey,
          usid: wo.ss.User.onlineUser.usid,
          // txAmount: product.credit // 客户端发来的信息有被伪造风险，不能用于传递重要信息给后台，换用 unipay 后台发送的 original_data.receipt.in_app[0].product_id
        }, // 自定义数据
      }).catch((e) => {
        this.myDepositFeedback = wo.envar.sysdown
        // console.log('exception  =' + JSON.stringify(e))
      })
    },

    async to_deposit_appleiap_request (product) {
      if (this.iapPaying == true) {
        return
      }
      this.iapPaying = true

      let waiting = wo.tt.showLoading({ title: wo.ll({ zhCN: '检查历史交易...', enUS: 'Checking transactions' }), mask: true })
      try {
        // 从苹果服务器检查未关闭的订单，可选根据 username 过滤，和调用支付时透传的值一致
        const transactions = await my.to_restoreCompletedTransactions({
          username: wo.ss.User.onlineUser.usid
        })

        // 开发者业务逻辑，从服务器获取当前用户未完成的订单列表，和本地的比较。目前省略。
        for (let transaction of transactions) {
          switch (transaction.transactionState) {
            case my.IapTransactionState.purchased:
              // 用户已付款，在此处请求开发者服务器，在服务器端请求苹果服务器验证票据。目前省略。
              await my.to_finishTransaction(transaction)
              break
            case my.IapTransactionState.failed: // 未支付的订单
              await my.to_finishTransaction(transaction)
              break
            default:
              break
          }
        }
      } catch (e) {
        this.myDepositFeedback = { zhCN: '检查历史交易失败', enUS: 'Failed checking transactions' }
      }

      waiting.setTitle(wo.ll({ zhCN: '支付中...', enUS: 'Paying...' }))
      try {
        const transaction = await my.to_requestPayment({
          productid: product.iapid,
          manualFinishTransaction: true,
          username: wo.ss.User.onlineUser.usid, // username + orderId //根据业务需求透传参数，关联用户和订单关系
        })
        // 在此处请求开发者服务器，在服务器端请求苹果服务器验证票据
        //https://developer.apple.com/cn/documentation/storekit/in-app_purchase/validating_receipts_with_the_app_store/
        // 虽然不明白为什么，但测试发现必须把后台的处理也放在 try {} 里，否则 my.to_requestPayment 会立刻返回，导致在支付完成前就调用后台处理。
        waiting.setTitle(wo.ll({ zhCN: '充值中...', enUS: 'Recharging...' }))
        const order_no = my.make_order_no()
        const out_trade_no = my.make_out_trade_no(order_no)
        let { _state, balanceTUC, sumInRecharges } = await wo.tt.callBase({
          apiWho: 'System',
          apiTodo: 'deposit_callback',
          apiWhat: { // 模拟和 unipay2 的 payorder 一样的数据结构
            provider: 'appleiap',
            order_no: order_no,
            out_trade_no: out_trade_no,
            total_fee: product.price * 100,
            status: transaction.transactionState,
            original_data: { receipt: { in_app: [{ product_id: product.iapid }] } },
            ...transaction // 据观察，后台收到的 transaction = { payment: {productid, quantity, username}, transactionDate, transactionIdentifier, transactionReceipt, transactionState: '1', errMsg: 'requestPayment:ok' }
          },
        })
        // 验证成功后关闭订单
        // 注意到，有时候，balance被websocket刷新后，仍然有支付窗口，无法通过刷新余额来关闭了。因此在这里就关闭。
        if (wo.bok(_state)) {
          await my.to_finishTransaction(transaction)
          if (balanceTUC > wo.ss.User.onlineUser.balanceTUC) wo.ss.User.onlineUser.balanceTUC = balanceTUC
          if (sumInRecharges > wo.ss.User.onlineUser.sumInRecharges) wo.ss.User.onlineUser.sumInRecharges = sumInRecharges
          this.confirm_recharge_done()
        } else {
          this.iapSuccess = true
        }
      } catch (e) {
        /** 如果用户自己取消了苹果弹出的支付窗口，也会导致走到这里。不需要打扰用户自己做出的取消决定
        uni.showModal({
          title: wo.ll({zhCN:'支付没有完成',enUS:'Payment unfinished'}),
          content: wo.envar.modalPrefix + e.errMsg,
          showCancel: false
        }) **/
      } finally {
        this.iapPaying = false
        wo.tt.hideLoading()
      }
    },
    // #endif

  },
}
</script>

<template>
  <view :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth600 }" class="wo-flex column">
    <part-close-button @closeMe="()=>{ $emit('closeMe') }" style="z-index:999">
      <!-- <part-dev>不知为何，必须要加 z-index，否则在我的资金充值页面，AI对话充值页面，无法点击。而在创作、铸造页面可以点击。</part-dev> -->
    </part-close-button>

    <view :class="{ 'wo-bg-color-white': payAmount > wo.ss.User.onlineUser.balanceTUC }" class="wo-flex column" id="_标价栏" v-if="!depositOnly">
      <text style="text-align:center; padding:20px 10px 0px; font-size:20px; font-weight:bold">
        {{ wo.ll(payTitle)
        }}
      </text>
      <text
        class="wo-text-color-yellow-dark"
        style="word-break:break-all; font-weight: bold;font-size:2em;align-self: center;padding:20px 10px"
      >{{ payAmount || 0 }}{{ wo.envar.tucSymbol }}</text>
    </view>

    <template v-if="!depositOnly && payAmount <= wo.ss.User.onlineUser.balanceTUC">
      <slot></slot>
      <view class="wo-text-color-red-dark" style="line-height: 20px; text-align: center;font-size:13px;padding:0 10px;">
        <text>{{ wo.ll(myPayFeedback) }}</text>
      </view>
      <view class="wo-flex" id="_支付区" style="width: 100%; ">
        <!-- <part-dev>luk: 如果需要两个按钮，直接添加在里面</part-dev> -->
        <!-- <button class="wo-bg-color-grey-c wo-border-color-grey-e wo-text-color-white" style="flex:auto;height:60px;line-height:60px;text-align:center;font-weight: bold; border-width:0;border-radius:0;" @click="()=>{$emit('closeMe')}">取消</button> -->
        <button
          :loading="isPaying"
          @click="submitAction"
          class="wo-bg-color-main wo-text-color-white"
          style="flex: auto; height: 60px; text-align: center; font-weight: bold; border-width: 0; border-radius: 0"
        >
          <uni-icons :type="submitIcon" color="unset" size="20" v-if="submitIcon"></uni-icons>
          {{ wo.ll(submitText || { zhCN: '支付', enUS: 'Pay' }) }}
        </button>
      </view>
    </template>

    <view class="wo-bg-color-grey-e" id="_充值区" style="padding:20px 0px;position:relative;" v-else>
      <view style="font-size:20px;font-weight:bold;text-align: center;">
        <text>
          {{ wo.ll(depositTitle || {
          zhCN: '充值', enUS: 'Recharge'
          }) }}
        </text>
      </view>
      <view style="font-size:small; display:flex;justify-content: center;align-items:center; padding: 5px 40rpx 40rpx">
        <view style="margin-right:10px;flex:none">{{ wo.ll({ zhCN: '当前余额', enUS: 'Current Balance' }) }}</view>
        <view style="word-break:break-all">
          {{ wo.tt.number_precision(wo.ss.User.onlineUser.balanceTUC) }} {{
          wo.envar.tucSymbol }}
        </view>
      </view>

      <view class="wo-flex column center" id="_苹果内购支付" v-if="wo.envar.inAppIos">
        <!-- #ifdef APP -->
        <uni-pay
          :logo="wo.pagesJson.appLogo"
          @mounted="() => { $refs.unipay2.appleiapRestore() }"
          @success="(order) => {
            if (order.user_order_success) {
              wo.ss.User.onlineUser.balanceTUC += wo.envar.aiapSet[order.original_data.receipt.in_app[0].product_id].credit; confirm_recharge_done()
            } else { iapSuccess = true }
          }"
          ref="unipay2"
          return-url
          v-if="wo.envar.aiapUnipay2"
        ></uni-pay>
        <!-- #endif -->
        <text style="word-break: break-all; width: 100%; padding:10px;">
          {{ wo.ll(iapSuccess
          ? { zhCN: '刷新能量余额：', enUS: 'Refresh balance:' }
          : { zhCN: '选择充值额度：', enUS: 'Choose a recharge level:' }) }}
        </text>
        <uni-list id="_苹果内购产品列表" style="flex:auto;margin:20px 10px 30px;background-color:white;" v-if="!iapSuccess">
          <uni-list-item
            :customStyle="{ padding: '15px' }"
            :key="index"
            :note="wo.ll(product.info)"
            :rightText="`${product.price} ${product.priceCoin}`"
            :title="product.credit + wo.envar.tucSymbol"
            @click="to_deposit_appleiap(product)"
            clickable
            showArrow
            v-for="(product, key, index) in wo.envar.aiapSet"
          ></uni-list-item>
        </uni-list>
        <view class="wo-flex column center align-center" style="margin:20px auto" v-else>
          <button
            :disabled="refreshing"
            :loading="refreshing"
            @click="to_refresh_balance"
            style="background:#ff9900;color:white;border-radius:30px;margin:0;height:46px"
          >
            <uni-icons color="unset" size="28" type="refresh" v-show="!refreshing" />
            {{ wo.ll({
            zhCN: '刷新余额', enUS: 'Check Balance'
            }) }}
          </button>
          <view class="wo-text-color-red-dark" style="text-align: center;font-size:13px;padding:0 10px;">
            <text>{{ wo.ll(myDepositFeedback) }}</text>
          </view>
        </view>
      </view>

      <view :border="false" id="_其他支付" style="margin:0 10px" v-else>
        <view class="wo-flex between align-center" id="_选择金额" style="padding:15px 0">
          <view class="wo-flex row align-center wo-bg-color-white" style="height:40px;font-weight:bold;">
            <uni-number-box
              :actionStyle="{ background: 'white', color: '#2b85e4' }"
              :inputStyle="{ color: '#2b85e4', background: 'white', fontSize: 'large', width: '100px', margin: '0' }"
              :max="depositAmountMax"
              :min="depositAmountMinLocal"
              :step="depositAmountMinLocal"
              :value="depositAmount"
              @change="(v) => {
                if (Number(v) >= Number(depositAmountMinLocal) && Number(v) <= Number(depositAmountMax)) { depositAmount = Number(v) } else { depositAmount = Number(depositAmountInitial) }
              }"
              style="height:100%;box-sizing:border-box;border:1px solid var(--grey-e)"
            ></uni-number-box>
            <button
              @click="$refs.poptoPickDepositCoin.open()"
              plain
              style="color: #2b85e4; height:100%; box-sizing:border-box; background:white; border-width: 1px; border-color: var(--grey-e); border-radius:0; padding: 0 5px 0 10px;"
            >
              {{ wo.ss.i18n.depositCoinNow.coinCode }}
              <uni-icons color="unset" style="margin-left: 10px" type="bottom"></uni-icons>
            </button>
            <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" ref="poptoPickDepositCoin">
              <part-coin-table :coinInit="wo.ss.i18n.depositCoinNow" :coinSet="wo.ss.i18n.depositCoinSet" :pick_coin="to_change_depositcoin"></part-coin-table>
            </uni-popup>
          </view>
          <view style="margin-left:10px;font-size:18px;word-break:break-all;text-align: right;">{{ `= ${tucToRecharge}` + wo.envar.tucSymbol }}</view>
        </view>

        <view class="wo-flex column align-end" id="_进行支付" style="padding:15px 0;border-top:1px solid lightgrey; border-bottom:1px solid lightgrey">
          <template v-if="wo.ss.i18n.depositCoinNow.coinCode === 'CNY'">
            <view class="wo-flex row between" id="_人民币渠道" style="width:100%">
              <view class="wo-flex column start" id="_左侧选择支付渠道">
                <!-- <picker
                  :class="{ 'wo-bg-color-white': Object.keys(cnyChannelSet).length > 1 }"
                  :disabled="Object.keys(cnyChannelSet).length <= 1"
                  :range="Object.values(cnyChannelSet).map((item) => wo.ll(item.name))"
                  @change="(e) => cnyChannelNow = Object.keys(cnyChannelSet)[e.target.value]"
                  class="wo-text-color-blue-default"
                  style="flex:none;border:1px solid var(--border);border-radius:4px;padding:5px;max-width:240px"
                >
                  <view class="wo-flex align-center">
                    <text style="flex:auto;margin: 2px 5px;font-size:18px; font-weight:bold">
                      {{
                      wo.ll(cnyChannelSet[cnyChannelNow].name) }}
                    </text>
                    <uni-icons color="unset" style="margin-right:10px" type="bottom" v-if="Object.keys(cnyChannelSet).length > 1"></uni-icons>
                  </view>
                </picker>-->

                <uni-data-select
                  :clear="false"
                  :localdata="Object.entries(cnyChannelSet).map(([key,value])=>({text:wo.ll(value.name),value:key}))"
                  :stylePicked="{fontWeight:'bold',fontSize:'18px',color:'var(--blue-default)'}"
                  class="wo-bg-color-white"
                  style="flex:none;max-width:250px;height:40px;border:1px solid var(--border)"
                  v-model="cnyChannelNow"
                ></uni-data-select>

                <!-- <label style="font-size:16px;padding:5px 0;">{{ wo.ll({ zhCN: '支付渠道', enUS: 'Pay Channel' })}}</label> -->
                <text style="font-size:14px;color:#666;padding:5px 0">
                  {{ wo.ll(
                  cnyChannelNow === 'wxpay' && wo.envar.clientInfo.browser === 'wechat'
                  ? {
                  zhCN: '请用微信扫码，或者点击支付按钮',
                  enUS: 'Scan the QR code with Wechat, or click the button'
                  } : cnyChannelNow === 'wxpay'
                  ? {
                  zhCN: '请用微信扫码，或将链接转发到微信中打开',
                  enUS: 'Scan the QR code or open the link in wechat'
                  } : /\balipay\.com\b/.test(cnyPayUrl)
                  ? {
                  zhCN: '请用支付宝扫码，或在浏览器中打开下方链接',
                  enUS:'Scan the QR code with Alipay, or open the link in browser'
                  }
                  : {
                  zhCN: '请扫描二维码，或在浏览器中打开下方链接',
                  enUS: 'Scan the QR code or open the link in browser'
                  })
                  }}
                </text>
                <button
                  :disabled="!isValidAmount"
                  @click="wo.tt.open_url({url:payServerUrl})"
                  class="wo-text-color-white wo-bg-color-green-default"
                  id="_打开微信支付按钮"
                  style="flex:none;border-radius:30px;height:46px;margin:auto;box-shadow:2px 2px 5px 0px rgba(0,0,0, 0.5)"
                  v-if="cnyChannelNow === 'wxpay' && wo.envar.clientInfo.browser === 'wechat'"
                >
                  <!-- 不能用 webview，即使在微信浏览器里也无法调起微信支付。也不能在 browser 里用 weixin:// 点击按钮会毫无反应。因此不能用cnyPayUrl而要 open_url_in_browser({url:payServerUrl})。连接payServerUrl时，点击按钮后会有两三秒毫无反应，（顶部有绿色流程条在走，但不明显）然后才打开新页面。 -->
                  <uni-icons color="unset" custom-prefix="icont-platform" size="28" type="icont-platform-weixin-fill"></uni-icons>
                  <text>{{ wo.ll({zhCN:'唤起',enUS:'Launch '})+wo.ll(cnyChannelSet.wxpay.name) }}</text>
                </button>
                <button
                  :disabled="!isValidAmount"
                  @click="wo.tt.open_url({url:cnyPayUrl})"
                  class="wo-text-color-white wo-bg-color-blue-default"
                  id="_打开支付宝按钮"
                  style="flex:none;border-radius:30px;height:46px;margin:auto;box-shadow:2px 2px 5px 0px rgba(0,0,0, 0.5)"
                  v-else-if="cnyChannelNow === 'alipay' && !wo.envar.inPc && /\balipay\.com\b/.test(cnyPayUrl)"
                >
                  <text>{{ wo.ll({zhCN:'唤起',enUS:'Launch '})+wo.ll(cnyChannelSet.alipay.name) }}</text>
                </button>
              </view>
              <view style="width:20px"></view>
              <view class="wo-bg-color-white" id="_右侧cny支付二维码" style="display:flex;justify-content: center;padding: 5px 5px 2px;cursor:pointer;">
                <ucQrcode :val="cnyPayUrl" size="160" />
              </view>
            </view>
            <view class="wo-flex end align-center" id="_底部支付链接_CNY" style="padding-top:5px">
              <view @click="wo.tt.open_url({url:cnyPayUrl})" style="cursor:pointer;color:var(--blue-default)">
                <uni-icons color="unset" custom-prefix="icont-basic" style="margin-right:2px" type="icont-basic-hyperlink"></uni-icons>
                <text style="word-break:break-all; text-align:right; font-size:14px;">{{ cnyPayUrl }}</text>
              </view>

              <part-share-buttons :shareTitle="cnyPayTitle" :shareUrl="cnyPayUrl" class="wo-text-color-grey"></part-share-buttons>
            </view>
          </template>

          <template v-else-if="wo.ss.i18n.depositCoinNow.coinCode">
            <view class="wo-flex row between" id="_USDT渠道" style="width:100%">
              <view class="wo-flex column start" id="_左侧选择区块链">
                <!-- <picker
                  :range="Object.values(usdtChainSet).map((item) => wo.ll(item.name))"
                  @change="(e) => usdtChainNow = Object.keys(usdtChainSet)[e.target.value]"
                  class="wo-text-color-blue-default wo-bg-color-white"
                  style="flex:none;border:1px solid var(--border);border-radius:2px;padding:5px;max-width:250px"
                >
                  <view class="wo-flex align-center">
                    <text style="flex:auto;margin: 2px 5px;font-size:18px; font-weight:bold">{{ wo.ll(usdtChainSet[usdtChainNow].name) }}</text>
                    <uni-icons color="unset" style="margin-right:10px" type="bottom"></uni-icons>
                  </view>
                </picker>-->

                <uni-data-select
                  :clear="false"
                  :localdata="Object.entries(usdtChainSet).map(([key,value])=>({text:wo.ll(value.name),value:key}))"
                  :stylePicked="{fontWeight:'bold',fontSize:'18px',color:'var(--blue-default)'}"
                  class="wo-bg-color-white"
                  style="flex:none;max-width:262px;height:40px;border:1px solid var(--border)"
                  v-model="usdtChainNow"
                ></uni-data-select>

                <!-- <label style="font-size:16px;padding:5px 0;">{{ wo.ll({ zhCN: '选择区块链', enUS: 'Choose Blockchain' })}}</label> -->
                <text style="font-size:14px;color:#666;padding:5px 0">
                  {{ wo.ll({
                  zhCN: '必须确保在同一区块链网络进行转账！错误网络将导致您的汇款丢失！',
                  enUS: 'Make sure to transfer on the same network! Otherwise it will result in the loss of remittance!'
                  }) }}
                </text>
              </view>
              <view style="width:20px"></view>
              <view class="wo-flex column" id="_右侧二维码">
                <view class="wo-bg-color-white" style="display:flex;justify-content: center;padding: 5px 5px 2px;cursor:pointer">
                  <ucQrcode :val="wo.ss.User.onlineUser.caddETH" size="160" />
                </view>
              </view>
            </view>
            <view class="wo-flex align-center" id="_底部转账地址_USDT" style="padding-top:5px">
              <view @click="wo.tt.open_url({url:usdtPayUrl})" style="cursor:pointer;color:var(--blue-default)">
                <uni-icons color="unset" custom-prefix="icont-basic" style="margin-right:2px" type="icont-basic-hyperlink"></uni-icons>
                <text style="word-break:break-all; text-align:right;font-size:14px;">
                  {{
                  wo.ss.User.onlineUser.caddETH }}
                </text>
              </view>
              <part-share-buttons :shareTitle="usdtPayTitle" :shareUrl="usdtPayUrl"></part-share-buttons>
            </view>
          </template>
        </view>

        <view class="wo-flex column start align-center" id="_检查余额" style="padding-top:15px;position:relative;">
          <view class="wo-text-color-red-dark" style="text-align: center;font-size:13px;padding:0 10px;">
            <text>{{ wo.ll(myDepositFeedback) }}</text>
          </view>
          <button
            :disabled="!isValidAmount || refreshing"
            :loading="refreshing"
            @click="to_refresh_balance"
            style="background:#ff9900;color:white;border-radius:30px;height:46px;padding:0 20px; box-shadow:2px 2px 5px 0px rgba(0,0,0, 0.5)"
          >
            <uni-icons color="unset" size="28" type="refresh" v-show="!refreshing" />
            {{ wo.ll({
            zhCN: '刷新余额', enUS: 'Check Balance'
            }) }}
          </button>
          <view
            :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
            @click="uni.navigateTo({url:'umy-contact'})"
            class="wo-flex column center align-center"
            id="_客服按钮"
            style="position:absolute;right:5px;bottom:0px;cursor:pointer;color:#666;width:40px;height:40px;border-radius:10px;"
          >
            <uni-icons :custom-prefix="wo.pageSet['umy-contact'].gotoIconPrefix" :type="wo.pageSet['umy-contact'].gotoIconType" color="unset" size="22"></uni-icons>
            <text style="font-size:11px;text-align:center;">{{wo.ll({zhCN:'客服',enUS:'Customer\nService'})}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
</style>
