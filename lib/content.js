chrome.storage.sync.get(["ratioX", "ratioY", "zoomLevel"], (result) => {
  console.log({ result });

  const storedData = {
    ratioX: result.ratioX || 16, // Default value if not set
    ratioY: result.ratioY || 9,
    zoomLevel: result.zoomLevel || 1,
  };

  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", chrome.runtime.getURL("js/main.js"));

  const head =
    document.head ||
    document.getElementsByTagName("head")[0] ||
    document.documentElement;

  head.insertBefore(script, head.lastChild);

  script.onload = () => {
    console.log("Script loaded, sending message...");
    window.postMessage({ type: "FROM_EXTENSION", data: storedData }, "*");
  };
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log({ message });

  if (message.type === "UPDATE_SETTINGS") {
    const storedData = {
      ratioX: message?.settings?.ratioX || 16,
      ratioY: message?.settings?.ratioY || 9,
      zoomLevel: message?.settings?.zoomLevel || 1,
    };

    console.log("Settings Updated...");
    window.postMessage({ type: "FROM_EXTENSION", data: storedData }, "*");

    sendResponse({ success: true });
  }
});
