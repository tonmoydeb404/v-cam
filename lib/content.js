// Initiate web page with initial settings  ----------------------------------------------------------------------
chrome.storage.sync.get(
  ["ratioX", "ratioY", "zoomLevel", "enable"],
  (result) => {
    const script = document.createElement("script");
    script.setAttribute("type", "module");
    script.setAttribute("src", chrome.runtime.getURL("lib/inject.js"));

    const head =
      document.head ||
      document.getElementsByTagName("head")[0] ||
      document.documentElement;

    head.insertBefore(script, head.lastChild);

    script.onload = () => {
      console.log("Script loaded, sending message...");
      window.postMessage({ type: "VCAM_SETTINGS", settings: result }, "*");
    };
  }
);

// Update Settings to the web page ----------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_SETTINGS") {
    console.log("Settings Updated...");
    window.postMessage(
      { type: "VCAM_SETTINGS", settings: message.settings ?? {} },
      "*"
    );

    sendResponse({ success: true });
  }
});
