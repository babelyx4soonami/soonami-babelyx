<script>
export default {
  props: {
    shareTitle: { type: [String, Object], default: '' },
    shareUrl: { type: [String, Object], default: '' }
  },
  data () {
    return {
    }
  },
  computed: {},
  mounted () { },
  methods: {
  },
}
</script>

<template>
  <view
    :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth600 }"
    class="wo-flex column center align-center"
    style="max-height:75vh;margin:0 auto;cursor:initial"
  >
    <part-close-button @closeMe="()=>{$emit('closeMe')}" style="z-index:999"></part-close-button>

    <view :style="{backgroundImage:`url(${wo.pagesJson.appLogo})`}" class="wo-logo-ident" style="margin-bottom:0">
      <!-- <part-dev>给别人看的页面，就应该有一个logo</part-dev> -->
    </view>

    <view style="color:black;text-align: center; margin: 20px auto 10px; font-weight: bold;">
      <text>{{wo.ll(shareTitle)}}</text>
    </view>

    <ucQrcode :val="wo.ll(shareUrl)" class="wo-flex center" size="200" style="padding: 8px; background: white" />

    <view class="wo-flex row nowrap" style="margin:10px 20px 20px;">
      <view @click="$emit('closeMe'); wo.tt.open_url({url:shareUrl})" style="cursor:pointer;color:var(--blue-default);">
        <uni-icons color="unset" custom-prefix="icont-basic" style="margin-right:2px" type="icont-basic-hyperlink"></uni-icons>
        <text style="word-break: break-all; font-size: medium;">{{ wo.ll(shareUrl) }}</text>
      </view>

      <part-share-buttons :shareTitle="shareTitle" :shareUrl="shareUrl" @closeMe="()=>{$emit('closeMe')}" style="color:grey"></part-share-buttons>
    </view>
  </view>
</template>

<style lang="scss" scoped></style>
