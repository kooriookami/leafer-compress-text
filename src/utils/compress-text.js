import FontFaceObserver from 'fontfaceobserver';
import { Group, Text } from 'leafer-ui';
import { splitBreakWord } from './split-break-word.js';

export class CompressText extends Group {
  constructor(data = {}) {
    super();
    this.baseLineHeight = 1.15; // 基础行高
    this.noCompressText = '●①②③④⑤⑥⑦⑧⑨⑩'; // 不压缩的文本
    this.parseList = []; // 解析后的文本列表
    this.newlineList = []; // 根据换行符分割的文本列表
    this.currentX = 0; // 当前行的x坐标
    this.currentY = 0; // 当前行的y坐标
    this.currentLine = 0; // 当前行数
    this.textScale = 1; // 文本缩放比例
    this.firstLineTextScale = 1; // 首行文本缩放比例
    this.group = null; // Leafer文本组
    this.tempGroup = null; // 临时组
    this.needCompressTwice = false; // 是否需要二次压缩

    this.text = data.text ?? '';
    this.fontFamily = data.fontFamily ?? 'ygo-sc, 楷体, serif';
    this.fontSize = data.fontSize ?? 24;
    this.fontWeight = data.fontWeight ?? 'normal';
    this.lineHeight = data.lineHeight ?? this.baseLineHeight;
    this.letterSpacing = data.letterSpacing ?? 0;
    this.firstLineCompress = data.firstLineCompress;
    this.textAlign = data.textAlign ?? 'justify';
    this.color = data.color ?? 'black';
    this.strokeWidth = data.strokeWidth ?? 0;
    this.gradient = data.gradient;
    this.gradientColor1 = data.gradientColor1 || '#999999';
    this.gradientColor2 = data.gradientColor2 || '#ffffff';
    this.rtFontFamily = data.rtFontFamily ?? 'ygo-tip, sans-serif';
    this.rtFontSize = data.rtFontSize ?? 13;
    this.rtFontWeight = data.rtFontWeight ?? 'bold';
    this.rtLineHeight = data.rtLineHeight ?? this.baseLineHeight;
    this.rtLetterSpacing = data.rtLetterSpacing ?? 0;
    this.rtTop = data.rtTop ?? -9;
    this.rtColor = data.rtColor ?? 'black';
    this.rtStrokeWidth = data.rtStrokeWidth ?? 0;
    this.width = data.width ?? 0;
    this.height = data.height ?? 0;
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
    this.fontScale = data.fontScale ?? 1;
    this.autoSmallSize = data.autoSmallSize;
    this.smallFontSize = data.smallFontSize ?? this.fontSize;
    this.zIndex = data.zIndex ?? 0;

    this.loadFont();
    this.compressText();
  }

  set(data) {
    let needLoadFont = false;
    let needCompressText = false;
    Object.keys(data).forEach(key => {
      if (JSON.stringify(this[key]) !== JSON.stringify(data[key])) {
        this[key] = data[key];
        if (['fontFamily', 'rtFontFamily'].includes(key)) {
          needLoadFont = true;
        }
        needCompressText = true;
      }
    });
    if (needLoadFont) {
      this.loadFont();
    }
    if (needCompressText) {
      this.compressText();
    }
  }

  loadFont() {
    const fontSet = new Set();
    this.fontFamily.split(',').forEach(value => {
      fontSet.add(value.trim());
    });
    this.rtFontFamily.split(',').forEach(value => {
      fontSet.add(value.trim());
    });

    fontSet.forEach(font => {
      const fontObserver = new FontFaceObserver(font);
      fontObserver.load().then(() => {
        this.compressText();
      }).catch(() => {
      });
    });
  }

  // 获取解析后的文本列表
  getParseList() {
    let bold = false;
    // 正则的捕获圆括号不要随意修改
    return String(this.text).trimEnd().split(/(\[.*?\(.*?\)]|<b>|<\/b>|\n)/).filter(value => value).map(value => {
      let rubyText = value;
      let rtText = '';
      if (/\[.*?\(.*?\)]/g.test(value)) {
        rubyText = value.replace(/\[(.*?)\((.*?)\)]/g, '$1');
        rtText = value.replace(/\[(.*?)\((.*?)\)]/g, '$2');
      }
      if (value === '<b>') {
        bold = true;
        return null;
      }
      if (value === '</b>') {
        bold = false;
        return null;
      }
      return {
        ruby: {
          text: rubyText,
          bold,
          charList: splitBreakWord(rubyText).map(char => ({ text: char })),
        },
        rt: {
          text: rtText,
        },
      };
    }).filter(value => value);
  }

