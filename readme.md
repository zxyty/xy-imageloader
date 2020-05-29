### 使用方式
* 普通加载
```tsx
imgLoader("./lena.png").then(image => {
  ...
})
```

* 普通加载, ImageData
```tsx
getImageData("./lena.png").then(imageData => {
  ...
})
```

* 模板匹配示例
```tsx
import imgLoader, { getImageData, rgbToGary } from 'xy-imageloader';
import rgbToGary from 'xy-imageloader/lib/color';
import { getTemplatePos } from 'xy-imageloader/lib/util';

Promise.all([imgLoader("./lena.png"), imgLoader("./search.png")]).then(
  (values: any) => {
    Promise.all([getImageData(values[0]), getImageData(values[1])]).then(
      (dataValues: any) => {
        const model = rgbToGary(dataValues[0]);
        const search = rgbToGary(dataValues[1]);
        const posi = getTemplatePos(
          model,
          search,
          dataValues[0].width,
          dataValues[0].height,
          dataValues[1].width,
          dataValues[1].height,
          "CV_TM_CCOEFF_NORMED"
        );
        const canvas = document.createElement("canvas");
        canvas.width = dataValues[0].width;
        canvas.height = dataValues[0].height;
        const ctx = canvas.getContext("2d");

        ctx?.drawImage(values[0], 0, 0);
        ctx.strokeStyle = "red";
        ctx?.strokeRect(
          posi.x,
          posi.y,
          dataValues[1].width,
          dataValues[1].height
        );
        document.body.appendChild(canvas);
      }
    );
  }
);
```


* 比对图片
```tsx
async componentDidMount() {
  const canvas1 = await loadCanvas('./11.png');
  const ctx1 = canvas1.getContext('2d');
  const imageData1 = ctx1!.getImageData(0, 0, canvas1.width, canvas1.height);
  const rgb1 = getRGBColor(imageData1);
  const gray1 = rgbToGary(rgb1);
  const threshold1 = OtsuAlgorithm(gray1);
  const [newImageData1] = convertBinarization(imageData1, threshold1, true);
  document.body.appendChild(canvas1);

  const canvas2 = await loadCanvas('./22.png');
  const ctx2 = canvas2.getContext('2d');
  const imageData2 = ctx2!.getImageData(0, 0, canvas2.width, canvas2.height);
  const rgb2 = getRGBColor(imageData2);
  const gray2 = rgbToGary(rgb2);
  const threshold2 = OtsuAlgorithm(gray2);
  const [newImageData2, cropedOffsetX, cropedOffsetY] = convertBinarization(
    imageData2,
    threshold2,
    true,
  );
  document.body.appendChild(canvas2);

  const gutter = 100; // 定义合并不同点间隔大小
  const difference = compareImage(newImageData1, newImageData2, gutter);
  difference.forEach(d => {
    canvas2.getContext('2d')!.strokeStyle = 'red';
    canvas2
      .getContext('2d')!
      .strokeRect(d.x + cropedOffsetX, d.y + cropedOffsetY, d.w, d.h);
  });
}
```

* 图片边缘扩展
```tsx
// 可以扩展边缘为 空缺（黑） | 边缘复制 | 边缘镜像
getImageData("./lena.png").then(data => {
  const newImageData = borderExpand(data, "BORDER_REPLICATE", 33);

  const canvas = document.createElement("canvas");
  canvas.width = newImageData.width;
  canvas.height = newImageData.height;
  const ctx = canvas.getContext("2d");

  ctx.putImageData(newImageData, 0, 0);

  document.body.insertBefore(canvas, document.body.children[0]);
});
```

* Sobel算子提取图像边缘
```tsx
import imageLoader, { getImageData } from 'xy-imageloader';
import { convertSobel } from 'xy-imageloader/lib/filter';

imageLoader('./122.png').then(async res => {
  const imageData = await getImageData(res);
  const data = convertSobel(imageData);

  const canvas = document.createElement('canvas');
  canvas.width = data.width;
  canvas.height = data.height;
  const ctx = canvas.getContext('2d');
  ctx?.putImageData(data, 0, 0);

  document.body.appendChild(canvas);
});
```

