<script>
export default {
  data () {
    return {
      loadMoreStatus: '',
      takeLimit: 12,
      onceLoaded: false,
      thisAippList: wo.ss.AI.aippListMyCreated
    }
  },
  computed: {
  },
  async mounted () {
    await wo.tt.wait_autologin()
    if (!wo.ss.User.onlineUser.usid) {
      this.thisAippList.onceLoaded = true
    } else if (!this.thisAippList.length && !this.thisAippList.onceLoaded) { // 首次打开本页面时
      this.thisAippList.onceLoaded = true
      await this.to_get_my_aipps()
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_my_aipps () {
      if (!wo.ss.User.onlineUser.usid) {
        return
      }
      if (this.loadMoreStatus === 'loading') {
        //        wo.tt.showToast({ title: wo.ll({ zhCN: '正在加载中...', enUS: 'Loading...' }) })
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, aippList } = await wo.tt.callBase({
        apiWho: 'Aimodel',
        apiTodo: 'get_my_aippList',
        apiWhat: {
          skip: this.thisAippList.length,
          take: this.takeLimit
        }
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {

        if (aippList?.length) {

          this.thisAippList.push(...aippList)

        }
        if (aippList.length < this.takeLimit) {
          this.loadMoreStatus = 'noMore'
          return
        }
        this.loadMoreStatus = 'more'
      }
    }
  },
}
</script>

<template>
  <view style="margin:auto 0" v-if="onceLoaded">
    <!-- auto: 不满屏则置中 -->
    <view style="padding: 0 10px 10px;text-align:center;color:var(--grey-9);font-size:14px;position:relative;top:-10px">
      <text>
        {{ wo.ll( {
        zhCN:'我自己创建的AI应用。',
        enUS:'Aipps created by myself.'
        } ) }}
      </text>
    </view>

    <part-empty-list
      :aboveAction="wo.ss.User.onlineUser.usid ? to_get_my_aipps : undefined"
      :belowAction="() => { uni.navigateTo({ url: 'menu-aipp-create' }) }"
      :belowText="wo.ss.User.onlineUser.usid ? wo.pageSet['menu-aipp-create'].i18nPageTitle : {zhCN:'注册登录',enUS:'Signup or Login'}"
      :prompt="wo.ss.User.onlineUser.usid ? {zhCN:'暂时找不到您创建的AI应用。\n请稍后再试，或创建您的新应用！',enUS:'Not found your own Aipps.\nPlease try again later\n or create a new Aipp!'} : {zhCN:'登录后即可查看您创建的AI应用',enUS:'Login to manage your own Aipps'}"
      aboveIcon="refresh"
      belowIcon="auth"
      style="margin-top:50px"
      v-if="!thisAippList.length && onceLoaded"
    ></part-empty-list>
    <template v-else>
      <uni-list :border="true">
        <uni-list-chat
          :avatar="bot.aiavatar ? wo.tt.make_server_url(bot.aiavatar) : ''"
          :avatar-circle="true"
          :badge-positon="bot.accessLevel==='PRIVATE'?'left':''"
          :badge-text="wo.ll({zhCN:'私',enUS:'Pri'})"
          :key="index"
          :note="wo.ll(bot.ainote).replace(/\n/g,'')"
          :style="{backgroundColor:bot.aicode===wo.ss.AI.aicodeNow?'var(--green-light)':'unset'}"
          :time="wo.tt.formatDate(bot.createdTimeUnix)"
          :title="bot.ainame"
          @click="$emit('clickAintity', {aicode: bot.aicode})"
          class="wo-clickable"
          clickable
          v-for="(bot, index) of thisAippList"
        >
          <view class="wo-flex column align-end" style="flex:auto">
            <text style="font-size:16px;">{{wo.tt.merge_model_and_owner_price(bot)}}</text>
            <text style="font-size:12px;color:#999;margin-top:8px">{{wo.tt.formatDate(bot.createdTimeUnix, 'yyyy-mm-dd')}}</text>
          </view>
        </uni-list-chat>
      </uni-list>
      <part-load-more :loadMoreAction="to_get_my_aipps" :loadMoreStatus="loadMoreStatus"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
