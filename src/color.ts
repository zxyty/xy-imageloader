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

// input rgb: [[r,g,b],[r,g,b], ...] | or ImageData for [r,g,b,a];
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
