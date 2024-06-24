<script>
// #ifdef WEB
//import draggable from 'vuedraggable'
// #endif

export default {
  // #ifdef WEB
  // components: {
  //   draggable,
  // },
  // #endif
  props: {
    // story 作为 prop，其他地方都表现良好，但是在拖拽排序时，vue 警告 "Avoid mutating a prop directly"，并且事实上被提交的story也是原先的顺序，而不是被拖拽之后的顺序。可以用全局的数据来代替 prop，但这样就不能作为组件到处用了。
    story: {
      type: Array,
      default: [],
    },
    maxLength: {
      type: Number,
      default: undefined,
    },
    maxLengthText: {
      type: Number,
      default: -1,
    },
    allowText: {
      type: [Boolean, String],
      default: true,
    },
    allowImage: {
      type: [Boolean, String],
      default: true,
    },
    allowVideo: {
      type: [Boolean, String],
      default: true,
    },
    onPublish: {
      type: Function,
      default: undefined,
    },
    isFocused: {
      type: Boolean,
      default: false,
    },
    publishing: {
      type: Boolean,
      default: false,
    },
    titleStory: {
      type: String,
      default: '',
    },
    styleTitle: {
      type: Object,
      default: ()=>{return {}},
    },
    styleTextarea: {
      type: Object,
      default: ()=>{return {}},
    },
    textPlaceholder: {
      type: String,
      default: '',
    },
    baseType: {
      type: String,
      default: 'SERVER',
    },
    feedback: {
      type: [String,Object],
      default: ''
    },
    noIcon: {
      type: Boolean,
      default: false,
    },
    noLabel: {
      type: Boolean,
      default: false,
    }
  },
  data () {
    return {
      myFeedback: this.feedback
    }
  },
  computed: {
    storyEmpty () { // 每次输入一个字符，都导致被调用，比较浪费，所以用 onPublish || 过滤
      if (typeof this.onPublish === 'function')
        return !this.story.some(section => Object.values(section).some(val => val?.trim?.()))
      else 
        return true
    },
  },
  watch: {
    feedback (vnew, vold) {
      const self = this
      self.myFeedback = vnew
      if (vnew) {
        setTimeout(() => {
          self.myFeedback = ''
        }, 3000)
      }
    }
  },
  methods: {
    deleteSection (index) {
      const sectionToDelete = this.story[index] || {}
      if (Object.values(sectionToDelete).some?.(val => val?.trim?.())) {
        wo.tt.showModal({
          title: { zhCN: `您要删除${sectionToDelete.text ? '这段文字' : sectionToDelete.image ? '这张图片' : sectionToDelete.video ? '这个视频' : '这个段落'}吗？`, enUS: 'To delete this section?' },
          content: (sectionToDelete.image || sectionToDelete.video || sectionToDelete.text),
          success: ({ confirm, cancel }) => {
            if (confirm) {
              this.story.splice(index, 1)
              if (!this.story.length) {
                this.story.push({ text: '' })
              }
            }
          },
        })
      } else if (this.story.length > 1) {
        this.story.splice(index, 1)
      } else {
        this.myFeedback = wo.ll({ zhCN: '不能删除唯一的空段落', enUS: 'Cannot delete the only one empty section' })
        setTimeout(() => { this.myFeedback = '' }, 5000)
      }
    },

    addSection ({ type = 'text' }) {
      if (!wo.tt.check_online()) {
        return
      }
      const self = this
      this.myFeedback = ''
      async function pushContent (replace = true) {
        if (type === 'text') {
          if (replace) self.story.length = 0
          self.story.push({ text: '' })
        } else if (type === 'image') {
          let { _state, ...fileInfo } = await wo.tt.pickupFile({ baseType: self.baseType, mediaType: 'image' })
          if (wo.bok(_state)) {
            if (replace) self.story.length = 0
            self.story.push({ image: wo.tt.choose_url(fileInfo) })
          } else {
            self.myFeedback = { zhCN: '图片上传失败', enUS: 'Image upload failed' }
          }
        } else if (type === 'video') {
          let { _state, ...fileInfo } = await wo.tt.pickupFile({ baseType: self.baseType, mediaType: 'video' })
          if (wo.bok(_state)) {
            if (replace) self.story.length = 0
            self.story.push({ video: wo.tt.choose_url(fileInfo) })
          } else {
            self.myFeedback = { zhCN: '视频上传失败', enUS: 'Video upload failed' }
          }
        } else {
          self.myFeedback = { zhCN: '无效的内容类型', enUS: 'Invalid section type' }
        }
      }

      if (!Array.isArray(this.story)) {
        this.story = []
      }
      if (typeof this.maxLength !== 'undefined' && this.maxLength <= this.story.length) {
        if (this.maxLength === 1) {
          if (!Object.values(this.story[0]).some(val => val?.trim?.())) {
            // 当段落为空
            pushContent()
          } else {
            wo.tt.showModal({
              title: '',
              content: {
                zhCN: `已达到最大长度，需要删除一部分原有内容才能添加新的${{ text: '章节', image: '图片', video: '视频' }[type]}。确定要删除现有内容吗？`,
                enUS: `Maximum length is reached. Some old section must be deleted before adding a new ${{ text: 'section', image: 'picture', video: 'video' }[type]}.`,
              },
              showCancel: true,
              success: async ({ confirm, cancel }) => {
                if (confirm) {
                  pushContent()
                }
              },
            })
          }
        } else {
          this.myFeedback = { zhCN: '已达到最大长度，无法添加新段落。', enUS: 'Maximum amount is reached, new section cannot be added.' }
          return
        }
      } else {
        pushContent(false)
      }
    },

  },
}
</script>

