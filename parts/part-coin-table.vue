<script>
export default {
  props: {
    pick_coin: {
      type: Function,
      default: () => { },
    },
    coinSet: {
      type: Object,
      default: () => wo.ss.i18n.depositCoinSet
    },
    coinInit: {
      type: Object,
      default: () => Object.values(wo.ss.i18n.depositCoinSet)[0]
    }
  },
  data () {
    return {
      coinList: Object.values(this.coinSet), // 要被排序，所以不做 prop
      coinNow: this.coinInit,
    }
  },
  computed: {},
  mounted () { },
  methods: {
  },
}
</script>

<template>
  <view :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth600 }" class="wo-flex column" style="max-height:75vh">
    <uni-table style="flex:none;overflow:visible;">
      <!-- <part-dev>luk: uni-table有排序和搜索功能,但无法点击选择某一行,并且表头无法固定不动.因此和uni-list联合起来使用</part-dev> -->
      <uni-tr>
        <uni-th style="padding-left:10px" width="30%">{{ wo.ll({ zhCN: '符号', enUS: 'Symbol' }) }}</uni-th>
        <uni-th
          @sort-change="({ order }) => {
          if (order === 'ascending') {
            coinList.sort((x, y) => wo.ll(x.coinIname).localeCompare(wo.ll(y.coinIname), wo.ss.i18n.mylang.substr(0, 2)))
          } else if (order === 'descending') {
            coinList.sort((x, y) => wo.ll(y.coinIname).localeCompare(wo.ll(x.coinIname), wo.ss.i18n.mylang.substr(0, 2)))
          }
        }"
          align="center"
          sortable
          style="cursor:pointer"
          width="40%"
        >{{ wo.ll({ zhCN: '名称', enUS: 'Name' }) }}</uni-th>
        <uni-th
          @sort-change="({ order }) => {
          if (order === 'ascending') {
            coinList.sort((x, y) => x.coinCode < y.coinCode ? -1 : 1)
          } else if (order === 'descending') {
            coinList.sort((x, y) => x.coinCode < y.coinCode ? 1 : -1)
          }
        }"
          align="right"
          sortable
          style="cursor:pointer;padding-right:10px"
          width="30%"
        >{{ wo.ll({ zhCN: '代号', enUS: 'Code' }) }}</uni-th>
      </uni-tr>
      <uni-tr></uni-tr>
    </uni-table>
    <view class="listContainer" style="flex:auto;overflow-y:auto">
      <uni-list>
        <uni-list-item
          :border="false"
          :customStyle="{ padding: '', backgroundColor: coin.coinCode === coinNow.coinCode ? 'var(--bg)' : 'unset' }"
          :key="index"
          @click="coinNow = coin; pick_coin(coin)"
          clickable
          v-for="(coin, index) of coinList"
        >
          <view class="wo-text-color-black" slot="header" style="flex:none;display: flex;flex-flow:row nowrap;align-items: center;">{{ coin.coinSymbol }}</view>
          <view class="text-ellipsis" slot="body" style="flex:auto;text-align: center;">
            {{
            wo.ll(coin.coinIname)
            }}
          </view>
          <view slot="footer" style="flex:none;">{{ coin.coinCode }}</view>
        </uni-list-item>
      </uni-list>
      <uni-load-more :contentText="{ contentnomore: '----' }" status="noMore"></uni-load-more>
    </view>
  </view>
</template>

<style lang="scss" scoped>
//.listContainer::-webkit-scrollbar{width:0 !important}
</style>
