/* eslint-disable no-continue */
type CompareWay =
  | "CV_TM_SQDIFF"
  | "CV_TM_SQDIFF_NORMED"
  | "CV_TM_CCORR"
  | "CV_TM_CCORR_NORMED"
  | "CV_TM_CCOEFF"
  | "CV_TM_CCOEFF_NORMED";

// 差值平方和匹配 CV_TM_SQDIFF
const cvTmSqDiff = (template, search, tWidth, tHeight, sWidth, sHeight) => {
  let minValue = Infinity;
  let x = -1;
  let y = -1;
  for (let th = 0; th < tHeight; th += 1) {
    for (let tW = 0; tW < tWidth; tW += 1) {
      if (tW + sWidth > tWidth || th + sHeight > tHeight) {
        continue;
      }
      let sum = 0;
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          const tValue = template[(th + sH) * tWidth + tW + sW];
          const sValue = search[sH * sWidth + sW];
          sum += (tValue - sValue) * (tValue - sValue);
        }
      }
      if (minValue > sum) {
        minValue = sum;
        x = tW;
        y = th;
      }
      if (sum === 0) {
        return { x, y };
      }
    }
  }
  return { x, y };
};

// 归一化差值平方和匹配 CV_TM_SQDIFF_NORMED
const cvTmSqDiffNormed = (
  template,
  search,
  tWidth,
  tHeight,
  sWidth,
  sHeight
) => {
  let minValue = Infinity;
  let x = -1;
  let y = -1;
  for (let th = 0; th < tHeight; th += 1) {
    for (let tW = 0; tW < tWidth; tW += 1) {
      if (tW + sWidth > tWidth || th + sHeight > tHeight) {
        continue;
      }
      let sum = 0;
      let tPowerSum = 0;
      let sPowerSum = 0;
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          const tValue = template[(th + sH) * tWidth + tW + sW];
          const sValue = search[sH * sWidth + sW];
          sum += (tValue - sValue) ** 2;
          tPowerSum += tValue ** 2;
          sPowerSum += sValue ** 2;
        }
      }
      sum /= Math.sqrt(tPowerSum * sPowerSum);
      if (minValue > sum) {
        minValue = sum;
        x = tW;
        y = th;
      }
      if (sum === 0) {
        return { x, y };
      }
    }
  }
  return { x, y };
};

// 相关匹配 CV_TM_CCORR
// 值约大 代表约接近
const cvTmCcorr = (template, search, tWidth, tHeight, sWidth, sHeight) => {
  let maxValue = -Infinity;
  let x = -1;
  let y = -1;
  for (let th = 0; th < tHeight; th += 1) {
    for (let tW = 0; tW < tWidth; tW += 1) {
      if (tW + sWidth > tWidth || th + sHeight > tHeight) {
        continue;
      }
      let sum = 0;
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          const tValue = template[(th + sH) * tWidth + tW + sW];
          const sValue = search[sH * sWidth + sW];
          sum += tValue * sValue;
        }
      }
      if (maxValue < sum) {
        maxValue = sum;
        x = tW;
        y = th;
      }
    }
  }
  return { x, y };
};

// 标准化相关匹配 CV_TM_CCORR_NORMED
const cvTmCcorrNormed = (
  template,
  search,
  tWidth,
  tHeight,
  sWidth,
  sHeight
) => {
  let maxValue = -Infinity;
  let x = -1;
  let y = -1;
  for (let th = 0; th < tHeight; th += 1) {
    for (let tW = 0; tW < tWidth; tW += 1) {
      if (tW + sWidth > tWidth || th + sHeight > tHeight) {
        continue;
      }
      let sum = 0;
      let tPowerSum = 0;
      let sPowerSum = 0;
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          const tValue = template[(th + sH) * tWidth + tW + sW];
          const sValue = search[sH * sWidth + sW];
          sum += tValue * sValue;
          tPowerSum += tValue ** 2;
          sPowerSum += sValue ** 2;
        }
      }
      sum /= Math.sqrt(tPowerSum * sPowerSum);
      if (maxValue < sum) {
        maxValue = sum;
        x = tW;
        y = th;
      }
    }
  }
  return { x, y };
};

