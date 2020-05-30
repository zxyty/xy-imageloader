// sobel算子
export const sobel3x = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
];

export const sobel3y = [
    -1, -2, -1,
    0,  0,  0,
    1,  2,  1
];

export const sobel5x = [
    -1, -2, 0, 2, 1,
    -4, -8, 0, 8, 4,
    -6,-12, 0,12, 6,
    -4, -8, 0, 8, 4,
    -1, -2, 0, 2, 1
];

export const sobel5y = [
    -1, -4, -6, -4, -1,
    -2, -8,-12, -8, -2,
     0,  0,  0,  0,  0,
     2,  8, 12,  8,  2,
     1,  4,  6,  4,  1
];

export const scharr3x = [
    -3, 0, 3,
    -10, 0, 10,
    -3, 0, 3
];

export const scharr3y = [
    -3, 10, 3,
    0, 0, 0,
    3, 10, 3
];

// 拉普拉斯算子
export const laplacian3 = [
    0, 1, 0,
    1, -4, 1, 
    0, 1, 0
];
