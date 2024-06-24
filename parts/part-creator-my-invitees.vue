<script>
export default {
  data () {
    return {
      loadMoreStatus: '',
      takeLimit: 10,
      onceLoaded: false,
      circleTagSet: wo.ss.myCircleDict,
    }
  },
  computed: {
  },
  async mounted () {
    await wo.tt.wait_autologin()
    if (!wo.ss.Creator.myInviteeList.length && !wo.ss.Creator.myInviteeList.onceLoaded) { // 首次打开本页面时
      await this.to_get_invitee_list()
      wo.ss.Creator.myInviteeList.onceLoaded = true
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_invitee_list () {
      if (!wo.ss.User.onlineUser.usid || this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, count, inviteeList } = await wo.tt.callBase({
        apiWho: 'User', apiTodo: 'get_invitee_list',
        apiWhat: { skip: wo.ss.Creator.myInviteeList.length, take: this.takeLimit }
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (inviteeList?.length) {
          wo.ss.Creator.myInviteeList.push(...inviteeList)
        }
        if (inviteeList.length < this.takeLimit) {
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
  <uni-card style="flex:none;margin:10px 0">
    <uni-list-item :customStyle="{padding:'15px 5px'}" slot="title" style="cursor:unset">
      <view class="wo-flex align-center" slot="header">
        <!-- <uni-icons
          :custom-prefix="circleTagSet.INVITEE.customPrefix"
          :type="circleTagSet.INVITEE.type"
          style="margin-right:5px;flex:auto"
        ></uni-icons>-->
        <text>{{ wo.ll({zhCN:'我已成功邀请了',enUS:'My invitees'}) }} {{ wo.ss.User.onlineUser.countInvitee }} {{wo.ll({zhCN:'人',enUS:'Users'})}}</text>
      </view>
      <view
        @click="uni.navigateTo({url:'umy-invite'})"
        class="wo-bg-color-main wo-text-color-white wo-flex center align-center"
        slot="footer"
        style="cursor:pointer;min-height:1.5em; padding:2px 10px;border-radius:20px;margin:0 0 0 auto"
      >
        <uni-icons :custom-prefix="circleTagSet.INVITEE.customPrefix" :type="circleTagSet.INVITEE.type" color="unset" style="margin-right:4px"></uni-icons>
        <text style="font-size:14px">{{ wo.ll({zhCN:'继续邀请',enUS:'Invite More'}) }}</text>
      </view>
    </uni-list-item>

    <!--      <uni-table style="flex:none;overflow:visible;" v-if="wo.ss.Creator.myInviteeList.length">
      <uni-tr>
        <uni-th width="30%" style="padding-left:10px">{{ wo.ll({ zhCN: '用户昵称', enUS: 'Nickname' }) }}</uni-th>
        <uni-th width="30%" align="right" style="padding-right:10px">{{ wo.ll({ zhCN: '注册时间', enUS: 'Since' })
        }}</uni-th>
      </uni-tr>
      <uni-tr></uni-tr>
    </uni-table>
    <uni-list>
      <uni-list-item v-for="(invitee, index) in wo.ss.Creator.myInviteeList" :key="index" style="cursor:unset"
        :customStyle="{ padding: '15px 10px' }">
        <view slot="header">{{ invitee.nickname }}</view>
        <view slot="body" style="flex:auto;"></view>
        <view slot="footer">{{ wo.tt.formatDate(invitee.registerTimeUnix, 'yyyy-mm-dd HH:MM') }}</view>
      </uni-list-item>
    </uni-list>
    -->
    <part-user-list :creatorList="wo.ss.Creator.myInviteeList" timestampKey="registerTimeUnix" userType="INVITEE"></part-user-list>

    <part-empty-list
      :aboveAction="to_get_invitee_list"
      :belowAction="()=>uni.navigateTo({url:'umy-invite'})"
      :belowText="wo.ll({zhCN:'邀请朋友',enUS:'Invite Friends'})"
      :prompt="wo.ll({ zhCN: '您还没有邀请到小伙伴\n请加油哦',enUS:'You have not invited anyone' })"
      aboveIcon="refresh"
      belowIcon="gift"
      v-if="!wo.ss.Creator.myInviteeList.length && onceLoaded"
    ></part-empty-list>
    <part-load-more :loadMoreAction="to_get_invitee_list" :loadMoreStatus="loadMoreStatus" v-else></part-load-more>
  </uni-card>
</template>

<style scoped lang="scss"></style>
