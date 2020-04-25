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

// rgb: [[r,g,b],[r,g,b], ...];
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

export default imgLoader;
