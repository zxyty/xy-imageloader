// image loader
const imgLoader = (src: string): Promise<HTMLImageElement> => {
  return new Promise((res, rej) => {
    const imgTarget = new Image();
    imgTarget.src = src;
    imgTarget.onload = () => {
      res(imgTarget);
    };
    imgTarget.onerror = e => {
      rej(e);
    };
  });
};

/**
 * image加载canvas
 * @param source string | HTMLImageElement
 * @param compressWidth 是否压缩 n * n
 */
export const loadCanvas = async (
  source: string | HTMLImageElement,
  compressWidth?: number,
): Promise<HTMLCanvasElement> => {
  let imgTarget = source;
  const handleDrawImage = (target: HTMLImageElement) => {
    const canvasEle = document.createElement('canvas');
    const canvasCtx = canvasEle.getContext('2d');

    canvasEle.width = compressWidth || target.width;
    canvasEle.height = compressWidth || target.height;

    // eslint-disable-next-line no-unused-expressions
    canvasCtx?.drawImage(target, 0, 0, canvasEle.width, canvasEle.height);

    return canvasEle;
  };
  return new Promise((resolve, reject) => {
    try {
      if (typeof source === 'string') {
        imgLoader(source).then(res => {
          imgTarget = res;
          const canvasEle = handleDrawImage(imgTarget);
          resolve(canvasEle);
        });
      } else {
        if (!(imgTarget instanceof HTMLImageElement)) {
          throw new Error('loadCanvas error');
        }
        const canvasEle = handleDrawImage(imgTarget);
        resolve(canvasEle);
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const getImageData = (
  source: string | HTMLImageElement | HTMLCanvasElement,
) => {
  if (source instanceof HTMLCanvasElement) {
    return new Promise(resolve => {
      const imageData = source
        .getContext('2d')
        ?.getImageData(0, 0, source.width, source.height);
      resolve(imageData);
    });
  }
  return new Promise(resolve => {
    loadCanvas(source).then((canvas: HTMLCanvasElement) => {
      const imageData = canvas
        .getContext('2d')
        ?.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    });
  });
};

// return [[r,g,b], [r,g,b], ...]
export const getRGBColor = (imageData: ImageData) => {
  const { data } = imageData;
  const returnColor: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    const aspectAlpha = data[i + 3] / 255;
    const r = Math.ceil(data[i] * aspectAlpha);
    const g = Math.ceil(data[i + 1] * aspectAlpha);
    const b = Math.ceil(data[i + 2] * aspectAlpha);
    returnColor.push([r, g, b]);
  }
  return returnColor;
};

// input rgb: [[r,g,b],[r,g,b], ...];
// return [x1, x2, x3, ...];
export const rgbToGary = (rgb: number[][] | ImageData) => {
  let validRgb = rgb;
  if (validRgb instanceof ImageData) {
    validRgb = getRGBColor(validRgb);
  }
  return validRgb.map(color => {
    return parseInt(
      String((299 * color[0] + 587 * color[1] + 114 * color[2]) / 1000),
      10,
    );
  });
};

/**
 * 大津法取阈值
 * @param src 灰度值[x1,x2,x3,...]
 */
export const OtsuAlgorithm = (src: number[] = []) => {
  const total = src.length;
  if (!total) {
    return -1;
  }
  // 建立一个0-255的灰度像素索引表
  // [gray] -> totalCount 个数
  const histData = new Array(256).fill(0);
  let ptr = 0;
  while (ptr < total) {
    const gray = 0xff && src[ptr++];
    histData[gray]++;
  }

  let totalGraySum = 0; // 总的各灰度像素值总和
  for (let i = 0; i < 256; i++) {
    totalGraySum += i * histData[i];
  }

  let wB = 0; // 当前背景使用使用个数
  let wF = 0; // 当前前景使用个数
  let sumB = 0; // 当前背景灰度值总和
  let varMax = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t += 1) {
    wB += histData[t];
    if (wB === 0) {
      continue;
    }
    wF = total - wB;
    if (wF === 0) {
      break;
    }
    sumB += t * histData[t];

    const aB = sumB / wB; // 当前背景灰度值平均值
    const aF = (totalGraySum - sumB) / wF; // 当前前景灰度值平均值

    // 类间平方差
    const varTemp = wB * wF * (aB - aF) ** 2;
    if (varTemp > varMax) {
      varMax = varTemp;
      threshold = t;
    }
  }

  return threshold;
};

/**
 * 转换为二值图像
 * @param imageData ImageData 图像数据
 * @param threshold number 阈值 默认125
 * @param cropBoundary boolean 是否去除边界无效区
 * @returns 返回 imageData | [imageData, <offsetX>, <offsetY>]
 */
export const convertBinarization = (
  imageData: ImageData,
  threshold = 125,
  cropBoundary = false,
) => {
  for (let i = 0; i < imageData.data.length; i += 4) {
    // 先转灰度值
    const grayColor = parseInt(
      String(
        (299 * imageData.data[i] +
          587 * imageData.data[i + 1] +
          114 * imageData.data[i + 2]) /
          1000,
      ),
      10,
    );
    const shouldValue = grayColor >= threshold ? 255 : 0;
    imageData.data[i] = shouldValue;
    imageData.data[i + 1] = shouldValue;
    imageData.data[i + 2] = shouldValue;
  }

  if (!cropBoundary) {
    return [imageData];
  }

  const { width, height } = imageData;
  let startX = Infinity;
  let endX = 0;
  let startY = Infinity;
  let endY = 0;
  // 以0为有效值
  // 求出边界超出范围
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const offset = (i * width + j) * 4;
      if (imageData.data[offset] === 0) {
        // debugger;
        if (i < startY) {
          startY = i;
        }
        if (i > endY) {
          endY = i;
        }
        if (j > endX) {
          endX = j;
        }
        if (j < startX) {
          startX = j;
        }
      }
    }
  }

  const cropedWidth = endX - startX + 1;
  const cropedHeight = endY - startY + 1;

  // debugger;

  const newImageData = new ImageData(cropedWidth, cropedHeight);

  for (let j = startY, shouldM = 0; j <= endY; j++, shouldM++) {
    for (let i = startX, shouldN = 0; i <= endX; i++, shouldN++) {
      const offset = (j * width + i) * 4;
      const realOffset = (shouldM * cropedWidth + shouldN) * 4;
      const pxValue = imageData.data[offset];
      const pxValueAlpha = imageData.data[offset + 3];
      newImageData.data[realOffset] = pxValue;
      newImageData.data[realOffset + 1] = pxValue;
      newImageData.data[realOffset + 2] = pxValue;
      newImageData.data[realOffset + 3] = pxValueAlpha;
    }
  }

  return [newImageData, startX, startY];
};

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

export default imgLoader;
