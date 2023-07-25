import { Group, Text } from 'leafer-ui';
import { splitBreakWord } from './split-break-word.js';

export class CompressText {
  constructor(data) {
    this.baseLineHeight = 1.15; // 基础行高
    this.noCompressText = '●①②③④⑤⑥⑦⑧⑨⑩'; // 不压缩的文本
    this.parseList = []; // 解析后的文本列表
    this.currentX = 0; // 当前行的x坐标
    this.currentY = 0; // 当前行的y坐标
    this.currentLine = 0; // 当前行数
    this.textScale = 1; // 文本缩放比例
    this.group = null; // Leafer文本组
    this.needCompressTwice = false; // 是否需要二次压缩

    this.text = data.text || '';
    this.fontFamily = data.fontFamily || 'ygo-sc, 楷体, serif';
    this.fontSize = data.fontSize || 12;
    this.lineHeight = data.lineHeight || this.baseLineHeight;
    this.letterSpacing = data.letterSpacing || 0;
    this.align = data.align || 'justify';
    this.color = data.color || 'black';
    this.strokeWidth = data.strokeWidth || 0;
    this.gradient = data.gradient;
    this.gradientColor1 = data.gradientColor1;
    this.gradientColor2 = data.gradientColor2;
    this.rtFontFamily = data.rtFontFamily || 'ygo-tip, sans-serif';
    this.rtFontSize = data.rtFontSize || 13;
    this.rtLineHeight = data.rtLineHeight || this.baseLineHeight;
    this.rtLetterSpacing = data.rtLetterSpacing || 0;
    this.rtTop = data.rtTop || -9;
    this.rtColor = data.rtColor || 'black';
    this.width = data.width || 0;
    this.height = data.height || 0;
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.scale = data.scale || 1;
    this.autoSmallSize = data.autoSmallSize;
    this.smallFontSize = data.smallFontSize || this.fontSize;
    this.zIndex = data.zIndex || 0;
  }

  // 获取解析后的文本列表
  getParseList() {
    let bold = false;
    return this.text.trimEnd().replace(new RegExp(`\\[(.*?)\\((.*?)\\)]|<b>|</b>`, 'g'), s => `|${s}|`)
      .split('|').filter(value => value).map(value => {
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

  // 获取压缩文本
  getCompressText() {
    this.parseList = this.getParseList(this.text);
    this.group = new Group({
      x: this.x,
      y: this.y,
      zIndex: this.zIndex,
    });
    this.createRuby();
    this.compressRuby();
    this.alignRuby();
    this.compressRt();
    return this.group;
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
          fontSize: this.fontSize * this.scale,
          fontWeight: ruby.bold ? 'bold' : 'normal',
          lineHeight: this.fontSize * this.lineHeight * this.scale,
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
        this.group.add(charLeaf);
      });
    });
    this.updateTextScale();
  }

  // 压缩文本
  compressRuby() {
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
          // 如果是autoSmallSize，灵摆和效果栏字体判断缩小，当字号大于1不执行
          if (this.autoSmallSize && scale < 0.7 && this.scale <= 1 && !this.isSmallSize) {
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
    const alignLine = this.textScale < 1 || ['center', 'right'].includes(this.align) ? this.currentLine + 1 : this.currentLine;
    for (let line = 0; line < alignLine; line++) {
      const lineList = charList.filter(item => item.line === line);
      if (lineList.length) {
        const lastChar = lineList[lineList.length - 1];
        const lastCharLeaf = lastChar.charLeaf;
        const lastPaddingRight = lastChar.paddingRight || 0;
        const remainWidth = this.width - lastCharLeaf.x - lastChar.width - this.letterSpacing - lastPaddingRight;
        if (remainWidth > 0) {
          if (this.align === 'center') {
            const offset = remainWidth / 2;
            lineList.forEach((char, index) => {
              const charLeaf = char.charLeaf;
              charLeaf.x += offset;
            });
          } else if (this.align === 'right') {
            const offset = remainWidth;
            lineList.forEach((char, index) => {
              const charLeaf = char.charLeaf;
              charLeaf.x += offset;
            });
          } else if (this.align === 'justify') {
            if (lineList.length > 1) {
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

  // 压缩注音
  compressRt() {
    this.parseList.forEach(item => {
      const rt = item.rt;
      if (rt.text) {
        const rtLeaf = new Text({
          text: rt.text,
          fontFamily: this.rtFontFamily,
          fontSize: this.rtFontSize * this.scale,
          fontWeight: 'bold',
          lineHeight: this.rtFontSize * this.rtLineHeight * this.scale,
          fill: this.rtColor,
          letterSpacing: this.rtLetterSpacing,
        });
        const bounds = rtLeaf.textDrawData.bounds;
        rt.rtLeaf = rtLeaf;
        rt.originalWidth = bounds.width;
        rt.originalHeight = bounds.height;
        rt.width = bounds.width;
        rt.height = bounds.height;
        this.positionRt(item);
        this.group.add(rtLeaf);
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

    this.parseList.forEach(item => {
      const ruby = item.ruby;
      const rt = item.rt;
      const charList = ruby.charList;
      charList.forEach(char => {
        const charLeaf = char.charLeaf;
        const paddingLeft = char.paddingLeft || 0;
        const paddingRight = char.paddingRight || 0;
        if (!this.noCompressText.includes(char.text)) {
          charLeaf.scaleX = this.textScale;
          char.width = char.originalWidth * this.textScale;
        }
        if (rt.text) {
          noBreakCharList.push(char);
          noBreakTotalWidth += char.width + this.letterSpacing + paddingLeft + paddingRight;
        } else {
          const totalWidth = char.width + this.letterSpacing + paddingLeft + paddingRight;
          if (this.width && totalWidth < this.width && this.currentX + totalWidth > this.width) {
            this.addRow();
          }
          this.positionChar(char);
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
  }

  // 更新文本大小
  updateFontSize() {
    this.textScale = 1;
    const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
    const sizePercent = fontSize / this.fontSize;
    const charList = this.parseList.map(item => item.ruby.charList).flat();
    charList.forEach(char => {
      const charLeaf = char.charLeaf;
      charLeaf.fontSize = fontSize * this.scale;
      charLeaf.lineHeight = fontSize * this.lineHeight * this.scale;
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
    this.currentX += char.width + this.letterSpacing + paddingLeft + paddingRight;
    char.line = this.currentLine;
  }

  // 添加行
  addRow() {
    const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
    this.currentX = 0;
    this.currentY += fontSize * this.lineHeight * this.scale;
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

      rtLeaf.y = firstCharLeaf.y + this.rtTop * this.scale;

      if (rt.width / rubyWidth < 0.95 && ruby.text.length > 1) {
        // 拉伸两端对齐
        const maxLetterSpacing = this.rtFontSize * this.scale * 3;
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
          if (!this.needCompressTwice) {
            firstChar.paddingLeft = widen / 2;
            lastChar.paddingRight = widen / 2;
          }
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
}
