/* eslint-env node */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const ora = require('ora');
const chalk = require('chalk');
const fsExtra = require('fs-extra');
const { name, version } = require('../package.json');
const manifest = require('../manifest.json');
const { prod_pack } = require('./pack.js');

const zipName = `${name}v`;
const spinner = ora('loading');
const manifestPath = path.resolve(__dirname, '../manifest.json');

// 目前就是直接将debug生成的代码打zip包，并拷贝改名crx
spinner.color = 'blue';
spinner.text = chalk.blueBright(`开始编译 ${name} ${version}\n`);
spinner.start();

if (!version) {
  spinner.stop();
  return console.error(chalk.red(`\n[build错误]: version 为空`));
}

// 编译
prod_pack().then((result) => {
  spinner.text = chalk.blueBright(`开始打包 ${name} ${version}\n`);
  // 有一个结果是错误的，则停止打包
  if (!result[0] || !result[1]) {
    spinner.stop();
    return console.error(chalk.red(`\n[build错误]: 编译生成步骤错误`));
  }

  // 修改manifest.json中版本
  if (manifest.version) {
    manifest.version = version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.info(chalk.blue(`\n[build信息]: 升级manifest version为${version}`));
  }

  const dirPath = path.join(__dirname, `../build/${version}`);
  const tmpDir = path.resolve(dirPath, './tmp');

  if (!fs.existsSync(tmpDir)) fsExtra.mkdirsSync(tmpDir);
  process.chdir(tmpDir);
  console.info(chalk.blue(`\n[build信息]: 进入${dirPath}`));
  const srcPath = path.resolve(__dirname, '../');

  try {
    fs.cpSync(path.join(srcPath, 'dest'), path.join(tmpDir, 'dest'), { recursive: true });
    fs.cpSync(path.join(srcPath, 'assets'), path.join(tmpDir, 'assets'), { recursive: true });
    fs.cpSync(path.join(srcPath, 'src'), path.join(tmpDir, 'src'), { recursive: true });
    fs.cpSync(path.join(srcPath, 'styles'), path.join(tmpDir, 'styles'), { recursive: true });
    fs.cpSync(path.join(srcPath, 'manifest.json'), path.join(tmpDir, 'manifest.json'));
    fs.cpSync(path.join(srcPath, 'package.json'), path.join(tmpDir, 'package.json'));
    fs.cpSync(path.join(srcPath, 'README.md'), path.join(tmpDir, 'README.md'));
  } catch (e) {
    spinner.stop();
    console.error(chalk.red(`\n[build错误]: copy资料发生错误`));
    return console.error(chalk.red(e.stack));
  }

  console.info(chalk.blue(`\n[build信息]: copy完成`));

  const totalZipName = `${dirPath}/${zipName}${version}.zip`;
  const totalCrxName = `${dirPath}/${zipName}${version}.crx`;
  const output = fs.createWriteStream(totalZipName);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  output.on('close', () => {
    console.info(chalk.blue(`\n[build信息]: zip打包完成，共${archive.pointer()}字节\n`));
    // 复制一份，并改名
    packCrx();
  });

  archive.on('error', (err) => {
    spinner.stop();
    console.error(chalk.red(`\n[build错误]: 建立归档发生错误`));
    return console.error(chalk.red(err.stack));
  });

  archive.pipe(output);

  // 添加文件到zip包中
  archive.directory(tmpDir, false, { includeDir: true });

  // 完成zip打包
  archive.finalize();

  function packCrx() {
    const crx = require('crx');
    const keyPath = path.join(__dirname, '../pem/getQrCode.pem'); // 私钥的路径
    const crxPath = path.resolve('./', totalCrxName); // CRX文件的输出路径
    const extPath = tmpDir; // 扩展程序目录的路径

    // https://github.com/thom4parisot/crx
    const crxGenerator = new crx({
      privateKey: fs.readFileSync(keyPath),
      rootDirectory: extPath,
    });

    crxGenerator
      .load(extPath)
      .then((crx) => crx.pack())
      .then((crxBuffer) => {
        fs.writeFileSync(crxPath, crxBuffer);
        console.info(chalk.greenBright(`\n[build信息]: 创建crx文件成功`));
      })
      .then(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        console.info(chalk.blue(`\n[build信息]: 删除临时tmp文件夹`));
        spinner.stop();
      })
      .catch((err) => {
        spinner.stop();
        console.error(chalk.red(`\n[build错误]: 建立归档发生错误`));
        return console.error(chalk.red(err.stack));
      });
  }
});
