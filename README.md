# 文本压缩 CompressText

文本压缩使用 Leafer UI 开发。

## 在线演示

[在线演示](https://kooriookami.github.io/compress-text/)

## 流程图
![process](process.png)

## 使用说明

```npm i leafer-compress-text```

```js
  import { Leafer } from 'leafer-ui';
  import { CompressText } from 'leafer-compress-text';

  leafer = new Leafer({
    ...
  });

  const compressText = new CompressText({
    ...
  });
  leafer.add(compressText);
```

## 示例代码

[示例代码](src/components/CompressText.vue)
