import { CropType } from "./types";

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
  compressWidth?: number
): Promise<HTMLCanvasElement> => {
  let imgTarget = source;
  const handleDrawImage = (target: HTMLImageElement) => {
    const canvasEle = document.createElement("canvas");
    const canvasCtx = canvasEle.getContext("2d");

    canvasEle.width = compressWidth || target.width;
    canvasEle.height = compressWidth || target.height;

    // eslint-disable-next-line no-unused-expressions
    canvasCtx?.drawImage(target, 0, 0, canvasEle.width, canvasEle.height);

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

/**
 * 获取imageData
 * @param source string | HTMLImageElement | HTMLCanvasElement
 */
export const getImageData = (
  source: string | HTMLImageElement | HTMLCanvasElement
): Promise<ImageData> => {
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

/**
 * 裁剪图像区域
 * @param image HTMLImageElement src 原图像
 * @param crop 裁剪区域 optional
 * @returns Promise<{url, file}>
 */
export const makeImageCrop = (image: HTMLImageElement, crop?: CropType) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop?.width || image.width;
  canvas.height = crop?.height || image.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    (crop?.x || 0) * scaleX,
    (crop?.y || 0) * scaleY,
    (crop?.width || image.width) * scaleX,
    (crop?.height || image.height) * scaleY,
    0,
    0,
    crop?.width || image.width,
    crop?.height || image.height
  );

  return new Promise(resolve => {
    const fileName = "newCropImg.jpg";
    canvas.toBlob((blob: Blob) => {
      // blob.name = fileName;
      // eslint-disable-next-line no-new
      const cropFile = new File([blob], fileName, {
        type: "image/jpeg"
      });
      resolve({ url: window.URL.createObjectURL(blob), file: cropFile });
    }, "image/jpeg");
  });
};

export default imgLoader;