// 相关匹配 CV_TM_CCOEFF
const cvTmCcoeff = (template, search, tWidth, tHeight, sWidth, sHeight) => {
  let maxValue = -Infinity;
  let x = -1;
  let y = -1;
  for (let th = 0; th < tHeight; th += 1) {
    for (let tW = 0; tW < tWidth; tW += 1) {
      if (tW + sWidth > tWidth || th + sHeight > tHeight) {
        continue;
      }
      let tSum = 0;
      let sSum = 0;
      // 需要先获取平均值
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          tSum += template[(th + sH) * tWidth + tW + sW];
          sSum += search[sH * sWidth + sW];
        }
      }
      const tSumAverage = tSum / (sWidth * sHeight);
      const sSumAverage = sSum / (sWidth * sHeight);

      let sum = 0;
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          let tValue = template[(th + sH) * tWidth + tW + sW];
          let sValue = search[sH * sWidth + sW];
          tValue -= tSumAverage;
          sValue -= sSumAverage;

          sum += tValue * sValue;
        }
      }

      if (maxValue < sum) {
        maxValue = sum;
        x = tW;
        y = th;
      }
    }
  }
  return { x, y };
};

// 标准相关匹配 CV_TM_CCOEFF_NORMED
const cvTmCcoeffNormed = (
  template,
  search,
  tWidth,
  tHeight,
  sWidth,
  sHeight
) => {
  let maxValue = -Infinity;
  let x = -1;
  let y = -1;
  for (let th = 0; th < tHeight; th += 1) {
    for (let tW = 0; tW < tWidth; tW += 1) {
      if (tW + sWidth > tWidth || th + sHeight > tHeight) {
        continue;
      }
      let tSum = 0;
      let sSum = 0;
      let tPowerSum = 0;
      let sPowerSum = 0;
      // 需要先获取平均值
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          const tValue = template[(th + sH) * tWidth + tW + sW];
          const sValue = search[sH * sWidth + sW];

          tSum += tValue;
          sSum += sValue;

          tPowerSum += tValue ** 2;
          sPowerSum += sValue ** 2;
        }
      }
      const tSumAverage = tSum / (sWidth * sHeight);
      const sSumAverage = sSum / (sWidth * sHeight);

      let sum = 0;
      for (let sH = 0; sH < sHeight; sH += 1) {
        for (let sW = 0; sW < sWidth; sW += 1) {
          let tValue = template[(th + sH) * tWidth + tW + sW];
          let sValue = search[sH * sWidth + sW];
          tValue -= tSumAverage;
          sValue -= sSumAverage;

          tValue /= Math.sqrt(tPowerSum);
          sValue /= Math.sqrt(sPowerSum);

          sum += tValue * sValue;
        }
      }

      if (maxValue < sum) {
        maxValue = sum;
        x = tW;
        y = th;
      }

      if (sum === 1) {
        return { x, y };
      }
    }
  }
  return { x, y };
};

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
export const getTemplatePos = (
  template,
  search,
  tWidth,
  tHeight,
  sWidth,
  sHeight,
  type?: CompareWay
) => {
  if (type === "CV_TM_SQDIFF" || !type) {
    return cvTmSqDiff(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === "CV_TM_SQDIFF_NORMED") {
    return cvTmSqDiffNormed(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === "CV_TM_CCORR") {
    return cvTmCcorr(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === "CV_TM_CCORR_NORMED") {
    return cvTmCcorrNormed(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === "CV_TM_CCOEFF") {
    return cvTmCcoeff(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === "CV_TM_CCOEFF_NORMED") {
    return cvTmCcoeffNormed(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  return { x: -1, y: -1 };
};
