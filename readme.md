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

### API
* index.ts
```ts
declare const imgLoader: (src: string) => Promise<HTMLImageElement>;
export declare const loadCanvas: (source: string | HTMLImageElement) => Promise<unknown>;
export declare const getImageData: (source: string | HTMLImageElement | HTMLCanvasElement) => Promise<unknown>;
export declare const getRGBColor: (imageData: ImageData) => number[][];
export declare const rgbToGary: (rgb: ImageData | number[][]) => number[];
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
type CompareWay =
  | "CV_TM_SQDIFF"
  | "CV_TM_SQDIFF_NORMED"
  | "CV_TM_CCORR"
  | "CV_TM_CCORR_NORMED"
  | "CV_TM_CCOEFF"
  | "CV_TM_CCOEFF_NORMED";

const getTemplatePos = (
  template,
  search,
  tWidth,
  tHeight,
  sWidth,
  sHeight,
  type?: CompareWay
): {x: number; y: number} => {}
```