  // 获取换行列表
  getNewlineList() {
    const list = [[]];
    let currentIndex = 0;
    this.parseList.forEach(item => {
      const ruby = item.ruby;
      list[currentIndex].push(item);
      if (ruby.text === '\n') {
        currentIndex++;
        list[currentIndex] = [];
      }
    });
    return list;
  }

  // 获取压缩文本
  compressText() {
    this.textScale = 1;
    this.firstLineTextScale = 1;
    this.needCompressTwice = false;
    this.parseList = this.getParseList();
    this.newlineList = this.getNewlineList();
    if (!this.group) {
      this.group = new Group();
      this.add(this.group);
    }
    this.group.removeAll();
    this.tempGroup = new Group({
      x: 0,
      y: 0,
    });
    this.createRuby();
    this.compressRuby();
    this.alignRuby();
    this.createRt();
    this.createGradient();
    this.group.add(this.tempGroup);
  }

  // 创建文本
  createRuby() {
    this.parseList.forEach(item => {
      const ruby = item.ruby;
      const charList = ruby.charList;
      charList.forEach(char => {
        const charLeaf = new Text({
          text: char.text,
          fontFamily: this.fontFamily,
          fontSize: this.fontSize * this.fontScale,
          fontWeight: ruby.bold ? 'bold' : this.fontWeight,
          lineHeight: this.fontSize * this.lineHeight * this.fontScale,
          fill: this.color,
          stroke: this.strokeWidth ? this.color : null,
          strokeWidth: this.strokeWidth,
          strokeAlign: 'center',
          letterSpacing: this.letterSpacing,
        });
        const bounds = charLeaf.textDrawData.bounds;
        char.charLeaf = charLeaf;
        char.originalWidth = bounds.width;
        char.originalHeight = bounds.height;
        char.width = bounds.width;
        char.height = bounds.height;
        this.tempGroup.add(charLeaf);
      });
    });
    this.updateTextScale();
  }

  // 压缩文本
  compressRuby() {
    if (this.firstLineCompress && this.width) {
      // 首行压缩
      const firstNewlineCharList = this.newlineList[0].map(item => item.ruby.charList).flat();
      let firstNewlineTotalWidth = 0;
      let maxWidth = this.width;
      firstNewlineCharList.forEach(char => {
        const paddingLeft = char.paddingLeft || 0;
        const paddingRight = char.paddingRight || 0;
        firstNewlineTotalWidth += char.originalWidth;
        maxWidth -= paddingLeft + paddingRight;
      });
      this.firstLineTextScale = Math.min(Math.floor(maxWidth / firstNewlineTotalWidth * 1000) / 1000, 1);
      this.updateTextScale();
    }
    const charList = this.parseList.map(item => item.ruby.charList).flat();
    const lastChar = charList[charList.length - 1];
    if (this.height && lastChar && this.currentY + lastChar.height > this.height) {
      // 用二分法获取最大的scale，精度0.01
      let scale = 0.5;
      let start = 0;
      let end = this.textScale;
      while (scale > 0) {
        scale = (start + end) / 2;
        this.textScale = scale;
        this.updateTextScale();
        this.currentY + lastChar.height > this.height ? end = scale : start = scale;
        if (this.currentY + lastChar.height <= this.height && end - start <= 0.01) {
          // 如果是autoSmallSize，字体判断缩小，当字号大于1不执行
          if (this.autoSmallSize && scale < 0.7 && this.fontScale <= 1 && !this.isSmallSize) {
            this.isSmallSize = true;
            this.updateFontSize();
          }
          break;
        }
      }
    }
  }

