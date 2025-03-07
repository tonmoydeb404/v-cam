import { devLog } from "./helpers.js";

// Configuartions ----------------------------------------------------------------------

const MEDIA_DEVICE_ID = "v-cam";
const MEDIA_GROUP_ID = "v-cam_group";
const MEDIA_LABEL = "vCam v1.0";

// Global Variables ----------------------------------------------------------------------

const enumerateDevicesFn = MediaDevices.prototype.enumerateDevices;
const getUserMediaFn = MediaDevices.prototype.getUserMedia;

// Helpers ----------------------------------------------------------------------

/**
 * Calculate zoomed dimension
 * @param {number} originalWidth
 * @param {number} originalHeight
 * @param {number} zoomLevel
 * @returns
 */
function calculateZoomedDimension(originalWidth, originalHeight, zoomLevel) {
  return {
    width: Math.floor(originalWidth / zoomLevel),
    height: Math.floor(originalHeight / zoomLevel),
  };
}

/**
 * Calculate cropped dimension from aspect ratio
 * @param {number} originalWidth
 * @param {number} originalHeight
 * @param {number | undefined} ratioX
 * @param {number | undefined} ratioY
 * @returns
 */
function calculateCroppedDimension(
  originalWidth,
  originalHeight,
  ratioX,
  ratioY
) {
  if (typeof ratioX !== "number" || typeof ratioY !== "number") {
    return { cropHeight: originalHeight, cropWidth: originalWidth };
  }

  const targetAspectRatio = ratioX / ratioY;
  const originalAspectRatio = originalWidth / originalHeight;

  let cropWidth, cropHeight;

  if (originalAspectRatio > targetAspectRatio) {
    // Crop width to match target aspect ratio
    cropWidth = Math.floor(originalHeight * targetAspectRatio);
    cropHeight = originalHeight;
  } else {
    // Crop height to match target aspect ratio
    cropWidth = originalWidth;
    cropHeight = Math.floor(originalWidth / targetAspectRatio);
  }

  devLog(
    `Cropping video to ${ratioX}:${ratioY} ratio: ${cropWidth}x${cropHeight} from ${originalWidth}x${originalHeight}`
  );

  return { cropHeight, cropWidth };
}

/**
 * Functionality to apply crop on stream
 * @param {MediaStream} stream
 * @param {number} originalWidth
 * @param {number} originalHeight
 * @param {number | undefined} ratioX
 * @param {number | undefined} ratioY
 * @returns
 */
function applyCroppingToStream(
  stream,
  originalWidth,
  originalHeight,
  ratioX,
  ratioY
) {
  const { cropHeight, cropWidth } = calculateCroppedDimension(
    originalWidth,
    originalHeight,
    ratioX,
    ratioY
  );

  // Correctly center the crop
  const cropX = Math.floor((originalWidth - cropWidth) / 2);
  const cropY = Math.floor((originalHeight - cropHeight) / 2);

  const videoTrack = stream.getVideoTracks()[0];
  const video = document.createElement("video");
  video.srcObject = new MediaStream([videoTrack]);
  video.play();

  const canvas = document.createElement("canvas");
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext("2d");

  function drawFrame() {
    ctx.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    requestAnimationFrame(drawFrame);
  }

  drawFrame();

  const outputStream = canvas.captureStream();

  // Stop the original stream when outputStream is stopped
  outputStream.getTracks().forEach((track) => {
    const stop = track.stop;
    track.stop = () => {
      try {
        stream.getTracks().forEach((originalTrack) => originalTrack.stop());
        devLog("Original output stream stopped");
      } catch (error) {
        devLog("Failed to stop original output stream");
      } finally {
        stop.call(track);
      }
    };
  });

  return outputStream;
}

// ----------------------------------------------------------------------

/**
 * Patch media devices & create virtual media input
 * @param {boolean} enable
 * @param {number | undefined} ratioX
 * @param {number | undefined} ratioY
 * @param {number} zoomLevel
 */
function patchMediaDevices(enable, ratioX, ratioY, zoomLevel) {
  if (!enable) {
    MediaDevices.prototype.enumerateDevices = enumerateDevicesFn;
    MediaDevices.prototype.getUserMedia = getUserMediaFn;
    devLog(MEDIA_LABEL, "DISABLED");
    return;
  }

  MediaDevices.prototype.enumerateDevices = async function () {
    devLog("Intercepting enumerateDevices...");
    const res = await enumerateDevicesFn.call(navigator.mediaDevices);

    // Include virtual cam only if there is already a real camera
    if (res.findIndex((r) => r?.kind === "videoinput") !== -1) {
      res.push({
        deviceId: MEDIA_DEVICE_ID,
        groupID: MEDIA_GROUP_ID,
        kind: "videoinput",
        label: MEDIA_LABEL,
      });
      devLog("Virtual webcam added to device list.");
    }

    return res;
  };

  MediaDevices.prototype.getUserMedia = async function (...args) {
    try {
      if (args.length && args[0].video?.deviceId) {
        if (
          args[0].video.deviceId === MEDIA_DEVICE_ID ||
          args[0].video.deviceId.exact === MEDIA_DEVICE_ID
        ) {
          devLog(`${MEDIA_LABEL} requested`);

          const width =
            args[0].video?.width?.ideal ||
            args[0].video?.width?.exact ||
            args[0].video?.width;

          const height =
            args[0].video?.height?.ideal ||
            args[0].video?.height?.exact ||
            args[0].video?.height;

          const constraints = {
            video: {
              facingMode: args[0].facingMode,
              advanced: args[0].video.advanced,
              width: typeof width === "number" ? width : 1280,
              height: typeof height === "number" ? height : 720,
            },
            audio: false,
          };

          const stream = await getUserMediaFn.call(
            navigator.mediaDevices,
            constraints
          );

          const zoomedDimension = calculateZoomedDimension(
            constraints.video.width,
            constraints.video.height,
            zoomLevel
          );

          return applyCroppingToStream(
            stream,
            zoomedDimension.width,
            zoomedDimension.height,
            ratioX,
            ratioY
          );
        }
      }

      return await getUserMediaFn.call(navigator.mediaDevices, ...args);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  };

  devLog(MEDIA_LABEL, "INSTALLED.");
}

export { patchMediaDevices };
