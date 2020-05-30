import { getLinearMatData, linearFilter } from 'xy-math/lib/LinearFilter';
import { getGaussBlurKernel } from 'xy-math/lib/GaussBlur';
import { rgbToGary } from './color';
import { sobel3x, sobel3y, sobel5x, sobel5y } from './kernel';
import { borderExpand } from './border';

/**
 * 转换为中值滤波图像
 * @param imageData ImageData 图像数据
 * @param size 滤波大小 默认3 需大于等于3的奇数
 * @param count 迭代次数
 */
export const convertMedian = (imageData: ImageData, size = 3, count = 1) => {
  const { width: tWidth, height: tHeight } = imageData;
  const sWidth = size;
  const sHeight = size;
  const convert = (curr: ImageData, size = 3) => {
    for (let th = 0; th < tHeight; th += 1) {
      for (let tW = 0; tW < tWidth; tW += 1) {
        if (tW + sWidth > tWidth || th + sHeight > tHeight) {
          continue;
        }
        const tempR: number[] = [];
        const tempG: number[] = [];
        const tempB: number[] = [];
        const currPixIndex = (th * tWidth + th) * 4;
        for (let sH = 0; sH < sHeight; sH += 1) {
          for (let sW = 0; sW < sWidth; sW += 1) {
            const tempPix = ((th + sH) * tWidth + tW + sW) * 4;
            const tValueR = curr.data[tempPix];
            const tValueG = curr.data[tempPix + 1];
            const tValueB = curr.data[tempPix + 2];

            tempR.push(tValueR);
            tempG.push(tValueG);
            tempB.push(tValueB);
          }
        }

        // 获取中值索引
        const index = ~~(size / 2);

        curr.data[currPixIndex] = tempR.sort()[index];
        curr.data[currPixIndex + 1] = tempG.sort()[index];
        curr.data[currPixIndex + 2] = tempB.sort()[index];
      }
    }
  };

  for (let i = 0; i < count; i += 1) {
    convert(imageData, size);
  }

  return imageData;
};

/**
 * 转换为均值滤波图像
 * @param imageData ImageData 图像数据
 * @param size 滤波大小 默认3 需大于等于3的奇数
 * @param count 迭代次数
 */
export const convertAverage = (imageData: ImageData, size = 3, count = 1) => {
  const { width: tWidth, height: tHeight } = imageData;
  const sWidth = size;
  const sHeight = size;

  const convert = (curr: ImageData, size = 3) => {
    for (let th = 0; th < tHeight; th += 1) {
      for (let tW = 0; tW < tWidth; tW += 1) {
        if (tW + sWidth > tWidth || th + sHeight > tHeight) {
          continue;
        }
        let tempRSum = 0;
        let tempGSum = 0;
        let tempBSum = 0;
        const currPixIndex = (th * tWidth + th) * 4;
        for (let sH = 0; sH < sHeight; sH += 1) {
          for (let sW = 0; sW < sWidth; sW += 1) {
            const tempPix = ((th + sH) * tWidth + tW + sW) * 4;
            const tValueR = curr.data[tempPix];
            const tValueG = curr.data[tempPix + 1];
            const tValueB = curr.data[tempPix + 2];

            tempRSum += tValueR;
            tempGSum += tValueG;
            tempBSum += tValueB;
          }
        }

        const total = size ** 2;
        const averageR = Math.ceil(tempRSum / total);
        const averageG = Math.ceil(tempGSum / total);
        const averageB = Math.ceil(tempBSum / total);

        curr.data[currPixIndex] = averageR;
        curr.data[currPixIndex + 1] = averageG;
        curr.data[currPixIndex + 2] = averageB;
      }
    }
  };

  for (let i = 0; i < count; i += 1) {
    convert(imageData, size);
  }

  return imageData;
};

/**
 * Sobel模糊
 * @param source ImageData
 * @param kernelSize 滤波核大小 默认3 可取3或者5
 * @returns ImageData 图像数据
 */
export const convertSobel = (source: ImageData, size: 3 | 5 = 3) => {
  const borderExpandSource = borderExpand(
    source,
    'BORDER_REPLICATE',
    Math.floor(size / 2),
  );
  const grayData = rgbToGary(borderExpandSource);
  const kernelX = size === 3 ? sobel3x : sobel5x;
  const kernelY = size === 3 ? sobel3y : sobel5y;

  const { width: expandedWidth } = borderExpandSource;
  const { width: tWidth, height: tHeight } = source;

  const filter = kernel => {
    const out: number[] = [];
    for (let i = 0; i < tHeight; i += 1) {
      for (let j = 0; j < tWidth; j += 1) {
        const mat = getLinearMatData(grayData, expandedWidth, size, i, j);
        const result = linearFilter(mat, kernel);
        out[i * tWidth + j] = Math.min(Math.abs(result || 0), 255);
      }
    }

    return out;
  };

  // should keep the same size
  const xFilter = filter(kernelX);
  const yFilter = filter(kernelY);

  const newData = new ImageData(tWidth, tHeight);
  const len = tWidth * tHeight;

  for (let i = 0; i < len; i += 1) {
    const result = Math.min(yFilter[i] + xFilter[i], 255);
    const index = i * 4;
    newData.data[index] = result;
    newData.data[index + 1] = result;
    newData.data[index + 2] = result;
    newData.data[index + 3] = 255;
  }

  return newData;
};

/**
 * 高斯模糊
 * @param source ImageData
 * @param radius 默认3 可取3或者5
 * @returns ImageData 图像数据
 */
export const convertGauss = (source: ImageData, radius: 3 | 5 = 3) => {
  const gaussKernel = getGaussBlurKernel(radius, radius / 3);

  const { width: tWidth, height: tHeight } = source;

  const filterX = kernel => {
    for (let i = 0; i < tHeight; i += 1) {
      for (let j = 0; j < tWidth; j += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        let gaussSum = 0;
        const index = (i * tWidth + j) * 4;
        for(let n = -radius; n <= radius; n++){
          let k = n + j;
          const currIndex = (k + tWidth * i) * 4;
          if (k >= 0 && k < tWidth){ //确保 k 没超出 width 的范围
            r += kernel[n + radius] * source.data[currIndex];
            g += kernel[n + radius] * source.data[currIndex + 1];
            b += kernel[n + radius] * source.data[currIndex + 2];
            gaussSum += kernel[n + radius];
          }
        }
        source.data[index] = r / gaussSum;
        source.data[index + 1] = g / gaussSum;
        source.data[index + 2] = b / gaussSum;
        source.data[index + 3] = source.data[index + 3];
      }
    }
  };

  const filterY = kernel => {
    for (let i = 0; i < tWidth; i += 1) {
      for (let j = 0; j < tHeight; j += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        let gaussSum = 0;
        const index = (j * tWidth + i) * 4;
        for(let n = -radius; n <= radius; n++){
          let k = n + j;
          const currIndex = (k * tWidth + i) * 4;
          if (k >= 0 && k < tHeight){ //确保 k 没超出 width 的范围
            r += kernel[n + radius] * source.data[currIndex];
            g += kernel[n + radius] * source.data[currIndex + 1];
            b += kernel[n + radius] * source.data[currIndex + 2];
            gaussSum += kernel[n + radius];
          }
        }
        source.data[index] = r / gaussSum;
        source.data[index + 1] = g / gaussSum;
        source.data[index + 2] = b / gaussSum;
        source.data[index + 3] = source.data[index + 3];
      }
    }
  };

  // x 方向高斯模糊
  filterX(gaussKernel);

  // y 方向高斯模糊
  filterY(gaussKernel);

  return source;
}
