/* eslint-disable no-continue */
/* eslint-disable prefer-destructuring */
type BorderType = "BORDER_REPLICATE" | "BORDER_REFLECT" | "BORDER_CONSTANT"; // 复制 | 镜像 | 无

/**
 * 边缘信息扩展
 * @param imageData src 图像信息
 * @param borderType BORDER_REPLICATE | BORDER_REFLECT | BORDER_CONSTANT 默认为BORDER_REPLICATE
 * @param size 扩展核大小size 正奇数 默认3
 * @returns ImageData 新的imageData
 */
export const borderExpand = (
  imageData: ImageData,
  borderType: BorderType = "BORDER_REPLICATE",
  size = 3
) => {
  const sWidth = size;
  const sHeight = size;
  const { width: tWidth, height: tHeight } = imageData;

  // 补充边界大小
  const newWidth = 2 * sWidth + tWidth;
  const newHeight = 2 * sHeight + tHeight;
  const newImageData = new ImageData(newWidth, newHeight);

  for (let i = 0; i < newHeight; i += 1) {
    for (let j = 0; j < newWidth; j += 1) {
      const offset = (newWidth * i + j) * 4;
      if (
        i >= sHeight &&
        i < sHeight + tHeight &&
        j >= sWidth &&
        j < sWidth + tWidth
      ) {
        const shouldRow = i - sHeight;
        const shouldCol = j - sWidth;
        const pxOffset = (shouldRow * tWidth + shouldCol) * 4;
        newImageData.data[offset] = imageData.data[pxOffset];
        newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
        newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
        newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        continue;
      }
      if (borderType === "BORDER_CONSTANT") {
        newImageData.data[offset] = 0;
        newImageData.data[offset + 1] = 0;
        newImageData.data[offset + 2] = 0;
        newImageData.data[offset + 3] = 255;
        continue;
      }
      if (i < sHeight && j < sWidth) {
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = sHeight - i - 1;
          const shouldCol = sWidth - j - 1;
          const pxOffset = (shouldRow * tWidth + shouldCol) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];

          continue;
        }
        // 左上角
        newImageData.data[offset] = imageData.data[0];
        newImageData.data[offset + 1] = imageData.data[1];
        newImageData.data[offset + 2] = imageData.data[2];
        newImageData.data[offset + 3] = imageData.data[3];
      } else if (i < sHeight && j >= sWidth + tWidth) {
        // 右上角
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = sHeight - i - 1;
          const shouldCol = j - sWidth - tWidth;
          const pxOffset = (shouldRow * tWidth + (tWidth - shouldCol - 1)) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
          continue;
        }

        const firstRowLastPx = (tWidth - 1) * 4;
        newImageData.data[offset] = imageData.data[firstRowLastPx];
        newImageData.data[offset + 1] = imageData.data[firstRowLastPx + 1];
        newImageData.data[offset + 2] = imageData.data[firstRowLastPx + 2];
        newImageData.data[offset + 3] = imageData.data[firstRowLastPx + 3];
      } else if (i >= sHeight + tHeight && j < sWidth) {
        // 左下角
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = i - sHeight - tHeight;
          const shouldCol = sWidth - j - 1;
          const pxOffset = ((tHeight - shouldRow - 1) * tWidth + shouldCol) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
          continue;
        }

        const lastRowFirstPx = tWidth * (tHeight - 1) * 4;
        newImageData.data[offset] = imageData.data[lastRowFirstPx];
        newImageData.data[offset + 1] = imageData.data[lastRowFirstPx + 1];
        newImageData.data[offset + 2] = imageData.data[lastRowFirstPx + 2];
        newImageData.data[offset + 3] = imageData.data[lastRowFirstPx + 3];
      } else if (i >= sHeight + tHeight && j >= sWidth + tWidth) {
        // 右下角
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = i - sHeight - tHeight;
          const shouldCol = j - sWidth - tWidth;
          const pxOffset =
            ((tHeight - shouldRow - 1) * tWidth + (tWidth - shouldCol - 1)) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
          continue;
        }

        const lastRowFirstPx = tWidth * tHeight * 4;
        newImageData.data[offset] = imageData.data[lastRowFirstPx - 4];
        newImageData.data[offset + 1] = imageData.data[lastRowFirstPx - 3];
        newImageData.data[offset + 2] = imageData.data[lastRowFirstPx - 2];
        newImageData.data[offset + 3] = imageData.data[lastRowFirstPx - 1];
      } else if (i < sHeight && j >= sWidth && j < sWidth + tWidth) {
        // 上边
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = sHeight - i - 1;
          const shouldCol = j - sWidth;
          const pxOffset = (shouldRow * tWidth + shouldCol) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        } else if (borderType === "BORDER_REPLICATE") {
          const shouldCol = j - sWidth;
          const pxOffset = shouldCol * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        }
      } else if (i >= sHeight + tHeight && j >= sWidth && j < sWidth + tWidth) {
        // 下边
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = i - (sHeight + tHeight);
          const shouldCol = j - sWidth;
          const pxOffset = ((tHeight - shouldRow - 1) * tWidth + shouldCol) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        } else if (borderType === "BORDER_REPLICATE") {
          const shouldCol = j - sWidth;
          const pxOffset = ((tHeight - 1) * tWidth + shouldCol) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        }
      } else if (j < tWidth && i >= sHeight && i < sHeight + tHeight) {
        // 左边
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = i - sHeight;
          const shouldCol = sWidth - j - 1;
          const pxOffset = (shouldRow * tWidth + shouldCol) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        } else if (borderType === "BORDER_REPLICATE") {
          const shouldRow = i - sHeight;
          const pxOffset = shouldRow * tWidth * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        }
      } else if (
        j >= sWidth + tWidth &&
        i >= sHeight &&
        i < sHeight + tHeight
      ) {
        // 右边
        if (borderType === "BORDER_REFLECT") {
          const shouldRow = i - sHeight;
          const shouldCol = j - sWidth - tWidth;
          const pxOffset = (shouldRow * tWidth + (tWidth - shouldCol - 1)) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        } else if (borderType === "BORDER_REPLICATE") {
          const shouldRow = i - sHeight + 1;
          const pxOffset = (shouldRow * tWidth - 1) * 4;
          newImageData.data[offset] = imageData.data[pxOffset];
          newImageData.data[offset + 1] = imageData.data[pxOffset + 1];
          newImageData.data[offset + 2] = imageData.data[pxOffset + 2];
          newImageData.data[offset + 3] = imageData.data[pxOffset + 3];
        }
      }
    }
  }

  return newImageData;
};
