<script>
export default {
  props: {
    pexList: { type: Array, default: () => [] },
    twoColumnOnPhone: { type: Boolean, default: false },
    inCreatorCard: { type: Boolean, default: false },
    hideAvatar: { type: Boolean, default: false },
    hideInfobar: { type: Boolean, default: false }
  },
  data () {
    return {
    }
  },
  methods: {
  },
}
</script>

<template>
  <view style="display: flex; flex-flow: row wrap; justify-content: space-evenly;">
    <view
      :key="index"
      :style="{ width: inCreatorCard ? '50%' : wo.envar.inPc ? '345px' : wo.envar.inPad ? '33.3%' : twoColumnOnPhone ? '50%' : '100%' }"
      style="flex:none"
      v-for="(creation, index) in pexList"
    >
      <view
        :style="{margin: inCreatorCard ? '0' : wo.envar.inPc ? '10px' : wo.envar.inPad ? '10px' : '20rpx 10rpx'}"
        @click="()=>{
        if (!inCreatorCard) {
          wo.ss.Creation.creationNow = creation
          uni.navigateTo({ url: 'show-creation?pexdataCidHash=' + creation.pexdataCidHash })
        }
      }"
        style="position:relative; flex: auto; padding: 0px; box-sizing: border-box; cursor: pointer; overflow:hidden; border:0; background-color:white; box-shadow:rgba(0, 0, 0, 0.3) 0px 0px 5px 0px; border-radius:4px"
      >
        <!-- <part-dev>
          为了适用于 part-creator-card-list/list 里的3列布局,把宽度定义提到uni-card外套一层,就不需要在 uni-card 里定义宽度了
          :style="{ width: wo.envar.inPc ? '345px' : wo.envar.inPad ? '300px' : twoColumnOnPhone ? '335rpx' : '690rpx',
          margin: wo.envar.inPc ? '10px' : wo.envar.inPad ? '10px' : '20rpx 10rpx'}"
          20230627 目前的设置 690rpx 在 ipadpro 12.9 上也排成2列，但是在 ipad mini, ipad pro 11 寸上显示为一列占满屏幕宽度。
          测试发现，
            - ipad mini 的 uni.getSystemInfoSync().screenWidth/windowWidth 为 744，（在 MacOS Safari 上测试，iPad mini 的 deviceType==='phone'，不知为何）
            - ipad pro 11寸 为 834，
            - ipad air, ipad 10 为820，
            - ipad pro 12.9inch 为 1024。
          iphone 从 plus/xr/xs/xsmax 都是414, 4/5/se 是 320, 6/7/8 是375
          因此 inPad 里用 rpx 容易产生异常，应当把 inPad 单列出来并且用 px
          卡片宽 = (页宽750 - 页内距20*2)/n - 卡片外距10*2。注意设卡片border=0。当 n=2时卡片宽 335 rpx; n=1时卡片宽 690 rpx，强行设为710rpx也可以，但是就会把卡片向右延伸，导致左右两侧的空白不一致
        </part-dev>-->

        <view
          id="_中国地区待审核封面"
          style="position: relative; width: 100%; height: 0; padding-bottom: 100%; background: #333 no-repeat center / cover border-box; overflow: hidden"
          v-if="wo.ss.i18n.userlandCode === 'CN' && (wo.envar.banChina||[]).includes(creation.censorState)"
        >
          <view
            class="wo-text-color-red-default"
            id="_状态提示"
            style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 5px;
            text-align: center;
            line-height: 1.9em;
            font-size: 14px;
            box-sizing: border-box;
            word-wrap: break-word;
            display:flex; justify-content: center; align-items: center;
          "
          >
            <text>{{wo.ll({zhCN:'等待中国区审查中',enUS:'Waiting China Censoring'})}}</text>
          </view>
        </view>

        <view
          :style="{ backgroundImage: wo.tt.make_bgurl(creation.openCover || '/static/matrix7.jpg') }"
          class="wo-bg-color-green-default"
          id="_加密作品封面"
          style="position: relative; width: 100%; height: 0; padding-bottom: 100%; background: no-repeat center / cover border-box; overflow: hidden"
          v-else-if="!creation.pexdataUser"
        >
          <view
            :style="{fontSize:inCreatorCard?'11px':wo.envar.inPc?'16px':'13px',lineHeight:inCreatorCard?'1.3em':wo.envar.inPc?'1.9em':'1.5em'}"
            class="wo-text-color-green-default"
            id="_密文"
            style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: 5px;
          text-align: center;
          letter-spacing: 20px;
          box-sizing: border-box;
          word-wrap: break-word;
          word-break: break-all;
        "
            v-if="!creation.openCover"
          >{{ wo.tt.read_varchain('creatorSeal.cidoSeal',creation) || creation.pexdataCidHash }}</view>
          <view
            id="_蒙罩"
            style="
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
        "
          ></view>
        </view>

        <view
          id="_免费作品封面"
          style="position: relative; width: 100%; height: 0; padding-bottom: 100%; overflow: hidden; background: white url(/static/loading.gif) no-repeat center / 60px border-box"
          v-else
        >
          <view
            :style="{ backgroundImage: wo.tt.make_bgurl(creation.openCover || wo.tt.filter_story_image(creation.pexdataUser)) }"
            style="position: absolute; width: 100%; height: 100%; background: no-repeat center / cover border-box; overflow: hidden"
            v-if="creation.openCover || wo.tt.filter_story_image(creation.pexdataUser)"
          ></view>
          <video
            :autoplay="true"
            :controls="false"
            :enable-progress-gesture="false"
            :show-center-play-btn="false"
            :show-progress="false"
            :src="wo.tt.make_server_url(wo.tt.filter_story_video(creation.pexdataUser))"
            loop
            muted
            object-fit="cover"
            style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:4px"
            v-else-if="wo.tt.filter_story_video(creation.pexdataUser)"
          >
            <cover-view style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; opacity: 0"></cover-view>
          </video>
          <view
            :style="{ backgroundImage: wo.tt.make_bgurl(wo.envar.bgTextCover || '/static/white.png') }"
            style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: 5px;
          line-height: 1.9em;
          font-size: 16px;
          box-sizing: border-box;
          word-wrap: break-word;
          word-break: break-all;
          background: no-repeat center / cover border-box;
        "
            v-else
          >
            <text v-if="creation.pexdataUser[0].text">{{ creation.pexdataUser[0].text }}</text>
            <part-texturl-reader :textAddress="creation.pexdataUser[0].textIpfsUrl" v-else-if="creation.pexdataUser[0].textIpfsUrl"></part-texturl-reader>
          </view>
        </view>

        <view
          :class="{infoBarInCreator: inCreatorCard}"
          class="infoBarDefault wo-bg-color-grey-f"
          id="_作品标题条"
          style="box-sizing:border-box; height: 30px; width: 100%; display: flex; flex-flow: row nowrap; justify-content: space-between;"
        >
          <text class="text-ellipsis">
            {{
            creation.openTitle
            || `${wo.ll({ zhCN: '无题', enUS: 'Untitled' })} #${creation.pexdataCidHash.slice(-6)}`
            }}
          </text>
          <view
            :style="{ backgroundImage: wo.tt.make_bgurl(creation.portrait) }"
            class="头像"
            style="
          flex: none;
          position: relative;
          width: 60px;
          height: 60px;
          background: #f3f4f6 no-repeat scroll center / cover border-box;
          color: black;
          border-radius: 100%;
          //top: -30px;
          //right: 0px;
          text-align: center;
          line-height: 60px;
          font-size: 20px;
          overflow: hidden;
          word-break: keep-all;
          box-shadow: 2px 2px 15px 0px rgba(0,0,0,0.7);
        "
            v-if="!hideAvatar"
          >{{ creation.portrait ? '' : creation.nickname.substr(0, 2) }}</view>
        </view>
        <view class="wo-flex row between align-center wo-bg-color-grey-f" id="_统计信息条" style="padding: 10px 10px" v-if="!hideInfobar">
          <view
            :class="{ 'wo-text-color-red-default': creation.viewerPact.amount > 0 }"
            :style="{opacity:creation.viewerPact.type==='FORBIDDEN'?0:1}"
            class="wo-flex row align-end"
            style="flex: none"
          >
            <text style="font-size: 26px; font-weight: bold;">{{ wo.tt.number_precision(creation.viewerPact.amount) || 0}}</text>
            <text style="font-size: 20px;margin-left:8px;margin-bottom:2px">{{ wo.envar.tucSymbol }}</text>
          </view>
          <view class="wo-flex column align-center">
            <uni-icons color="unset" type="chat"></uni-icons>
            <text>{{ creation.countComment }}</text>
          </view>
          <view class="wo-flex column align-center">
            <uni-icons color="unset" type="hand-up"></uni-icons>
            <text>{{ creation.countLike }}</text>
          </view>
          <view class="wo-flex column align-center">
            <uni-icons color="unset" type="eye"></uni-icons>
            <text>{{ creation.countViewer }}</text>
          </view>
        </view>

        <view
          class="wo-flex center align-center"
          style="text-align:center; width:100%;height:100%;position:absolute;top:0;left:0;font-size:14px;color:#eee;background:rgba(0,0,0,0.7);"
          v-if="[creation.ownerState, creation.creatorState].includes('REMOVED')"
        >
          <text>{{ wo.ll({zhCN:'已下架',enUS:'Removed'}) }}</text>
        </view>

        <view
          class="wo-flex center align-center"
          style="text-align:center; width:100%;height:100%;position:absolute;top:0;left:0;background:rgba(0,0,0,0.9);font-size:14px;color:#eee;"
          v-else-if="creation.hideState==='HIDED'"
        >
          <text>{{ wo.ll({zhCN:'已被您隐藏',enUS:'Hidden by you'}) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
.infoBarDefault {
  font-size: 16px;
  font-weight: bold;
  align-items: flex-end;
  padding: 0 10px;
}
.infoBarInCreator {
  font-size: 12px;
  font-weight: normal;
  align-items: center;
  padding: 0 5px;

  position: absolute;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  color: #eee;
}
</style>
