
<script>
export default {
  props: {
    creatorList: { type: Array, default: () => [] },
    twoColumnOnPhone: { type: Boolean, default: false },
  },
  data () {
    return {
      hasBorder: true,
      bgWhite: true,
    }
  },
  computed: {},
  mounted () { },
  methods: {},
}
</script>

<template>
  <view style="display: flex; flex-flow: row wrap; justify-content: space-evenly;">
    <view
      :key="index"
      :style="{ width: wo.envar.inPc ? '345px' : wo.envar.inPad ? '33.3%' : twoColumnOnPhone ? '50%' : '100%' }"
      @click="()=>{ wo.ss.User.hostUser = creator; uni.navigateTo({url:'show-creator?hostUsid='+creator.usid}) }"
      style="flex: none;"
      v-for="(creator, index) in creatorList"
    >
      <view :style="{ margin: wo.envar.inPc ? '10px' : wo.envar.inPad ? '10px' : '20rpx 10rpx', backgroundColor: bgWhite ? 'white' : 'rgba(0,0,0,0.9)' }">
        <uni-list-item>
          <view
            :style="{ backgroundImage: wo.tt.make_bgurl(creator.portrait) }"
            class="头像"
            slot="header"
            style="flex:none; width:50px; height:50px; line-height:50px; text-align:center; background: white no-repeat center / cover; border-radius:100%; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);"
          >
            <uni-icons color="lightgrey" size="28" style="margin:auto" type="person" v-if="!creator.portrait"></uni-icons>
          </view>
          <view slot="body" style="flex: auto;display:flex;flex-flow:column nowrap;">
            <view
              :class="{'wo-text-color-grey-f':!bgWhite}"
              id="_姓名日期"
              style="display: flex; align-items: flex-start; padding:0 8px; height:1.5em; line-height:1.5em; overflow: hidden;"
            >
              <!-- why 11px: story reader's each section has 1px border -->
              <view class="text-ellipsis" style="flex: auto; font-size: 16px; width:100px;">
                <!-- 不知为何，加个 width 就能阻止长字符串顶破宽度-->
                {{ creator.nickname }}
              </view>
              <view style="flex: none; width:10px;height:100%;"></view>
              <!--          <view style="flex: none; font-size: x-small; text-align: right;">
            <text>{{ wo.tt.formatDate(creator.followTimeUnix||creator.registerTimeUnix||creator.txTimeUnix, 'yyyy-mm-dd HH:MM') }}</text>
              </view>-->
            </view>
            <view class="wo-flex wrap" id="_统计信息" style="font-size:12px;flex:auto">
              <view class="wo-flex align-center wo-text-color-green-default" style="cursor:pointer;padding:2px;margin:0 10px;">
                <uni-icons
                  :custom-prefix="wo.pageSet['umy-collection'].gotoIconPrefix"
                  :type="wo.pageSet['umy-collection'].gotoIconType"
                  color="unset"
                  style="margin-right:4px"
                ></uni-icons>
                <text>{{ (creator.countAsCreator + creator.countAsOwner - creator.countRemoved) || 0 }}</text>
              </view>
              <view class="wo-flex align-center" style="color: #fe00f1; cursor:pointer;border-radius:10px;padding:2px;margin:0 10px">
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

        <!--    <view class="wo-flex between center">
      <view v-for="creation of creator.collectList" class="text-ellipsis"
      style="flex:auto;width: calc(33.33% - 8px); height:0; padding-bottom: calc(33.33% - 8px); margin:4px;
      background:white no-repeat center / cover border-box; border-radius:2px" 
      :style="{backgroundImage: wo.tt.make_bgurl(creation.openCover) }">
        {{creation.openTitle}}
      </view>
        </view-->
        <part-creation-card-list
          :hideAvatar="true"
          :hideInfobar="true"
          :inCreatorCard="true"
          :pexList="creator.collectList"
          :style="{padding:hasBorder?'0 10px 10px':'0'}"
          style="justify-content: center;padding:0 10px 10px;box-sizing: border-box;"
          v-if="creator.blockState!=='BLOCKED'"
        ></part-creation-card-list>

        <view class="wo-flex center align-center" style="position:relative;width:100%;padding:0 10px 10px;box-sizing: border-box;" v-else>
          <view style="width:100%;height:0;padding-bottom:50%"></view>
          <view class="wo-flex center align-center text-ellipsis" style="position:absolute;width:100%;height:100%;font-size:14px;">
            <text>{{ wo.ll({zhCN:'该用户已被您屏蔽',enUS:'You have blocked this user'}) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
</style>
