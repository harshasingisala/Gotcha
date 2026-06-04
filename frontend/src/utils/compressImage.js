import imageCompression from "browser-image-compression";

export async function compressImage(file) {
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  };

  return imageCompression(file, options);
}
