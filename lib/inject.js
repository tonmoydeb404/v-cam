import { patchMediaDevices } from "./patch.js";

window.addEventListener("message", (event) => {
  if (event?.data?.type !== "FROM_EXTENSION") return;

  const { ratioX, ratioY, zoomLevel } = event.data.data;

  console.log("Received storage values:", { ratioX, ratioY, zoomLevel });
  patchMediaDevices(ratioX, ratioY, zoomLevel);
});
