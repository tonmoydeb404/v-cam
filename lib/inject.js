import { devLog } from "./helpers.js";
import { patchMediaDevices } from "./media-patcher.js";

window.addEventListener("message", (event) => {
  if (event?.data?.type !== "VCAM_SETTINGS") return;

  const settings = {
    enable: event.data?.settings?.enable ?? true,
    ratioX: event.data?.settings?.ratioX || undefined,
    ratioY: event.data?.settings?.ratioY || undefined,
    zoomLevel: event.data?.settings?.zoomLevel || 1,
  };

  devLog("Received settings:", event.data?.settings);
  devLog("Modified settings:", settings);
  patchMediaDevices(
    settings.enable,
    settings.ratioX,
    settings.ratioY,
    settings.zoomLevel
  );
});
