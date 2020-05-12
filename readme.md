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

### API
* index.ts
```ts
declare const imgLoader: (src: string) => Promise<HTMLImageElement>;
/**
 * image加载canvas
 * @param source string | HTMLImageElement
 * @param compressWidth 是否压缩 n * n
 */
export declare const loadCanvas: (source: string | HTMLImageElement, compressWidth?: number | undefined) => Promise<HTMLCanvasElement>;
export declare const getImageData: (source: string | HTMLImageElement | HTMLCanvasElement) => Promise<unknown>;
export declare const getRGBColor: (imageData: ImageData) => number[][];
export declare const rgbToGary: (rgb: ImageData | number[][]) => number[];
/**
 * 大津法取阈值
 * @param src 灰度值[x1,x2,x3,...]
 */
export declare const OtsuAlgorithm: (src?: number[]) => number;
/**
 * 转换为二值图像
 * @param imageData ImageData 图像数据
 * @param threshold number 阈值 默认125
 * @param cropBoundary boolean 是否去除边界无效区
 * @returns 返回 imageData | [imageData, <offsetX>, <offsetY>]
 */
export declare const convertBinarization: (imageData: ImageData, threshold?: number, cropBoundary?: boolean) => (number | ImageData)[];
/**
 * 转换为中值滤波图像
 * @param imageData ImageData 图像数据
 * @param size 滤波大小 默认3 需大于等于3的奇数
 * @param count 迭代次数
 */
export declare const convertMedian: (imageData: ImageData, size?: number, count?: number) => ImageData;
/**
 * 转换为均值滤波图像
 * @param imageData ImageData 图像数据
 * @param size 滤波大小 默认3 需大于等于3的奇数
 * @param count 迭代次数
 */
export declare const convertAverage: (imageData: ImageData, size?: number, count?: number) => ImageData;
export default imgLoader;
```

* lib/util.ts
```ts
/**
 * cv 模板匹配搜索位置
 * @param template 匹配的图片灰度值[x,x,x,...] w * h 长度的灰度图片数据
 * @param search 搜索的图片灰度值[x,x,x,...] w * h 长度的灰度图片数据
 * @param tWidth 匹配图片的width
 * @param tHeight 匹配图片的height
 * @param sWidth 搜索图片的width
 * @param sHeight 搜索图片的height
 * @param type 匹配方式
 */
export declare const getTemplatePos: (template: any, search: any, tWidth: any, tHeight: any, sWidth: any, sHeight: any, type?: "CV_TM_SQDIFF" | "CV_TM_SQDIFF_NORMED" | "CV_TM_CCORR" | "CV_TM_CCORR_NORMED" | "CV_TM_CCOEFF" | "CV_TM_CCOEFF_NORMED" | undefined) => {
    x: number;
    y: number;
};
/**
 * 比较两幅图片得到 不同处的坐标
 * @param source1 ImageData
 * @param source2 ImageData
 */
export declare const compareImage: (source1: ImageData, source2: ImageData) => any;
```

* libg/morphology.js
```ts
/**
 * 膨胀
 * @param imageData ImageData
 * @param size default 3 表示 3 * 3的mat, 请传大于1的奇数
 */
export declare const dilate: (imageData: ImageData, size?: number) => ImageData;
/**
 * 腐蚀
 * @param imageData ImageData
 * @param size default 3 表示 3 * 3的mat, 请传大于1的奇数
 */
export declare const erode: (imageData: ImageData, size?: number) => ImageData;
```
