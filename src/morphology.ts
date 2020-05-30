// 形态学
/**
 * 膨胀
 * @param imageData ImageData
 * @param size default 3 表示 3 * 3的mat, 请传大于1的奇数
 */
export const dilate = (imageData: ImageData, size = 3) => {
    const { data, width: tWidth, height: tHeight } = imageData;

    const sWidth = size;
    const sHeight = size;

    for (let th = 0; th < tHeight; th += 1) {
        for (let tW = 0; tW < tWidth; tW += 1) {
            let sum = 0;  // 255 * 3;
            let realOffset = 0;

            // 求当前范围size * size的最小值
            for (let sH = 0; sH < sHeight; sH += 1) {
                for (let sW = 0; sW < sWidth; sW += 1) {
                    const offset = ((th + sH) * tWidth + (tW + sW)) * 4;
                    const tValue0 = data[offset]; // r
                    const tValue1 = data[offset + 1]; // g
                    const tValue2 = data[offset + 2]; // b
                    // const tValue3 = data[offset + 3]; // a
                    const tempSum = tValue0 + tValue1 + tValue2;
                    if (tempSum >= sum) {
                        sum = tempSum;
                        realOffset = offset;
                    }
                }
            }

            imageData.data[(th * tWidth + tW) * 4] = data[realOffset];
            imageData.data[(th * tWidth + tW) * 4 + 1] = data[realOffset + 1];
            imageData.data[(th * tWidth + tW) * 4 + 2] = data[realOffset + 2];
            // newData.data[(th * tWidth + tW) * 4 + 3] = data[realOffset + 3];
        }
    }

    return imageData;
}

/**
 * 腐蚀
 * @param imageData ImageData
 * @param size default 3 表示 3 * 3的mat, 请传大于1的奇数
 */
export const erode = (imageData: ImageData, size = 3) => {


    const { data, width: tWidth, height: tHeight } = imageData;

    const sWidth = size;
    const sHeight = size;

    for (let th = 0; th < tHeight; th += 1) {
        for (let tW = 0; tW < tWidth; tW += 1) {
            let sum = 765;  // 255 * 3;
            let realOffset = 0;

            // 求当前范围size * size的最小值
            for (let sH = 0; sH < sHeight; sH += 1) {
                for (let sW = 0; sW < sWidth; sW += 1) {
                    const offset = ((th + sH) * tWidth + (tW + sW)) * 4;
                    const tValue0 = data[offset]; // r
                    const tValue1 = data[offset + 1]; // g
                    const tValue2 = data[offset + 2]; // b
                    // const tValue3 = data[offset + 3]; // a
                    const tempSum = tValue0 + tValue1 + tValue2;
                    if (tempSum <= sum) {
                        sum = tempSum;
                        realOffset = offset;
                    }
                }
            }

            imageData.data[(th * tWidth + tW) * 4] = data[realOffset];
            imageData.data[(th * tWidth + tW) * 4 + 1] = data[realOffset + 1];
            imageData.data[(th * tWidth + tW) * 4 + 2] = data[realOffset + 2];
            // imageData.data[(th * tWidth + tW) * 4 + 3] = data[realOffset + 3];
        }
    }

    return imageData;
}
