/* eslint-disable no-continue */
type CompareWay =
  | 'CV_TM_SQDIFF'
  | 'CV_TM_SQDIFF_NORMED'
  | 'CV_TM_CCORR'
  | 'CV_TM_CCORR_NORMED'
  | 'CV_TM_CCOEFF'
  | 'CV_TM_CCOEFF_NORMED';

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
  sHeight,
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
  sHeight,
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
  sHeight,
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
  type?: CompareWay,
) => {
  if (type === 'CV_TM_SQDIFF' || !type) {
    return cvTmSqDiff(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === 'CV_TM_SQDIFF_NORMED') {
    return cvTmSqDiffNormed(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === 'CV_TM_CCORR') {
    return cvTmCcorr(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === 'CV_TM_CCORR_NORMED') {
    return cvTmCcorrNormed(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === 'CV_TM_CCOEFF') {
    return cvTmCcoeff(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  if (type === 'CV_TM_CCOEFF_NORMED') {
    return cvTmCcoeffNormed(template, search, tWidth, tHeight, sWidth, sHeight);
  }
  return { x: -1, y: -1 };
};

/**
 * 比较两幅图片得到 不同处的坐标
 * @param source1 ImageData
 * @param source2 ImageData
 */
export const compareImage = (source1: ImageData, source2: ImageData) => {
  // 去到相同背景
  const leftDataImage: any[] = [];
  // const newImageData = new ImageData(source1.width, source1.height);
  const { width, height } = source1;
  for (let i = 0; i < height; i++) {
    leftDataImage.push([]);
    for (let j = 0; j < width; j++) {
      const offset = (i * width + j) * 4;
      const r1 = source1.data[offset];
      const g1 = source1.data[offset + 1];
      const b1 = source1.data[offset + 2];

      const r2 = source2.data[offset];
      const g2 = source2.data[offset + 1];
      const b2 = source2.data[offset + 2];

      if (r1 === r2 && g1 === g2 && b1 === b2) {
        // 相同则去掉像素值
        // 保留成0
        // leftDataImage[i][j] = 0;
        // newImageData.data[offset] = 255;
        // newImageData.data[offset + 1] = 255;
        // newImageData.data[offset + 2] = 255;
        // newImageData.data[offset + 3] = 255;
        leftDataImage[i].push(0);
      } else {
        // 不同保留成255
        // leftDataImage[i][j] = 255;
        // newImageData.data[offset] = 0;
        // newImageData.data[offset + 1] = 0;
        // newImageData.data[offset + 2] = 0;
        // newImageData.data[offset + 3] = 255;
        leftDataImage[i].push(255);
      }
    }
  }

  // 构建上下左右遍历不同区域 找出边界范围->坐标大小
  const foundNode = {};
  const getBoundaryNodes = (i, j) => {
    const returnArr: any[] = [];

    let tplI = i;
    let tplJ = j;
    for (;;) {
      if (foundNode[`${tplI}_${tplJ}`]) {
        break;
      }
      const west = j <= 0 ? 0 : leftDataImage[tplI][tplJ - 1] || 0;
      foundNode[`${tplI}_${tplJ - 1}`] = true;
      if (west !== 0) {
        returnArr.push({
          i: tplI,
          j: tplJ--,
        });
      } else {
        break;
      }
    }

    tplI = i;
    tplJ = j;
    for (;;) {
      if (foundNode[`${tplI}_${tplJ}`]) {
        break;
      }
      // foundNode[`${tplI}_${tplJ}`] = true;
      const east = leftDataImage[tplI][tplJ + 1] || 0;
      foundNode[`${tplI}_${tplJ + 1}`] = true;
      if (east !== 0) {
        returnArr.push({
          i: tplI,
          j: tplJ++,
        });
      } else {
        break;
      }
    }

    tplI = i;
    tplJ = j;
    for (;;) {
      if (foundNode[`${tplI}_${tplJ}`]) {
        break;
      }
      // foundNode[`${tplI}_${tplJ}`] = true;
      const north = tplI <= 0 ? 0 : leftDataImage[tplI - 1][tplJ] || 0;
      foundNode[`${tplI - 1}_${tplJ}`] = true;
      if (north !== 0) {
        returnArr.push({
          i: tplI--,
          j: tplJ,
        });
      } else {
        break;
      }
    }

    tplI = i;
    tplJ = j;
    for (;;) {
      if (foundNode[`${tplI}_${tplJ}`]) {
        break;
      }
      // foundNode[`${tplI}_${tplJ}`] = true;
      const north =
        tplI >= source1.height - 1 ? 0 : leftDataImage[tplI + 1][tplJ] || 0;
      foundNode[`${tplI + 1}_${tplJ}`] = true;
      if (north !== 0) {
        returnArr.push({
          i: tplI++,
          j: tplJ,
        });
      } else {
        break;
      }
    }

    tplI = i;
    tplJ = j;
    for (;;) {
      if (tplI <= 0 || tplJ >= source1.width - 1) {
        break;
      } else {
        if (foundNode[`${tplI}_${tplJ}`]) {
          break;
        }
        // foundNode[`${tplI}_${tplJ}`] = true;
        const northeast = leftDataImage[tplI - 1][tplJ + 1] || 0;
        foundNode[`${tplI - 1}_${tplJ + 1}`] = true;
        if (northeast !== 0) {
          returnArr.push({
            i: tplI--,
            j: tplJ++,
          });
        } else {
          break;
        }
      }
    }

    tplI = i;
    tplJ = j;
    for (;;) {
      if (tplI <= 0 || tplJ <= 0) {
        break;
      } else {
        if (foundNode[`${tplI}_${tplJ}`]) {
          break;
        }
        // foundNode[`${tplI}_${tplJ}`] = true;
        const northwest = leftDataImage[tplI - 1][tplJ - 1] || 0;
        foundNode[`${tplI - 1}_${tplJ - 1}`] = true;
        if (northwest !== 0) {
          returnArr.push({
            i: tplI--,
            j: tplJ--,
          });
        } else {
          break;
        }
      }
    }

    tplI = i;
    tplJ = j;
    for (;;) {
      if (tplI >= source1.height - 1 || tplJ >= source1.width - 1) {
        break;
      } else {
        if (foundNode[`${tplI}_${tplJ}`]) {
          break;
        }
        // foundNode[`${tplI}_${tplJ}`] = true;
        const southeast = leftDataImage[tplI + 1][tplJ + 1] || 0;
        foundNode[`${tplI + 1}_${tplJ + 1}`] = true;
        if (southeast !== 0) {
          returnArr.push({
            i: tplI++,
            j: tplJ++,
          });
        } else {
          break;
        }
      }
    }

    tplI = i;
    tplJ = j;
    for (;;) {
      if (tplI >= source1.height - 1 || tplJ <= 0) {
        break;
      } else {
        if (foundNode[`${tplI}_${tplJ}`]) {
          break;
        }
        // foundNode[`${tplI}_${tplJ}`] = true;
        const southwest = leftDataImage[tplI + 1][tplJ - 1] || 0;
        foundNode[`${tplI + 1}_${tplJ - 1}`] = true;
        if (southwest !== 0) {
          returnArr.push({
            i: tplI++,
            j: tplJ--,
          });
        } else {
          break;
        }
      }
    }

    // if (left > 0 && !foundNode[`${i}_${j - 1}`]) {
    //   const tpl = getBoundaryNodes(i, j - 1) || [];
    //   returnArr.push({ i, j: j - 1 }, ...tpl);
    // }
    // if (right > 0 && !foundNode[`${i}_${j + 1}`]) {
    //   const tpl = getBoundaryNodes(i, j + 1) || [];
    //   returnArr.push({ i, j: j + 1 }, ...tpl);
    // }
    // if (top > 0 && !foundNode[`${i - 1}_${j}`]) {
    //   const tpl = getBoundaryNodes(i - 1, j) || [];
    //   returnArr.push({ i: i - 1, j }, ...tpl);
    // }
    // if (bottom > 0 && !foundNode[`${i + 1}_${j}`]) {
    //   const tpl = getBoundaryNodes(i + 1, j) || [];
    //   returnArr.push({ i: i + 1, j }, ...tpl);
    // }

    return returnArr;
  };

  const different: any[] = [];

  const getBoundary = arr => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    arr.forEach(d => {
      if (d.j < minX) {
        minX = d.j;
      }
      if (d.j > maxX) {
        maxX = d.j;
      }
      if (d.i < minY) {
        minY = d.i;
      }
      if (d.i > maxY) {
        maxY = d.i;
      }
    });

    return {
      x: minX,
      y: minY,
      w: maxX - minX + 1,
      h: maxY - minY + 1,
    };
  };

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (foundNode[`${i}_${j}`]) {
        continue;
      }
      if (leftDataImage[i][j] === 255) {
        // break;
        // 找到不同点了
        const boundaryNodes = getBoundaryNodes(i, j);
        if (boundaryNodes.length) {
          const boundary = getBoundary(boundaryNodes);
          different.push(boundary);
        }
      }
      foundNode[`${i}_${j}`] = true;
    }
  }

  // merge nearly boundary
  const mergeDifferent = nowDifferent => {
    const len = nowDifferent.length;
    const newDifferent: any[] = [];
    if (len <= 1) {
      return nowDifferent;
    }

    // 扩展10px
    const threshold = 100;
    nowDifferent = nowDifferent.map(c => {
      return {
        x: c.x - threshold,
        y: c.y - threshold,
        w: c.w + threshold,
        h: c.h + threshold,
      };
    });

    nowDifferent.reduce((total, curr) => {
      const needMergeNode = total.find(c => checkIsCrossBox(c, curr));
      if (needMergeNode) {
        Object.assign(needMergeNode, getMergeBoundary(needMergeNode, curr));
      } else {
        total.push(curr);
      }
      return total;
    }, newDifferent);

    // 取消扩展px
    return newDifferent.map(c => {
      return {
        x: c.x + threshold,
        y: c.y + threshold,
        w: c.w - threshold,
        h: c.h - threshold,
      };
    });
  };

  return mergeDifferent(different);
};

// box
const checkIsCrossBox = (box1, box2) => {
  const maxX =
    box1.x + box1.w >= box2.x + box2.w ? box1.x + box1.w : box2.x + box2.w;
  const maxY =
    box1.y + box1.h >= box2.y + box2.h ? box1.y + box1.h : box2.y + box2.h;
  const minX = box1.x <= box2.x ? box1.x : box2.x;
  const minY = box1.y <= box2.y ? box1.y : box2.y;

  if (maxX - minX <= box1.w + box2.w && maxY - minY <= box1.h + box2.h) {
    return true;
  }
  return false;
};

const getMergeBoundary = (box1, box2) => {
  const maxX =
    box1.x + box1.w >= box2.x + box2.w ? box1.x + box1.w : box2.x + box2.w;
  const maxY =
    box1.y + box1.h >= box2.y + box2.h ? box1.y + box1.h : box2.y + box2.h;
  const minX = box1.x <= box2.x ? box1.x : box2.x;
  const minY = box1.y <= box2.y ? box1.y : box2.y;

  const wrapWidth = maxX - minX;
  const wrapHeight = maxY - minY;

  return {
    x: minX,
    y: minY,
    w: wrapWidth,
    h: wrapHeight,
  };
};
