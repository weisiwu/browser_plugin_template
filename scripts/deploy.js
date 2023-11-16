/** @format */

const fs = require('fs');
const path = require('path');
const process = require('process');
const shell = require('shelljs');
const convert = require('xml-js');
const xml = require('xml');
const { simpleGit } = require('simple-git');
const ora = require('ora');
const chalk = require('chalk');
const { name, version } = require('../package.json');
const { prod_pack } = require('./pack.js');

const spinner = ora('loading');
const zipName = `${name}v${version}`;
const latestZipName = `${name}-latest`;
const updateXmlName = 'plugin-update-info';
const depositeUrl = 'https://xxx';
const remoteGit = 'git@xxx/xxx.git';
const baseDir = path.resolve(__dirname, '../');
const subModuleDir = path.resolve(baseDir, 'auto_update');
const git = simpleGit({
  baseDir: subModuleDir,
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
});
// 目前就是直接将debug生成的代码打zip包，并拷贝改名crx
spinner.color = 'blue';
spinner.text = chalk.blueBright(`[发布]开始打包 ${name} ${version}\n`);
spinner.start();

function checkRemoteVersion() {
  return new Promise((resolve, reject) => {
    let remoteVersion = '';
    try {
      const cmd = `git archive --remote=${remoteGit} master public/plugin-update-info.xml | tar -xO`;
      shell.exec(cmd, (err, res, stderr) => {
        if (err || stderr) {
        }
        try {
          const { updates = {} } = JSON.parse(convert.xml2json(res, { compact: true, spaces: 2 })) || {};
          remoteVersion = updates?.update?._attributes?.version || '';
        } catch (e) {
          throw new Error('解析xml失败');
        }
        resolve(true);
      });
    } catch (e) {
      console.error(chalk.red(`\n[发布]: 本地待发布版本小于等于远程托管中的版本`));
      console.error(chalk.red(`\n本地 ${version}`));
      console.error(chalk.red(`\n远程托管 ${remoteVersion}`));
      reject(e);
    }
  });
}

// 将所有更新的托管文件移动到对应文件夹下，同时xml也需要更新一下
function cpDepositeFile() {
  return new Promise((resolve, reject) => {
    try {
      const xmlString = xml(
        {
          updates: [
            {
              update: [
                { _attr: { version: version } },
                { url: `${depositeUrl}/${latestZipName}.zip` },
                { manifest: `${depositeUrl}/manifest.json` },
              ],
            },
          ],
        },
        { declaration: true, indent: '  ' }
      );
      const updateXmlPath = path.resolve(__dirname, `../auto_update/public/${updateXmlName}.xml`);
      const manifestPath = path.resolve(__dirname, `../manifest.json`);
      const crxFilePath = path.resolve(__dirname, `../build/${version}/${zipName}.crx`);
      const zipFilePath = path.resolve(__dirname, `../build/${version}/${zipName}.zip`);
      fs.writeFileSync(updateXmlPath, xmlString);
      fs.copyFileSync(manifestPath, path.resolve(__dirname, '../auto_update/public/manifest.json'));
      fs.copyFileSync(crxFilePath, path.resolve(__dirname, `../auto_update/public/${latestZipName}.crx`));
      fs.copyFileSync(zipFilePath, path.resolve(__dirname, `../auto_update/public/${latestZipName}.zip`));
      resolve(true);
    } catch (e) {
      console.error(chalk.red(`\n[发布]: copy资料发生错误`));
      reject(e);
    }
  });
}

// 检查submodule是否存在。不存在就拉bundle
function checkDirExsist() {
  try {
    // 子路径下的.git目录不存在
    if (!fs.existsSync(`${baseDir}/.git`)) {
      return git
        .init()
        .reset('hard')
        .addRemote('origin', remoteGit)
        .fetch(`origin`, 'master')
        .checkout('master')
        .pull('origin', 'master');
    }
  } catch (e) {
    console.error(chalk.red(`\n[发布]: 拉取submodule失败`));
    throw e;
  }
}

// 保存提交代码
function saveDepositeFile() {
  try {
    const publicPath = path.resolve(subModuleDir, 'public');
    process.chdir(publicPath);
    return git.add('./').commit(`[auto_update]发布 ${name} ${version}`).push('origin', 'master');
  } catch (e) {
    console.error(chalk.red(`\n[发布]: 推送更新到托管服务失败`));
    throw e;
  }
}

// 确认部署状态，ok后提示并退出
function checkDepositeStatus() {
  return new Promise((resolve, reject) => {
    let remoteVersion = '';
    try {
      const cmd = `git archive --remote=${remoteGit} master public/plugin-update-info.xml | tar -xO`;
      shell.exec(cmd, (err, res, stderr) => {
        if (err || stderr) {
        }
        try {
          const { updates = {} } = JSON.parse(convert.xml2json(res, { compact: true, spaces: 2 })) || {};
          remoteVersion = updates?.update?._attributes?.version || '';
          if (remoteVersion === version) {
            resolve(true);
            console.error(chalk.green(`\n[发布]: ${name} ${version} 发布成功☺️~`));
          } else {
            reject({ stack: '未能确认更新生效，版本比较错误' });
          }
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      console.error(chalk.red(`\n[发布]: 确认更新是否生效失败`));
      console.error(chalk.red(`\n本地 ${version}`));
      console.error(chalk.red(`\n远程托管 ${remoteVersion}`));
      reject(e);
    }
  });
}

// 编译
prod_pack()
  .then((result) => {
    spinner.stop();
    // 有一个结果是错误的，则停止打包
    if (!result[0] || !result[1]) {
      return console.error(chalk.red(`\n[发布]: 编译生成发布包错误`));
    }
  })
  .then(checkRemoteVersion)
  .then(cpDepositeFile)
  .then(checkDirExsist)
  .then(saveDepositeFile)
  .then(checkDepositeStatus)
  .catch((e) => {
    return console.error(chalk.red(e.stack));
  });
