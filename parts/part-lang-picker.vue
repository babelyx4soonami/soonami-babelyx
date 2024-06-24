<script>
// 20240430 注意到，在 Web + PC 上，如果窗口宽度缩小到一定程度，原地小弹窗会突变成类似手机上的从底部升起、占全宽的弹窗，但是看不见picker里的可选项！
export default {
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
  },
}
</script>

<template>
  <picker
    :range="Object.values(wo.ss.i18n.langSet)"
    :value="Object.keys(wo.ss.i18n.langSet).indexOf(wo.ss.i18n.mylang)"
    @change="(e)=>{wo.tt.pick_lang(Object.keys(wo.ss.i18n.langSet)[e.target.value])}"
    class="wo-select-forbidden"
    style="box-sizing: border-box; text-align: right; height: 30px; line-height: 30px; color: white; border-radius: 20px; padding: 0 10px; font-size: small; border: 1px solid var(--grey-e); position: absolute; bottom: 12px; right: 10px;"
  >
    <view style="display: flex; flex-flow: row nowrap">
      <text style="margin: 0 8px 0 4px">{{ wo.ss.i18n.langSet[wo.ss.i18n.mylang] }}</text>
      <uni-icons color="unset" type="bottom"></uni-icons>
    </view>
  </picker>
</template>

<style lang="scss" scoped>
</style>
