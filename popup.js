document.addEventListener("DOMContentLoaded", () => {
  const enable = document.getElementById("enable");
  const aspectRatio = document.getElementById("aspectRatio");
  const zoomLevel = document.getElementById("zoomLevel");
  const apply = document.getElementById("apply");

  // Load stored values
  chrome.storage.sync.get(["enable", "aspectRatio", "zoomLevel"], (data) => {
    enable.checked = !!data.enable;
    aspectRatio.value = data.aspectRatio || "auto";
    zoomLevel.value = data.zoomLevel || 1;
  });

  // Save settings
  apply.addEventListener("click", () => {
    chrome.storage.sync.set({
      enable: enable.checked,
      aspectRatio: aspectRatio.value,
      zoomLevel: parseFloat(zoomLevel.value),
    });
  });
});
