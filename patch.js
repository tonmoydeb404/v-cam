function monkeyPatchMediaDevices(ratioX, ratioY, zoomLevel) {
  // if (navigator.mediaDevices.__patched) {
  //   console.warn("MediaDevices already patched.");
  //   return;
  // }
  // navigator.mediaDevices.__patched = true;

  console.log("Patching MediaDevices to add virtual webcam...");

  const enumerateDevicesFn = MediaDevices.prototype.enumerateDevices;
  const getUserMediaFn = MediaDevices.prototype.getUserMedia;

  MediaDevices.prototype.enumerateDevices = async function () {
    console.log("Intercepting enumerateDevices...");
    const res = await enumerateDevicesFn.call(navigator.mediaDevices);
    res.push({
      deviceId: "virtual",
      groupID: "virtual-group",
      kind: "videoinput",
      label: "Virtual Chrome Webcam",
    });
    console.log("Virtual webcam added to device list.");
    return res;
  };

  MediaDevices.prototype.getUserMedia = async function (...args) {
    try {
      if (args.length && args[0].video?.deviceId) {
        if (
          args[0].video.deviceId === "virtual" ||
          args[0].video.deviceId.exact === "virtual"
        ) {
          console.log("Virtual webcam requested");

          const constraints = {
            video: {
              facingMode: args[0].facingMode,
              advanced: args[0].video.advanced,
              width: args[0].video.width || 1280,
              height: args[0].video.height || 720,
            },
            audio: false,
          };

          const stream = await getUserMediaFn.call(
            navigator.mediaDevices,
            constraints
          );
          return applyCroppingToStream(
            stream,
            constraints.video.width,
            constraints.video.height,
            ratioX,
            ratioY,
            zoomLevel
          );
        }
      }

      return await getUserMediaFn.call(navigator.mediaDevices, ...args);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  };

  console.log("VIRTUAL WEBCAM INSTALLED.");
}

/**
 * Applies a perfectly centered 6:19 crop to a media stream.
 */
function applyCroppingToStream(
  stream,
  originalWidth,
  originalHeight,
  ratioX,
  ratioY,
  zoomLevel
) {
  const { cropHeight, cropWidth } = calculateAspectRatio(
    Math.floor(originalWidth / zoomLevel),
    Math.floor(originalHeight / zoomLevel),
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
  return outputStream;
}

function calculateAspectRatio(originalWidth, originalHeight, ratioX, ratioY) {
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

  console.log(
    `Cropping video to ${ratioX}:${ratioY} ratio: ${cropWidth}x${cropHeight} from ${originalWidth}x${originalHeight}`
  );

  return { cropHeight, cropWidth };
}

export { monkeyPatchMediaDevices };
