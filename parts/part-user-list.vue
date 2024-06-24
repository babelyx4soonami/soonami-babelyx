<script>
export default {
  props: {
    creatorList: {
      type: Array,
      default: () => []
    },
    timestampKey: {
      type: String,
      default: ''
    },
    userType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
    }
  },
  computed: {},
  mounted () { },
  methods: {},
}
</script>

<template>
  <uni-list>
    <uni-list-item
      :border="true"
      :key="index"
      @click="()=>{ wo.ss.User.hostUser = creator; uni.navigateTo({url:'show-creator?hostUsid='+creator.usid}) }"
      clickable
      direction="row"
      v-for="(creator,index) of creatorList"
    >
      <view
        :style="{ backgroundImage: wo.tt.make_bgurl(creator.portrait) }"
        class="头像"
        slot="header"
        style="flex:none; width:50px; height:50px; line-height:50px; text-align:center; background: white no-repeat center / cover; border-radius:100%; box-shadow:0 0 10px 0 rgba(0,0,0,0.3);"
      >
        <uni-icons color="lightgrey" size="24" style="margin:auto" type="person" v-if="!creator.portrait"></uni-icons>
      </view>
      <view slot="body" style="flex: auto;display:flex;flex-flow:column nowrap;">
        <view
          class="wo-text-color-grey-3"
          id="_姓名日期"
          style="display: flex; align-items: flex-start; padding:0 8px; height:1.5em; line-height:1.5em; overflow: hidden;"
        >
          <!-- why 11px: story reader's each section has 1px border -->
          <view class="text-ellipsis" style="flex: auto; font-size: 16px; width:100px;">
            <!-- 不知为何，加个 width 就能阻止长字符串顶破宽度-->
            {{ creator.nickname }}
          </view>
          <view style="flex: none; width:10px;height:100%;"></view>
          <view style="flex: none; font-size: x-small; text-align: right;">
            <text
              v-if="creator[timestampKey]"
            >{{ wo.ll( timestampKey==='registerTimeUnix' ? {zhCN:'注册于',enUS:'Registered at'} : timestampKey==='txTimeUnix' ? {zhCN:'交易于',enUS:'Traded at'} :'' ) }} {{ wo.tt.formatDate(creator[timestampKey], 'yyyy-mm-dd HH:MM') }}</text>
          </view>
        </view>
        <view class="wo-flex wrap" id="_统计信息" style="font-size:12px;flex:auto" v-if="userType!=='INVITEE'">
          <view class="wo-flex align-center wo-text-color-green-default" style="cursor:pointer;padding:2px;margin:0 10px;">
            <uni-icons
              :custom-prefix="wo.pageSet['umy-collection'].gotoIconPrefix"
              :type="wo.pageSet['umy-collection'].gotoIconType"
              color="unset"
              style="margin-right:4px"
            ></uni-icons>
            <text>{{ (creator.countAsCreator + creator.countAsOwner - creator.countRemoved) || 0 }}</text>
          </view>
          <view class="wo-flex align-center" style="color: #fe00f1; cursor:pointer;padding:2px;margin:0 10px;">
            <uni-icons
              :custom-prefix="wo.pageSet['umy-circle'].gotoIconPrefix"
              :type="wo.pageSet['umy-circle'].gotoIconType"
              color="unset"
              style="margin-right:4px"
            ></uni-icons>
            <text>{{ parseInt(creator.countFollower + creator.countFollowing) || 0 }}</text>
          </view>
        </view>
      </view>
    </uni-list-item>
  </uni-list>
</template>

<style lang="scss" scoped>
</style>
