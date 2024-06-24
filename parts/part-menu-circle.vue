<script>
// the circular menu is learned from https://codepen.io/VisionLine/pen/DQXVbW

export default {
  props: {
    actions: {
      type: Array,
      default: () => [
        { icon: 'trash', action: 'drop', text: wo.ll({ zhCN: '删除', enUS: 'Drop' }) },
        { icon: 'fire', action: 'mint', text: wo.ll({ zhCN: '铸造', enUS: 'Mint' }) },
      ]
    },
  },
  data () {
    return {
      bloomed: false,

      actionsNow: this.actions
    }
  },
  computed: {
  },
  methods: {
    toggleMenu (event) {
      this.bloomed = !this.bloomed

      const menu = this.$refs.menu
      // const rect = menu.getBoundingClientRect() // the size of the rect is toggling between two sizes. You shouldn't rely on it.
      const x = event.detail.x - 100 // rect.width/2
      const y = event.detail.y - 100 + 44 // - rect.height/2
      // move to the new position
      // #ifdef APP
      //// 20230515 在 app 里，menu.style 不存在！所以自己添加，但即使这样，仍然无法定位准确，不知为何
      menu.style = menu.style || {}
      // #endif
      menu.style.left = `${x}px`
      menu.style.top = `${y}px`

      return true
    },

    setActions (actions) {
      this.actionsNow = actions
    }
  },
}
</script>

<template>
  <view
    :style="{pointerEvents: bloomed?'auto':'none', background: bloomed ? 'rgba(0, 0, 0, 0.5)' : 'unset'}"
    @click="bloomed=false"
    ref="container"
    style="width:100%;height:100%;position:relative;z-index:999;"
  >
    <!-- @click="toggleMenu" should be defined on this (屏幕上任意点击都激活) or called by the parent (parent 自定义点击哪里激活). -->
    <ul :class="{active: bloomed}" ref="menu">
      <li :key="key" v-for="(item, key) in actionsNow">
        <view @click="$emit('clickMenuitem', item.action)" class="menuitem" style="display:flex;flex-direction: column;">
          <uni-icons :custom-prefix="item.customPrefix" :type="item.icon" class="menuicon" color="unset" size="30" style="transform:translateY(10px)"></uni-icons>
          <text style="font-size:small;font-weight:bold;transform:translateY(-25px)">{{item.text}}</text>
        </view>
      </li>

      <li class="toggleKey">
        <view @click="bloomed=false" class="menuitem">
          <uni-icons class="menuicon" color="unset" size="30" type="closeempty"></uni-icons>
        </view>
      </li>
    </ul>
  </view>
</template>

<style scoped lang="scss">
@import '@/node_modules/compass-mixins/lib/compass/css3';

// can touch this!
$items: 4;
$size: 100;
$bgcolor: #f6717f;

// can't touch this!
$deg: 360 / $items;
//not used: $unrotate: - (90 - $deg)/2;
$skew: 90 - $deg;
$offset: 45;

ul {
  @include transform(scale(0.2));
  @include transition(0.3s ease-out all);
  opacity: 0;
  list-style-type: none;
  margin: 0;
  padding: 0;
  position: relative;
  display: inline-block;
  width: #{$size * 2}px;
  height: #{$size * 2}px;
  z-index: 999;

  li {
    position: absolute;
    width: #{$size}px;
    height: #{$size}px;
    -webkit-transform-origin: 100% 100%;
    overflow: hidden;
    display: none;

    .menuitem {
      text-decoration: none;
      color: lighten($bgcolor, 30%);
      display: block;
      width: #{$size * 2}px;
      height: #{$size * 2}px;
      border-radius: 50%;
      text-align: center;
      background: $bgcolor;
      font-size: 25px;
      cursor: pointer;
    }

    &:nth-child(odd) {
      .menuitem {
        background: lighten($bgcolor, 2%);
      }
    }

    @for $i from 1 through $items {
      &:nth-child(#{$i}) {
        display: block;
        @include transform(rotate(#{$i * $deg}deg) skew(#{$skew}deg));

        .menuitem {
          line-height: #{$size/2}px;
          @include transform(rotate(-#{$deg - $offset}deg) skew(-#{$skew}deg));

          &:hover {
            background: darken($bgcolor, 5%);
            color: white;
          }
        }
      }
    }

    &.toggleKey {
      width: 50px;
      height: 50px;
      background: white;
      border-radius: 50%;
      position: absolute;
      left: calc(50% - 25px);
      top: calc(50% - 25px);
      display: block;
      @include transform(scale(3.8) rotate(45deg));
      @include transition(0.3s ease-in-out all);
      -webkit-transform-origin: 50% 50%;

      .menuitem {
        background: none;
        width: 50px;
        height: 50px;
        line-height: 50px;
        color: #ccc;
      }
    }
  }

  &.active {
    @include transform(scale(1));
    opacity: 1;

    .toggleKey {
      @include transform(rotate(0deg));
    }
  }
}
</style>

