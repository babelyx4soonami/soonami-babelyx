<script>
export default {
  data () {
    return {
    }
  },
  computed: {
  },
  async mounted () {
  },
  methods: {
  },
}
</script>

<template>
  <part-window>
    <view
      :style="{ padding: wo.envar.inPc ? '80px 0 0' : '0' }"
      id="_layout-online"
      style="min-height:100%; display: flex; flex-flow: column nowrap; box-sizing: border-box;"
    >
      <part-header></part-header>

      <template v-if="['AUTOLOGIN_SUCCESS', 'AUTOLOGIN_FAIL'].includes(wo.ss.Ident.autologgingState)">
        <slot v-if="wo.ss.User.onlineUser.usid"></slot>

        <view class="window-page-full wo-flex column center" v-else>
          <part-identify style="flex:none;"></part-identify>
        </view>
      </template>

      <part-show-loading v-else>
        <!-- <part-dev>luk: 1. 等待自动登录结束； 2. 避免在电脑屏幕上 header 和 footer 碰到一起</part-dev> -->
      </part-show-loading>

      <part-footer></part-footer>
    </view>
  </part-window>
</template>

<style lang="scss" scoped>
</style>
