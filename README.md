# 文本压缩 CompressText

文本压缩使用 Leafer UI 开发。

## 在线演示

[在线演示](https://kooriookami.github.io/leafer-compress-text/)

## 流程图
![process](https://github.com/kooriookami/leafer-compress-text/raw/master/process.png)

## 使用说明

```npm i leafer-compress-text```

```js
  import { Leafer } from 'leafer-ui';
  import { CompressText } from 'leafer-compress-text';

  leafer = new Leafer({
    ... // 参数见 https://leaferjs.com/
  });

  const compressText = new CompressText({
    ... // 参数见 src/compress-text/compress-text.js => this.defaultData
  });
  leafer.add(compressText);
```

## 示例代码

[示例代码](src/components/CompressText.vue)
