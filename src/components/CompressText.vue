<template>
  <div class="compress-text-container">
    <div class="page-main">
      <el-scrollbar>
        <div id="leafer" class="leafer" />
      </el-scrollbar>
    </div>
    <div class="page-form">
      <el-scrollbar>
        <div class="page-form-container">
          <div class="form-header">
            <div class="form-title">
              <span>文本压缩 - Compress Text</span>
            </div>
            <div class="form-description">
              <span>一个使用 LeaferJS 作为 Canvas 渲染引擎的文本压缩工具。</span>
            </div>
          </div>

          <div class="form-main">
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
                <el-input
                  v-model="form.text"
                  type="textarea"
                  :autosize="{minRows: 3}"
                  placeholder="请输入文本"
                />
              </el-form-item>
            </el-form>
            <el-form-item label="颜色">
              <el-color-picker v-model="form.color" />
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
            <el-form-item label="字重">
              <el-slider
                v-model="form.descriptionWeight"
                :min="0"
                :max="1"
                :step="0.1"
              />
            </el-form-item>
            <el-form-item label="缩放">
              <el-slider
                v-model="form.scale"
                :min="0.5"
                :max="1.5"
                :step="0.02"
              />
            </el-form-item>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
  import { Leafer } from 'leafer-ui';
  import { CompressText } from '@/utils/compress-text';

  export default {
    name: 'CompressText',
    data() {
      return {
        fontLoading: false,
        leafer: null,
        compressText: null,
        textScale: 1,
        form: {
          width: 800,
          height: 260,
          text: '文本，是指书面语言的表现形式，从文学角度说，通常是具有完整、系统[含义(Message)]的一个句子或多个句子的组合。' +
            '一个文本可以是一个[句子(Sentence)]、一个[段落(Paragraph)]或者一个[篇章(Discourse)]。' +
            '广义“文本”：任何由书写所固定下来的任何话语。' +
            '[狭义(利科尔)]“文本”：由语言文字组成的文学实体，代指“作品”，相对于作者、世界构成一个独立、自足的系统。',
          color: '',
          align: 'justify',
          descriptionWeight: 0,
          scale: 1,
        },
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
          view: 'leafer',
          width: 1200,
          height: 800,
          type: 'user',
          wheel: {
            preventDefault: false,
          },
        });
      },
      drawText() {
        const time1 = new Date().getTime();
        this.leafer.remove(this.compressText);

        const compressText = new CompressText({
          text: this.form.text,
          width: this.form.width,
          height: this.form.height,
          fontFamily: '\'Helvetica Neue\', Helvetica, \'PingFang SC\', \'Hiragino Sans GB\', \'Microsoft YaHei\', \'微软雅黑\', Arial, sans-serif',
          fontSize: 24,
          color: this.form.color,
          lineHeight: 2,
          rtFontSize: 14,
          rtTop: -6,
          x: 20,
          y: 20,
          align: this.form.align,
          strokeWidth: this.form.descriptionWeight,
          scale: this.form.scale,
        });

        this.compressText = compressText.getCompressText();
        this.textScale = compressText.textScale;

        this.leafer.add(this.compressText);
        const time2 = new Date().getTime();
        console.log('时间', time2 - time1);
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

    .page-main {
      height: 100%;
      overflow: auto;
      flex-grow: 1;
      position: relative;

      .leafer {
        display: inline-flex;
        margin: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      }
    }

    .page-form {
      height: 100%;
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
