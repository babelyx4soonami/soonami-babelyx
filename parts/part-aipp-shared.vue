<script>
export default {
  data () {
    return {
      loadMoreStatus: '',
      takeLimit: 12,
      onceLoaded: false,
      thisAippList: wo.ss.AI.aippListAll,
    }
  },
  computed: {
  },
  async mounted () {
    await wo.tt.wait_autologin()
    if (!this.thisAippList.length && !this.thisAippList.onceLoaded) { // 首次打开本页面时。由于是 aippListAll，应当不断尝试获取，不需要检测 onceLoaded
      this.thisAippList.onceLoaded = true // 本 part 被 2个page 引用，menu-aipp 和 mid-aippia，如果先打开一个page，但是没有激活本组件，然后打开了另一个page，这时激活本组件，会导致本组件同时在2个页面里调用 mounted。如果把 onceLoaded=true 放在 await to_get_all_aipps() 后面，就导致两个页面里的本组件都执行了该方法，从而得到了错误的双份的列表，所以要把 onceLoaded=true 放在之前。
      await this.to_get_all_aipps()
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_all_aipps () {
      if (this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, aippList } = await wo.tt.callBase({
        apiWho: 'Aimodel',
        apiTodo: 'get_all_aippList',
        apiWhat: {
          skip: wo.ss.AI.aippListAll.length, // 扣除被额外添加的 wo.envar.aiModelSet 里的东西
          take: this.takeLimit
        }
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (aippList?.length) {
          wo.ss.AI.aippListAll.push(...aippList)
        }
        if (aippList.length < this.takeLimit) {
          this.loadMoreStatus = 'noMore'
          return
        }
      }
      this.loadMoreStatus = 'more'
    }
  },
}
</script>

<template>
  <view style="margin:auto 0;" v-if="onceLoaded">
    <!-- 上下auto 使得数量为0或不够铺满屏幕时，显示在屏幕正中。左右0 避免在探索页面，如果pex card宽度为100%会撑破屏幕。 -->
    <view style="padding: 0 10px 10px;text-align:center;color:var(--grey-9);font-size:14px;position:relative;top:-10px">
      <text>
        {{ wo.ll( {
        zhCN:'各种AI应用，为不同场景而优化。拥有长期记忆，服务更贴心。由用户开发并分享。',
        enUS:'Aipps optimized for specific purposes and with long memory. Created and shared by users.'
        } ) }}
      </text>
    </view>

    <part-empty-list
      :aboveAction="to_get_all_aipps"
      :belowAction="() => { uni.navigateTo({ url: 'menu-aipp-create' }) }"
      :belowText="wo.pageSet['menu-aipp-create'].i18nPageTitle"
      :prompt="{zhCN:'暂时没有找到AI应用。\n请稍后刷新，或创建您自己的AI应用！',enUS:'Aipps not found.\nPlease try again later\n or create your own Aipp!'}"
      aboveIcon="refresh"
      belowIcon="plusempty"
      style="margin-top:50px"
      v-if="!thisAippList.length"
    ></part-empty-list>
    <template v-else>
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
          <view class="wo-flex column between align-end" style="flex:auto">
            <text style="font-size:16px;margin-bottom:5px">{{wo.tt.merge_model_and_owner_price(bot)}}</text>
            <view
              class="wo-flex row end align-end text-ellipsis wo-text-color-grey-9"
              id="_关联用户"
              style="flex:0 1 auto;cursor:pointer;border-radius:20px;padding-left:10px"
            >
              <text class="text-ellipsis" style="flex:auto;text-align:right;font-size:13px;">{{ bot.nickname }}</text>
              <view
                :style="{ backgroundImage: wo.tt.make_bgurl(bot.portrait) }"
                class="wo-flex center align-center"
                style="flex:none; width:24px; text-align:center; height:24px; margin:1px 1px 1px 5px; background:white no-repeat center / cover; border-radius:100%;box-shadow:0 0 5px 0 rgba(0,0,0,0.3);"
              >
                <uni-icons color="unset" type="person" v-if="bot.creatorUsid && !bot.portrait"></uni-icons>
              </view>
            </view>
          </view>
        </uni-list-chat>
      </uni-list>
      <part-load-more :loadMoreAction="to_get_all_aipps" :loadMoreStatus="loadMoreStatus"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
