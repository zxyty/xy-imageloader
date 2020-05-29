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