<template>
  <view
    style="display: flex; flex-flow: column nowrap; box-sizing: border-box; border-width: 0px; border-style: solid; border-radius:4px; padding:5px;"
    class="wo-bg-color-bg wo-border-color-border">
    <view v-if="titleStory" style="padding: 5px" :style="styleTitle">{{ titleStory }}</view>
    <!-- <uni-card is-full style="padding:0;background:transparent" spacing="5px" title="titleStory"> -->
    <view style="min-height: 3em">
      <!-- #ifdef WEB -->
      <!-- <draggable v-model="story"> -->
      <!-- #endif -->
      <view v-for="(section, index) of story" :key="index" style="margin: 5px; position: relative">
        <!-- <view v-if="section.image" 
          style="width:100%; min-height:60px; flex: none; margin:0; padding:0; background: white no-repeat center center / 60px border-box; overflow:hidden;"
          :style="{ backgroundImage: 'url(/static/loading.gif)'}">
          <img :src="wo.tt.make_server_url(section.image)" style="width: 100%;background:white" />
        </view> -->
        <!-- 在外面套一层 view 来放 loading.gif 。但不知为何，这时，图片元素的底部多出4个像素的空白边，而如果是单独的图片不套外层，就不会多出空白边。
        但换用了套壳后，仍然导致透明背景显出loading.gif。似乎只有pex-card的height:0能避免。-->
        <image v-if="section.image" :src="wo.tt.make_server_url(section.image)" mode="widthFix" :lazy-load="true"
          style="width:100%; flex: none; margin:0; padding:0; background:white url(/static/loading.gif) no-repeat center / 60px; overflow:hidden;">
        </image>
        <!-- 如果用户上传了 png 的透明背景图，则无法遮盖住底下的背景图 -->
        <video v-else-if="section.video" :src="wo.tt.make_server_url(section.video)"
          style="width: 100%; height: 0; padding-bottom: 100%" :loop="false" :autoplay="false" object-fit="contain"
          :muted="false" :controls="true" :show-mute-btn="true" :show-center-play-btn="true"
          :enable-progress-gesture="true" :show-progress="true"></video>
        <textarea v-else-if="section.text !== undefined" v-model="section.text" :maxlength="maxLengthText"
          auto-height="true" :focus="isFocused" :placeholder="textPlaceholder" :placeholder-style="wo.ss.placeholderStyle"
          class="wo-bg-color-fg wo-border-color-bg"
          style="width: inherit; min-height: 3em; line-height: 1.5em; padding: 5px; border-width: 1px; border-style: solid; word-break: break-word"
          :style="styleTextarea"></textarea>

        <template v-if="allowImage || allowVideo || allowText || maxLength !== 1">
          <!-- <part-dev>luk: 没有任何添加按钮,并且最大长度为1时,不需要删除按钮</part-dev> -->
          <uni-icons type="clear" size="30" color="var(--grey-9)"
            style="position: absolute; top: -5px; right: -10px; border-radius: 100%; cursor: pointer"
            @click="deleteSection(index)"></uni-icons>
        </template>
      </view>

      <!-- #ifdef WEB -->
      <!-- </draggable> -->
      <!-- #endif -->
    </view>

    <view
      style="width: 100%; display: flex; flex-flow: column nowrap; align-items: flex-start; padding: 5px 5px 0 5px; box-sizing: border-box">
      <view style="display: flex; flex-flow: row wrap; justify-content: space-between; align-items: center; width: 100%;">
        <view class="wo-flex" style="flex-flow: row wrap;margin-bottom: 5px;font-size:12px; color:black">
          <view @click="addSection({ type: 'text' })" v-if="Boolean(allowText)" 
            class="wo-button border-radius-20px wo-bg-color-grey-e wo-border-color-transparent"
            :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
            style="margin-left: 0; white-space: nowrap; flex: none">
            <uni-icons v-if="!noIcon" type="compose" color="unset" size="20"></uni-icons>
            <text v-if="!noLabel">{{ wo.ll({ zhCN: '文字', enUS: 'Text' }) }}</text>
          </view>
          <view @click="addSection({ type: 'image' })" v-if="Boolean(allowImage)"
            class="wo-button border-radius-20px wo-bg-color-grey-e wo-border-color-transparent"
            :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
            style="margin-left: 0; white-space: nowrap; flex: none">
            <uni-icons v-if="!noIcon" type="camera" color="unset" size="20"></uni-icons>
            <text v-if="!noLabel">{{ wo.ll({ zhCN: '图片', enUS: 'Image' }) }}</text>
          </view>
          <view @click="addSection({ type: 'video' })" v-if="Boolean(allowVideo)"
            class="wo-button border-radius-20px wo-bg-color-grey-e wo-border-color-transparent"
            :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
            style="margin-left: 0; white-space: nowrap; flex: none">
            <uni-icons v-if="!noIcon" type="videocam" color="unset" size="20"></uni-icons>
            <text v-if="!noLabel">{{ wo.ll({ zhCN: '视频', enUS: 'Video' }) }}</text>
          </view>
        </view>

        <button v-if="onPublish" size="mini" @click="onPublish" :disabled="storyEmpty || publishing"
          :loading="publishing" plain class="wo-bg-color-main wo-text-color-white"
          :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
          style="height:32px; line-height:32px; border-radius:5px;margin: 0 0 5px auto; border: 0 solid transparent; white-space: nowrap; flex: none;"
          :style="{opacity: storyEmpty?0:1,pointerEvents:storyEmpty?'none':'auto'}">
          <uni-icons v-if="!publishing" size="18" type="paperplane-filled" color="unset"></uni-icons>
          <!-- <text>{{ wo.ll({ zhCN: '发 表', enUS: 'Publish' }) }}</text> -->
        </button>
      </view>

      <view style="width: 100%; padding: 0 5px 5px; box-sizing: border-box; font-size:12px"
        class="wo-text-color-red-dark">
        {{ wo.ll(myFeedback) }}
      </view>

    </view>
  </view>
</template>

<style lang="scss" scoped>
uni-button {
  margin: 0 5px;

  uni-text.uni-icons {
    margin-right: 2px;
  }
}

.border-radius-20px {
  border-radius: 20px;
}

.wo-button {
  padding: 5px 10px;
  margin-right: 15px;
}
</style>