  // 对齐ruby
  alignRuby() {
    const charList = this.parseList.map(item => item.ruby.charList).flat();
    const alignLine = this.textScale < 1 || ['center', 'right'].includes(this.textAlign) ? this.currentLine + 1 : this.currentLine;
    for (let line = 0; line < alignLine; line++) {
      const lineList = charList.filter(item => item.line === line);
      if (lineList.length) {
        const lastChar = lineList[lineList.length - 1];
        const lastCharLeaf = lastChar.charLeaf;
        const lastPaddingRight = lastChar.paddingRight || 0;
        const remainWidth = this.width - lastCharLeaf.x - lastChar.width - lastPaddingRight;
        if (remainWidth > 0) {
          if (this.textAlign === 'center') {
            const offset = remainWidth / 2;
            lineList.forEach(char => {
              const charLeaf = char.charLeaf;
              charLeaf.x += offset;
            });
          } else if (this.textAlign === 'right') {
            const offset = remainWidth;
            lineList.forEach(char => {
              const charLeaf = char.charLeaf;
              charLeaf.x += offset;
            });
          } else if (this.textAlign === 'justify') {
            if (lineList.length > 1 && lastChar.text !== '\n') {
              const gap = remainWidth / (lineList.length - 1);
              lineList.forEach((char, index) => {
                const charLeaf = char.charLeaf;
                charLeaf.x += index * gap;
              });
            }
          }
        }
      }
    }
  }

  // 创建注音
  createRt() {
    this.parseList.forEach(item => {
      const rt = item.rt;
      if (rt.text) {
        const rtLeaf = new Text({
          text: rt.text,
          fontFamily: this.rtFontFamily,
          fontSize: this.rtFontSize * this.fontScale,
          fontWeight: this.rtFontWeight,
          lineHeight: this.rtFontSize * this.rtLineHeight * this.fontScale,
          fill: this.rtColor,
          stroke: this.rtStrokeWidth ? this.color : null,
          strokeWidth: this.rtStrokeWidth,
          strokeAlign: 'center',
          letterSpacing: this.rtLetterSpacing,
        });
        const bounds = rtLeaf.textDrawData.bounds;
        rt.rtLeaf = rtLeaf;
        rt.originalWidth = bounds.width;
        rt.originalHeight = bounds.height;
        rt.width = bounds.width;
        rt.height = bounds.height;
        this.positionRt(item);
        this.tempGroup.add(rtLeaf);
      }
    });
    // 如果需要再次压缩
    if (this.needCompressTwice) {
      this.updateTextScale();
      this.compressRuby();
      this.alignRuby();
      this.parseList.forEach(item => {
        this.positionRt(item);
      });
    }
  }

  // 更新文本压缩
  updateTextScale() {
    this.currentX = 0;
    this.currentY = 0;
    this.currentLine = 0;

    let noBreakCharList = [];
    let noBreakTotalWidth = 0;

    this.newlineList.forEach((newline, newlineIndex) => {
      const lastNewline = newlineIndex === this.newlineList.length - 1;
      newline.forEach(item => {
        const ruby = item.ruby;
        const rt = item.rt;
        const charList = ruby.charList;
        charList.forEach(char => {
          const charLeaf = char.charLeaf;
          const paddingLeft = char.paddingLeft || 0;
          const paddingRight = char.paddingRight || 0;
          if (this.firstLineCompress && newlineIndex === 0) {
            // 首行压缩到一行
            charLeaf.scaleX = this.firstLineTextScale;
            char.width = char.originalWidth * this.firstLineTextScale;
          } else if (!this.noCompressText.includes(char.text) && lastNewline) {
            charLeaf.scaleX = this.textScale;
            char.width = char.originalWidth * this.textScale;
          }
          if (rt.text) {
            noBreakCharList.push(char);
            noBreakTotalWidth += char.width + paddingLeft + paddingRight;
          } else {
            const totalWidth = char.width + paddingLeft + paddingRight;
            if (this.width && totalWidth < this.width && this.currentX + totalWidth > this.width) {
              this.addRow();
            }
            this.positionChar(char);
            if (char.text === '\n') {
              this.addRow();
            }
          }
        });

        if (noBreakCharList.length) {
          if (this.width && noBreakTotalWidth < this.width && this.currentX + noBreakTotalWidth > this.width) {
            this.addRow();
          }
          noBreakCharList.forEach(char => {
            this.positionChar(char);
          });

          noBreakCharList = [];
          noBreakTotalWidth = 0;
        }
      });
    });
  }

  // 更新文本大小
  updateFontSize() {
    this.textScale = 1;
    const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
    const sizePercent = fontSize / this.fontSize;
    const charList = this.parseList.map(item => item.ruby.charList).flat();
    charList.forEach(char => {
      const charLeaf = char.charLeaf;
      charLeaf.fontSize = fontSize * this.fontScale;
      charLeaf.lineHeight = fontSize * this.lineHeight * this.fontScale;
      char.originalWidth *= sizePercent;
      char.originalHeight *= sizePercent;
      char.width *= sizePercent;
      char.height *= sizePercent;
    });
    this.updateTextScale();
  }

