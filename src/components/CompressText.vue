<template>
  <div class="compress-text-container">
    <div class="compress-text">
      <div ref="leafer" class="leafer" />
    </div>
    <div class="form">
      <div class="form-header">
        <div class="form-title">
          <span>文本压缩 - Compress Text</span>
          <Icon
            class="github-icon"
            icon="ri:github-fill"
            width="24"
            height="24"
            @click="toGithub"
          />
        </div>
        <div class="form-description">
          <span>一个使用 LeaferJS 作为 Canvas 渲染引擎的文本压缩示例</span>
        </div>
      </div>

      <div class="form-main">
        <p v-if="form.firstLineCompress">首行文本压缩率：{{ firstLineTextScale }}</p>
        <p>当前文本压缩率：{{ textScale }}</p>
        <el-form-item label="宽度">
          <el-input-number
            v-model="form.width"
            :min="0"
            :max="2000"
            :precision="0"
          />
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number
            v-model="form.height"
            :min="0"
            :max="2000"
            :precision="0"
          />
        </el-form-item>
        <el-form :model="form" label-width="auto">
          <el-form-item label="文本">
            <el-switch v-model="form.firstLineCompress" active-text="首行压缩" />
            <el-input
              v-model="form.text"
              style="margin-top: 10px"
              type="textarea"
              :autosize="{minRows: 3}"
              placeholder="请输入文本"
            />
          </el-form-item>
        </el-form>
        <el-form-item label="颜色">
          <el-switch v-model="form.gradient" active-text="渐变色" />
          <div v-if="form.gradient" style="width: 100%; margin-top: 10px">
            <el-row :gutter="gutter">
              <el-col :span="8">
                <el-space :size="10" wrap>
                  <el-color-picker v-model="form.gradientColor1" @change="changeGradientColor" />
                  <el-color-picker v-model="form.gradientColor2" @change="changeGradientColor" />
                </el-space>
              </el-col>
              <el-col :span="16">
                <el-form-item style="margin-bottom: 0" label="预设">
                  <el-select
                    v-model="form.gradientPreset"
                    placeholder="请选择预设"
                    clearable
                    @change="changeGradientPreset"
                  >
                    <el-option v-for="item in gradientList" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-else style="width: 100%;margin-top: 10px">
            <el-color-picker v-model="form.color" />
          </div>
        </el-form-item>
        <el-form-item label="对齐">
          <el-radio-group v-model="form.align">
            <el-radio-button label="left">
              左
            </el-radio-button>
            <el-radio-button label="center">
              中
            </el-radio-button>
            <el-radio-button label="right">
              右
            </el-radio-button>
            <el-radio-button label="justify">
              两端
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描边">
          <el-slider
            v-model="form.strokeWidth"
            :min="0"
            :max="1"
            :step="0.1"
          />
        </el-form-item>
        <el-form-item label="缩放">
          <el-slider
            v-model="form.fontScale"
            :min="0.5"
            :max="1.5"
            :step="0.02"
          />
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script>
  import { Leafer } from 'leafer-ui';
  import { CompressText } from '@/utils/compress-text';
  import { Icon } from '@iconify/vue';

  let compressText = null;

  export default {
    name: 'CompressText',
    components: {
      Icon,
    },
    data() {
      return {
        gutter: 10,
        fontLoading: false,
        leafer: null,
        firstLineTextScale: 1,
        textScale: 1,
        form: {
          width: 800,
          height: 260,
          text: '<b>文本，</b>是指书面语言的表现形式，从文学角度说，通常是具有完整、系统[含义(Message)]的一个句子或多个句子的组合。' +
            '一个文本可以是一个[句子(Sentence)]、一个[段落(Paragraph)]或者一个[篇章(Discourse)]。' +
            '<b>广义“文本”：</b>任何由书写所固定下来的任何话语。' +
            '<b>[狭义(利科尔)]“文本”：</b>由语言文字组成的文学实体，代指“作品”，相对于作者、世界构成一个独立、自足的系统。',
          firstLineCompress: false,
          color: '#000000',
          align: 'justify',
          gradient: false,
          gradientColor1: '#999999',
          gradientColor2: '#ffffff',
          gradientPreset: 'silver',
          strokeWidth: 0,
          fontScale: 1,
        },
        gradientList: [
          { label: '银字', value: 'silver', color1: '#999999', color2: '#ffffff' },
          { label: '金字', value: 'gold', color1: '#cc9900', color2: '#ffff00' },
          { label: '红字', value: 'red', color1: '#990000', color2: '#ff0000' },
          { label: '白字', value: 'white', color1: '#ffffff', color2: '#ffffff' },
          { label: '黑字', value: 'black', color1: '#333333', color2: '#999999' },
          { label: '蓝字', value: 'blue', color1: '#009999', color2: '#00ffff' },
          { label: '绿字', value: 'green', color1: '#009900', color2: '#00ff00' },
        ],
      };
    },
    mounted() {
      document.fonts.onloading = () => {
        this.fontLoading = true;
      };
      document.fonts.onloadingdone = () => {
        this.fontLoading = false;
      };
      document.fonts.onloadingerror = () => {
        this.fontLoading = false;
      };
      this.initLeafer();
      this.drawText();
    },
    methods: {
      initLeafer() {
        this.leafer = new Leafer({
          view: this.$refs.leafer,
          width: 1200,
          height: 800,
          type: 'user',
          wheel: {
            preventDefault: false,
          },
        });
      },
      drawText() {
        // 如果此处用this.compressText绑定，vue会进行proxy代理，导致性能下降严重
        if (!compressText) {
          compressText = new CompressText();
          this.leafer.add(compressText.group);
        }
        compressText.set({
          text: this.form.text,
          width: this.form.width,
          height: this.form.height,
          fontFamily: '\'Helvetica Neue\', Helvetica, \'PingFang SC\', \'Hiragino Sans GB\', \'Microsoft YaHei\', \'微软雅黑\', Arial, sans-serif',
          fontSize: 24,
          color: this.form.color,
          lineHeight: 2,
          rtFontSize: 14,
          rtColor: this.form.color,
          rtTop: -6,
          x: 20,
          y: 20,
          firstLineCompress: this.form.firstLineCompress,
          align: this.form.align,
          gradient: this.form.gradient,
          gradientColor1: this.form.gradientColor1,
          gradientColor2: this.form.gradientColor2,
          strokeWidth: this.form.strokeWidth,
          fontScale: this.form.fontScale,
          // autoSmallSize: true,
          // smallFontSize: 18,
        });

        this.firstLineTextScale = compressText.firstLineTextScale;
        this.textScale = compressText.textScale;
      },
      changeGradientColor() {
        this.form.gradientPreset = '';
      },
      changeGradientPreset(value) {
        const gradient = this.gradientList.find(item => item.value === value);
        if (gradient) {
          this.form.gradientColor1 = gradient.color1;
          this.form.gradientColor2 = gradient.color2;
        }
      },
      toGithub() {
        open('https://github.com/kooriookami/compress-text');
      },
    },
    watch: {
      fontLoading() {
        if (!this.fontLoading) {
          this.drawText();
        }
      },
      form: {
        handler() {
          this.drawText();
        },
        deep: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .compress-text-container {
    height: 100vh;
    display: flex;
    overflow: hidden;

    .compress-text {
      height: 100%;
      overflow: auto;
      flex-grow: 1;
      position: relative;
      padding: 20px;

      .leafer {
        display: inline-flex;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      }
    }

    .form {
      height: 100%;
      overflow: auto;
      width: 400px;
      flex-shrink: 0;
      border-left: 1px solid var(--border-color);

      .form-header {
        padding: 30px 20px;
        font-size: 18px;
        font-weight: bold;
        border-bottom: 1px solid var(--border-color);

        .form-title {
          display: flex;
          flex-wrap: wrap;
          align-items: center;

          .github-icon {
            margin-left: 5px;
            cursor: pointer;
          }
        }

        .form-description {
          margin-top: 20px;
          font-size: 12px;
          font-weight: normal;
          color: var(--info-color);
        }
      }

      .form-main {
        padding: 20px;

        ::v-deep(.el-form) {
          .el-form-item {
            .tip {
              margin-left: 10px;
              color: var(--normal-color);
            }
          }
        }
      }
    }
  }
</style>
