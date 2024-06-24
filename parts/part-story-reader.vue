<script>
export default {
  props: {
    story: {
      type: Array,
      default: ()=>[],
    },
    disabled: {
      type: Boolean,
      default: false // false 图片可以点击；true 图片不可点击
    },
    mask: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {},
}
</script>

<template>
  <view style="position:relative;display: flex; flex-flow: column nowrap; box-sizing: border-box; border-width: 0px; border-style: solid; border-radius:4px; overflow:hidden; padding:5px;"
      class="wo-bg-color-bg wo-border-color-border">
    <view v-for="(section, index) of story" :key="index"
      style="display: flex; flex-flow: column nowrap; padding: 5px; position: relative;">
      <!-- <view v-if="section.image" 
        style="width:100%; min-height:60px; flex: none; margin:0; padding:0; background: white no-repeat center center / 60px border-box; overflow:hidden;"
        :style="{ backgroundImage: 'url(/static/loading.gif)'}">
        <img :src="wo.tt.make_server_url(section.image)" style="width: 100%;background:white" />
      </view> -->
      <!-- 在外面套一层 view 来放 loading.gif 。但不知为何，这时，图片元素的底部多出4个像素的空白边，而如果是单独的图片不套外层，就不会多出空白边。
      但换用了套壳后，仍然导致透明背景显出loading.gif。似乎只有pex-card的height:0能避免。-->
      <image v-if="section.image" :src="wo.tt.make_server_url(section.image)" mode="widthFix" :lazy-load="true" 
        style="min-width:200px; width:100%; flex: none; margin:0; padding:0; background:white url(/static/loading.gif) no-repeat center / 60px; overflow:hidden;"></image>
      <!-- 如果用户上传了 png 的透明背景图，则无法遮盖住底下的背景图 -->
      <video v-else-if="section.video" :src="wo.tt.make_server_url(section.video)" style="width: 100%; height:0; padding-bottom:100%"
        :loop="true" :autoplay="true" object-fit="contain" :muted="false" :controls="true" :show-mute-btn="true"
        :show-center-play-btn="true" :enable-progress-gesture="true" :show-progress="true"></video>
      <view v-else-if="section.link">
        <uni-icons color="unset" custom-prefix="icont-basic" type="icont-basic-hyperlink" style="margin-right:5px"></uni-icons>
        <text
          @click.stop="wo.tt.open_url({url:wo.tt.make_server_url(section.link)})"
          style="color:var(--blue-default); box-sizing: border-box; width: 100%; white-space: break-spaces;word-wrap: break-word;word-break: break-word;text-align:justify">
          {{wo.ll(section.linkText)}}
        </text>
      </view>
      <view v-else
        style="box-sizing: border-box; width: 100%; white-space: break-spaces;word-wrap: break-word;word-break: break-word;text-align:justify">
        <text v-if="section.text">{{ wo.ll(section.text) }}</text>
        <part-texturl-reader v-else-if="section.textIpfsUrl" :textAddress="section.textIpfsUrl"></part-texturl-reader>
      </view>
    </view>
    <view v-if="mask" style="position:absolute;top:0;left:0;bottom:0;right:0;" :style="{backgroundColor:mask}"></view>
  </view>
</template>

<style lang="scss" scoped>

</style>
