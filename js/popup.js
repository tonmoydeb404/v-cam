// Elements ----------------------------------------------------------------------
const enable = document.getElementById("enable");
const aspectRatio = document.getElementById("aspectRatio");
const zoomLevel = document.getElementById("zoomLevel");

// Load stored values
chrome.storage.sync.get(["enable", "ratioX", "ratioY", "zoomLevel"], (data) => {
  enable.checked = !!data.enable;
  aspectRatio.value =
    data.ratioX && data.ratioY ? `${data.ratioX}/${data.ratioY}` : "auto";
  zoomLevel.value = data.zoomLevel || 1;
});

// Function to save settings
function saveSettings() {
  let ratioX = null;
  let ratioY = null;

  if (aspectRatio.value && aspectRatio.value !== "auto") {
    const ratios = aspectRatio.value.split("/");
    ratioX = parseInt(ratios[0]) || null;
    ratioY = parseInt(ratios[1]) || null;
  }

  const settings = {
    enable: enable.checked,
    ratioX,
    ratioY,
    zoomLevel: parseFloat(zoomLevel.value),
  };
  chrome.storage.sync.set(settings);
  chrome.runtime.sendMessage({ type: "UPDATE_SETTINGS", settings });
}

// Add event listeners for instant updates
enable.addEventListener("change", saveSettings);
aspectRatio.addEventListener("input", saveSettings);
zoomLevel.addEventListener("input", saveSettings);
