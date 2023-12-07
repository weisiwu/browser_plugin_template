/** @format */

chrome.runtime.onInstalled.addListener(function () {
  console.log("Checking for updates...");

  // 调用检查更新的函数
  checkForUpdates();
});

// 检查更新的函数
function checkForUpdates() {
  // 发送一个 HTTP 请求，获取 manifest.json 文件的内容
  const request = new XMLHttpRequest();
  request.open("GET", chrome.runtime.getURL("https://xxx/manifest.json"), true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // 解析 manifest.json 文件的内容
      const manifest = JSON.parse(request.responseText);

      // 获取当前扩展程序的版本号
      const currentVersion = chrome.runtime.getManifest().version;

      // 比较当前版本号和 manifest.json 文件中的版本号
      if (currentVersion !== manifest.version) {
        console.log("Updating extension to version " + manifest.version);

        // 更新扩展程序
        chrome.downloads.download({
          url: "https://xxx/latest.zip",
          filename: `latest-v${manifest}.zip`,
        });
      } else {
        console.log("Extension is up to date");
      }
    }
  };
  request.send();
}
