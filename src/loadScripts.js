/**
 * 插件加载远程CDN代码
 */

const loadScriptFromCDN = (cdn) => {
  fetch(cdn)
    .then((response) => {
      console.log("wswTestresponse: ", response);
      if (response.ok) {
        return response.text();
      }
      throw new Error("Load CDN script fail, response was not ok.");
    })
    .then((scriptContent) => {
      console.log("wswTestscriptContent: ", scriptContent);
      // 这里我们已经获取了脚本的内容，存储在scriptContent变量中
      chrome.scripting.executeScript({
        // target: { tabId: tab.id },
        func: (script) => {
          console.log("wswTestscript: ", script);
          const scriptNode = document.createElement("script");
          scriptNode.textContent = script;
          document.head.appendChild(scriptNode);
          scriptNode.remove();
        },
        args: [scriptContent],
      });
    })
    .catch((error) => {
      console.error("Fetching script failed:", error);
    });
};

module.exports = { loadScriptFromCDN };