  // 定位Char
  positionChar(char) {
    const paddingLeft = char.paddingLeft || 0;
    const paddingRight = char.paddingRight || 0;
    const charLeaf = char.charLeaf;
    charLeaf.x = this.currentX + paddingLeft;
    charLeaf.y = this.currentY;
    this.currentX += char.width + paddingLeft + paddingRight;
    char.line = this.currentLine;
  }

  // 添加行
  addRow() {
    const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
    this.currentX = 0;
    this.currentY += fontSize * this.lineHeight * this.fontScale;
    this.currentLine++;
  }

  // 定位rt
  positionRt(item) {
    const ruby = item.ruby;
    const rt = item.rt;
    const rtLeaf = rt.rtLeaf;
    if (rtLeaf) {
      const firstChar = ruby.charList[0];
      const lastChar = ruby.charList[ruby.charList.length - 1];
      const firstCharLeaf = firstChar.charLeaf;
      const lastCharLeaf = lastChar.charLeaf;
      const firstPaddingLeft = firstChar.paddingLeft || 0;
      const lastPaddingRight = lastChar.paddingRight || 0;
      const rubyWidth = lastCharLeaf.x - firstCharLeaf.x + lastChar.width + firstPaddingLeft + lastPaddingRight;

      rtLeaf.y = firstCharLeaf.y + this.rtTop * this.fontScale;

      if (rt.width / rubyWidth < 0.95 && ruby.text.length > 1) {
        // 拉伸两端对齐
        const maxLetterSpacing = this.rtFontSize * this.fontScale * 3;
        const newLetterSpacing = (rubyWidth * 0.95 - rt.width) / (rt.text.length - 1);
        rtLeaf.letterSpacing = Math.min(newLetterSpacing, maxLetterSpacing);
        rt.width = rt.originalWidth + rtLeaf.letterSpacing * (rt.text.length - 1);
        rtLeaf.x = firstCharLeaf.x + (rubyWidth - rt.width) / 2;
      } else if (rt.width > rubyWidth) {
        // 压缩
        if (rubyWidth / rt.width < 0.6) {
          // 防止过度压缩，加宽ruby
          // 公式：(rubyWidth + widen) / rtWidth = 0.6
          const widen = 0.6 * rt.width - rubyWidth;
          rtLeaf.scaleX = 0.6;
          firstChar.paddingLeft = widen / 2;
          lastChar.paddingRight = widen / 2;
          rt.width = rt.originalWidth + widen;
          rtLeaf.x = firstCharLeaf.x - firstPaddingLeft;
          this.needCompressTwice = true;
        } else {
          rtLeaf.scaleX = rubyWidth / rt.width;
          rt.width = rt.originalWidth;
          rtLeaf.x = firstCharLeaf.x;
        }
      } else {
        rt.width = rt.originalWidth;
        rtLeaf.x = firstCharLeaf.x + (rubyWidth - rt.width) / 2;
      }
    }
  }

  // 创建渐变
  createGradient() {
    if (this.gradient) {
      const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
      this.parseList.forEach(item => {
        const ruby = item.ruby;
        const charList = ruby.charList;
        charList.forEach(char => {
          const charLeaf = char.charLeaf;
          charLeaf.set({
            fill: {
              type: 'linear',
              stops: [
                { offset: 0, color: this.gradientColor1 },
                { offset: 0.4, color: this.gradientColor2 },
                { offset: 0.55, color: this.gradientColor2 },
                { offset: 0.6, color: this.gradientColor1 },
                { offset: 0.75, color: this.gradientColor2 },
              ],
            },
            stroke: 'rgba(0, 0, 0, 0.6)',
            strokeWidth: fontSize * 0.025 * this.fontScale,
            strokeAlign: 'outside',
            shadow: {
              blur: fontSize * 0.025 * this.fontScale,
              x: fontSize * 0.025 * this.fontScale,
              y: fontSize * 0.045 * this.fontScale,
              color: 'rgba(0, 0, 0, 0.6)',
            },
          });
        });
      });
    }
  }
}
