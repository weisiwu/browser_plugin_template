/** @format */

import axios from 'axios';
import { version as localVersion } from '../package.json';
const search = document.getElementById('search');
const merge = document.getElementById('merge');
const update = document.getElementById('update');
const pluginConfigURL = 'https://xxx/manifest.json';

const initPlugin = () => {
  if (search) {
    search.addEventListener('click', () => {
      chrome.tabs.create({
        url: '../dest/config.html',
      });
    });
  }

  if (merge) {
    merge.addEventListener('click', () => {
      chrome.tabs.create({
        url: '../dest/merge.html',
      });
    });
  }

  if (update) {
    axios.get(pluginConfigURL).then((response) => {
      const { version } = response.data || {};
      const hasNewVersion = document.getElementById('hasNewVersion');
      if (version !== localVersion && hasNewVersion) {
        hasNewVersion.style.display = 'block';
      }
    });
    update.addEventListener('click', () => {
      checkForUpdates();
    });
  }
};

initPlugin();

// 检查更新的函数
function checkForUpdates() {
  // 发送一个 HTTP 请求，获取 manifest.json 文件的内容
  var request = new XMLHttpRequest();
  update.innerHTML = "<img class='icon' src='../assets/update.png' /><p>检查中</p>";
  request.open('GET', 'https://xxx/manifest.json', true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // 解析 manifest.json 文件的内容
      var manifest = JSON.parse(request.responseText);

      // 获取当前扩展程序的版本号
      var currentVersion = chrome.runtime.getManifest().version;

      // 比较当前版本号和 manifest.json 文件中的版本号
      if (currentVersion !== manifest.version) {
        // alert('拉取梵天二维码插件有更新，正在自动更新');
        console.log('Updating extension to version ' + manifest.version);

        update.innerHTML = "<img class='icon' src='../assets/update.png' /><p>下载代码中</p>";
        // 更新扩展程序
        chrome.downloads.download(
          {
            url: 'https://xxxx/latest.zip',
            filename: `test${manifest.version}.zip`,
          },
          () => {
            update.innerHTML = "<img class='icon' src='../assets/update.png' /><p>下载完成</p>";
          }
        );
      } else {
        update.innerHTML = "<img class='icon' src='../assets/update.png' /><p>已是最新</p>";
        console.log('Extension is up to date');
      }
    } else {
      update.innerHTML = "<img class='icon' src='../assets/update.png' /><p>已是最新</p>";
    }
  };
  request.send();
}
