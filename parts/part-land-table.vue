<script>
export default {
  props: {
    pick_land: {
      type: Function,
      default: () => { },
    },
    showItc: {
      type: Boolean,
      default: true,
    },
    showFlag: {
      type: Boolean,
      default: true,
    }
  },
  data () {
    return {
      landList: Object.values(wo.ss.i18n.landSet) // 要被排序，所以不做 prop
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
        <uni-th
          @sort-change="({ order }) => {
          if (order === 'ascending') {
            landList.sort((x, y) => x.iso2 < y.iso2 ? -1 : 1)
          } else if (order === 'descending') {
            landList.sort((x, y) => x.iso2 < y.iso2 ? 1 : -1)
          }
        }"
          sortable
          style="cursor:pointer;padding-left:10px"
          width="30%"
        >{{ wo.ll({ zhCN: '代号', enUS: 'Code' }) }}</uni-th>
        <uni-th
          :align="showItc ? 'center' : 'right'"
          :width="showItc ? '40%' : '70%'"
          @filter-change="()=>{}"
          @sort-change="({ order }) => {
            if (order === 'ascending') {
              landList.sort((x, y) => wo.ll(x.name).localeCompare(wo.ll(y.name), wo.ss.i18n.mylang.substr(0, 2)))
            } else if (order === 'descending') {
              landList.sort((x, y) => wo.ll(y.name).localeCompare(wo.ll(x.name), wo.ss.i18n.mylang.substr(0, 2)))
            }
          }"
          luk-filter-type="search"
          sortable
          style="cursor:pointer"
        >{{ wo.ll({ zhCN: '名称', enUS: 'Name' }) }}</uni-th>
        <uni-th
          @sort-change="({ order }) => {
          if (order === 'ascending') {
            landList.sort((x, y) => parseInt(x.itc.replace(/[+ ]/g, '')) - parseInt(y.itc.replace(/[+ ]/g, '')))
          } else if (order === 'descending') {
            landList.sort((x, y) => parseInt(y.itc.replace(/[+ ]/g, '')) - parseInt(x.itc.replace(/[+ ]/g, '')))
          }
        }"
          align="right"
          sortable
          style="cursor:pointer;padding-right:10px"
          v-if="showItc"
          width="30%"
        >{{ wo.ll({ zhCN: '区号', enUS: 'ITC' }) }}</uni-th>
      </uni-tr>
      <uni-tr></uni-tr>
    </uni-table>
    <view class="listContainer" style="flex:auto;overflow-y:auto">
      <uni-list>
        <uni-list-item
          :border="false"
          :customStyle="{ padding: '', backgroundColor: land.iso2 === wo.ss.i18n.phonelandNow.iso2 ? '#f3f4f6' : 'unset' }"
          :key="index"
          @click="pick_land(land)"
          clickable
          v-for="(land, index) of landList"
        >
          <view class="wo-text-color-black" slot="header" style="flex:none;display: flex;flex-flow:row nowrap;align-items: center;">
            <view style="margin-right:4px" v-if="showFlag">
              <img :src="`https://store.tic.cc/flag/${land.iso2}.svg`" v-if="wo.envar.clientInfo.osName === 'windows'" width="18" />
              <view style="font-size:18px" v-else>{{ land.emoji }}</view>
            </view>
            {{ land.iso2 }}
          </view>
          <view :style="{ textAlign: showItc ? 'center' : 'right' }" class="text-ellipsis" slot="body" style="flex:auto;">
            {{
            wo.ll(land.name)
            }}
          </view>
          <view slot="footer" style="flex:none;" v-if="showItc">+{{ land.itc }}</view>
        </uni-list-item>
      </uni-list>
      <uni-load-more :contentText="{ contentnomore: ' --- ' }" status="noMore"></uni-load-more>
    </view>
  </view>
</template>

<style lang="scss" scoped>
//.listContainer::-webkit-scrollbar{width:0 !important}
</style>
