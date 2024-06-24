<script>
export default {
  props: {
    textAddress: { type: String, default: '' }
  },
  data () {
    return {
      text: ''
    }
  },
  mounted () {
    uni.request({
      url: wo.tt.make_server_url(this.textAddress), // 通过 make_server_url 允许传入多种形式
      dataType: 'text',
      success: ({ statusCode, header, errMsg, data }) => {
        if (statusCode === 200)
          this.text = data
        else
          this.text = wo.ll({ zhCN: '加载失败', enUS: 'Failed loading text' })
      }
    })
  },
  methods: {

  },
}
</script>

<template>
  <view>{{ text || wo.ll({zhCN:'加载中...',enUS:'loading...'}) }}</view>
</template>

<style>
</style>
