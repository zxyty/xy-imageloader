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

export const loadCanvas = async (source: string | HTMLImageElement) => {
  let imgTarget = source;
  const handleDrawImage = (target: HTMLImageElement) => {
    const canvasEle = document.createElement("canvas");
    const canvasCtx = canvasEle.getContext("2d");

    canvasEle.width = target.width;
    canvasEle.height = target.height;

    canvasCtx?.drawImage(target, 0, 0);

    return canvasEle;
  };
  return new Promise((resolve, reject) => {
    try {
      if (typeof source === "string") {
        imgLoader(source).then(res => {
          imgTarget = res;
          const canvasEle = handleDrawImage(imgTarget);
          resolve(canvasEle);
        });
      } else {
        if (!(imgTarget instanceof HTMLImageElement)) {
          throw new Error("loadCanvas error");
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
  source: string | HTMLImageElement | HTMLCanvasElement
) => {
  if (source instanceof HTMLCanvasElement) {
    return new Promise(resolve => {
      const imageData = source
        .getContext("2d")
        ?.getImageData(0, 0, source.width, source.height);
      resolve(imageData);
    });
  }
  return new Promise(resolve => {
    loadCanvas(source).then((canvas: HTMLCanvasElement) => {
      const imageData = canvas
        .getContext("2d")
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
      10
    );
  });
};

/**
 * 转换为二值图像
 * @param imageData ImageData 图像数据
 * @param threshold number 阈值 默认125
 */
export const convertBinarization = (imageData: ImageData, threshold = 125) => {
  for (let i = 0; i < imageData.data.length; i +=4 ) {

    // 先转灰度值
    const grayColor = parseInt(
      String((299 * imageData.data[i] + 587 * imageData.data[i + 1] + 114 * imageData.data[i + 2]) / 1000),
      10
    );
    const shouldValue = grayColor >= threshold ? 255 : 0;
    imageData.data[i] = shouldValue;
    imageData.data[i + 1] = shouldValue;
    imageData.data[i + 2] = shouldValue;
  }

  return imageData;
}

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
  const convert = (imageData: ImageData, size = 3) => {
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
            const tValueR = imageData.data[tempPix];
            const tValueG = imageData.data[tempPix + 1];
            const tValueB = imageData.data[tempPix + 2];
            
            tempR.push(tValueR);
            tempG.push(tValueG);
            tempB.push(tValueB);
          }
        }

        // 获取中值索引
        const index = ~~(size / 2);

        imageData.data[currPixIndex] = tempR.sort()[index];
        imageData.data[currPixIndex + 1] = tempG.sort()[index];
        imageData.data[currPixIndex + 2] = tempB.sort()[index];
      }
    }
  };

  for (let i = 0; i < count; i += 1) {
    convert(imageData, size);
  }
  
  return imageData;
}

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
  
  const convert = (imageData: ImageData, size = 3) => {
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
            const tValueR = imageData.data[tempPix];
            const tValueG = imageData.data[tempPix + 1];
            const tValueB = imageData.data[tempPix + 2];
            
            tempRSum += tValueR;
            tempGSum += tValueG;
            tempBSum += tValueB;
          }
        }

        const total = size ** 2;
        const averageR = Math.ceil(tempRSum / total);
        const averageG = Math.ceil(tempGSum / total);
        const averageB = Math.ceil(tempBSum / total);

        imageData.data[currPixIndex] = averageR;
        imageData.data[currPixIndex + 1] = averageG;
        imageData.data[currPixIndex + 2] = averageB;
      }
    }
  };

  for (let i = 0; i < count; i += 1) {
    convert(imageData, size);
  }
  
  return imageData;
}

export default imgLoader;
