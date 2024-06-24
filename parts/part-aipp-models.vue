<script>
export default {
  data () {
    return {
      onceLoaded: false,
      //thisAippList: Object.entries(wo.envar.aiModelSet).reduce((acc, [key, m]) => { if (!m.hiddenModel) { acc[key] = m } return acc }, {})
    }
  },
  // watch: {
  //   'wo.ss.i18n.mylang': { // 随着用户 mylang 的变化而动态调整文心一言的排序. 但是如果在加载本组件前就进入 part-aichat 那里的初始化 Object.keys(wo.ss.aiModelSet)[0] 可能是不准确的。
  //     immediate: true, handler (newVal, oldVal) {
  //       if ('CN' === wo.ss.i18n.userlandCode) {
  //         for (let key of ['cnwenxin', 'cnwenxint']) {
  //           let existedIndex = this.thisAippList.findIndex(amodel => amodel.aicode === key)
  //           if (existedIndex >= 0) {
  //             let target = this.thisAippList[existedIndex]
  //             this.thisAippList.splice(existedIndex, 1) // 对数组，delete 一个元素造成一个空洞，导致页面里报错，所以这里用 splice。对对象，delete 没有问题。
  //             if ('zhCN' === wo.ss.i18n.mylang) {
  //               this.thisAippList.unshift(target)
  //             } else {
  //               this.thisAippList.push(target)
  //             }
  //           }
  //         }
  //         //if (!wo.ss.AI.aicodeNow) wo.ss.AI.aicodeNow = this.thisAippList[0].aicode
  //       }
  //     }
  //   }
  // },
  computed: {
    thisAippList () {
      let modelList = Object.values(wo.envar.aiModelSet).filter(m => !m.hiddenModel)
      // 对中国&中文用户，把 cnwenxin 放到最前面
      // if ('CN' === wo.ss.i18n.userlandCode && 'zhCN' === wo.ss.i18n.mylang) {
      //   for (let key of ['cnwenxin', 'cnwenxint']) {
      //     let existedIndex = modelList.findIndex(amodel => amodel.aicode === key)
      //     if (existedIndex >= 0) {
      //       let target = modelList[existedIndex]
      //       modelList.splice(existedIndex, 1) // 对数组，delete 一个元素造成一个空洞，导致页面里报错，所以这里用 splice。对对象，delete 没有问题。
      //       modelList.unshift(target)
      //     }
      //   }
      //   //if (!wo.ss.AI.aicodeNow) wo.ss.AI.aicodeNow = modelList[0].aicode
      // }
      return modelList
    }
  },
  async mounted () {
    await wo.tt.wait_autologin()
    this.onceLoaded = true
  },
  methods: {
  },
}
</script>

<template>
  <view style="margin:auto 0" v-if="onceLoaded">
    <!-- 上下auto 使得数量为0或不够铺满屏幕时，显示在屏幕正中。左右0 避免在探索页面，如果pex card宽度为100%会撑破屏幕。 -->
    <view style="padding: 0 10px 10px;text-align:center;color:var(--grey-9);font-size:14px;position:relative;top:-10px">
      <text>
        {{ wo.ll( {
        zhCN:'基础AI模型，适用于通用场景。按各国政策定制，可长期合规使用。定价等同于原始模型商，不加价！',
        enUS:'Base AI models for general purposes. Customized according to local policies around the world. Prices are the same as original suppliers without any additional charges!'
        } ) }}
      </text>
    </view>

    <uni-list :border="true">
      <uni-list-chat
        :avatar="bot.aiavatar ? wo.tt.make_server_url(bot.aiavatar) : ''"
        :avatar-circle="true"
        :key="index"
        :note="wo.ll(bot.ainote).replace(/\n/g,'')"
        :style="{backgroundColor:bot.aicode===wo.ss.AI.aicodeNow?'var(--green-light)':'unset'}"
        :time="wo.tt.formatDate(bot.createdTimeUnix)"
        :title="bot.ainame"
        @click="$emit('clickAintity', {aicode: bot.aicode})"
        badge-positon="right"
        class="wo-clickable"
        clickable
        v-for="(bot, index) of thisAippList"
      >
        <view class="wo-flex column center align-end" style="flex:auto">
          <text :class="{'wo-text-color-red':bot.aiu2tuc<=0}" style="font-size:16px;">{{wo.ll(bot.aiprice)}}</text>
          <text style="font-size:12px;color:#999; margin-top:8px">{{wo.ll(wo.ll(bot.aiprovider || {zhCN:'基础模型',enUS:'Base Model'}))}}</text>
        </view>
      </uni-list-chat>
    </uni-list>
    <part-load-more loadMoreStatus="frozen"></part-load-more>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
