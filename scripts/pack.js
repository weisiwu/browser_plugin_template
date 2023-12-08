/* eslint-env node */
const fs = require("fs");
const path = require("path");
const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const replace = require("rollup-plugin-replace");
const polyfill = require("rollup-plugin-polyfill-node");
const commonjs = require("@rollup/plugin-commonjs");
const jsonimport = require("@rollup/plugin-json");
const less = require("rollup-plugin-less");
const clear = require("rollup-plugin-clear");
const chalk = require("chalk");
const ora = require("ora");
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const terser = require("@rollup/plugin-terser");
const alias = require("@rollup/plugin-alias");
const htmlTemplate = require("rollup-plugin-generate-html-template");

// TODO:(wsw) 单入口直接打开，多入口选择打开
const args = process.argv.slice(2);
const pagePath = path.join(__dirname, "../src/page");
// TODO:(wsw) configPath后续要替换掉
const configPath = path.join(__dirname, "../src/config.jsx");
const templatePath = path.join(__dirname, "../template/");
const popupPath = path.join(__dirname, "../src/index.js");
const mergePath = path.join(__dirname, "../src/merge.jsx");
const destPath = path.join(__dirname, "../dest");
const openHtml = "/config.html";
const parsedArgs = {};
args.forEach((arg) => {
  const matches = arg.match(/^--([^=]+)=(.*)$/);
  if (matches) {
    const key = matches[1];
    const value = matches[2];
    parsedArgs[key] = value;
  }
});
const is_production = parsedArgs.env === "production";

// rollup config:
//  https://rollupjs.org/configuration-options/#loglevel
const common_plugins = (is_production = false) => [
  clear({ targets: [destPath] }),
  alias({
    entries: [
      {
        find: "@package.json",
        replacement: path.join(__dirname, "../package.json"),
      },
      { find: "@style", replacement: path.join(__dirname, "../styles") },
      { find: "@template", replacement: path.join(__dirname, "../template") },
      { find: "@page", replacement: path.join(__dirname, "../src/pages") },
      {
        find: "@components",
        replacement: path.join(__dirname, "../src/components"),
      },
    ],
  }),
  replace({
    "process.env.NODE_ENV": is_production
      ? JSON.stringify("production")
      : JSON.stringify("development"),
  }), // 替换process.env.NODE_ENV
  polyfill(), // 调换node下的全局变量,编译的产物最后是在浏览器运行，所以要将node中独有的能力替换掉（比如process/events）
  jsonimport(),
  nodeResolve({ browser: true }),
  commonjs({ include: "node_modules/**" }), // 支持common模块，自定义module等变量
  less({ insert: true, output: false }),
  babel({
    babelrc: false,
    presets: [
      [
        "@babel/preset-env",
        { targets: "> 0.5%, last 2 versions, Firefox ESR, not dead" },
      ],
      ["@babel/preset-react"],
    ],
    exclude: "node_modules/**",
  }),
];
const raw_files = fs.readdirSync(path.join(__dirname, "../src/pages"));
const choices = raw_files
  .filter((file) => file)
  .map((file) => {
    return {
      type: "rawlist",
      name: file,
      message: `请选择需要调试的页面`,
      value: file,
    };
  });

function test_pack() {
  const test_plugins = common_plugins();

  const watchOptions = raw_files
    .map((fileName) => {
      const filePath = path.join(__dirname, "../src/pages", fileName);
      fsInfo = fs.statSync(filePath);
      if (!fsInfo.isFile()) return null;
      return {
        input: filePath,
        output: {
          format: "iife",
          dir: destPath,
          entryFileNames: "[name].[hash].min.js",
        },
        plugins: [
          ...test_plugins,
          htmlTemplate({
            template: `${templatePath}${fileName}.html`,
            target: `${destPath}/${fileName}.html`,
          }),
          // TODO:(wsw) 这里指定谁生效是个问题
          serve({
            open: true,
            contentBase: "dest",
            port: 5001,
            verbose: false,
            openPage: openHtml,
            onListening: function (server) {
              const address = server.address();
              const host =
                address.address === "::" ? "localhost" : address.address;
              const protocol = this.https ? "https" : "http";
              console.log(
                chalk.green(
                  `服务已启动: ${protocol}://${host}:${address.port}${openHtml}\n`,
                ),
              );
            },
          }),
          livereload({ watch: "dest", delay: 500 }),
        ],
        onwarn: () => {},
      };
    })
    .filter((file) => file);

  const watcher = rollup.watch(watchOptions);
  const spinner = ora("loading");

  watcher.on("event", (event) => {
    const { code, input } = event || {};
    let fileName = "";

    if (input) {
      const { name, ext } = path.parse(input) || {};
      fileName = `${name}${ext}`;
    }

    if (code === "START") {
      spinner.color = "yellow";
      spinner.text = chalk.green(
        `开始编译${fileName ? " => " + fileName : ""}~\n`,
      );
      spinner.start();
    }

    if (code === "BUNDLE_END") {
      spinner.stop();
      console.log(
        chalk.blue(`【${new Date().toISOString()}】更新${fileName}产物成功~\n`),
      );
    }

    if (code === "ERROR") {
      spinner.stop();
      console.error(chalk.red(`【编译错误】${event.error.stack}` || ""));
      watcher.close();
    }
  });

  watcher.on("change", (id, event) => {
    spinner.stop();
    const fileName = id.replace(`${__dirname}/`, "") || "";
    console.log(chalk.green(`【${fileName}】改动~\n`));
  });

  watcher.on("close", (id, event) => {
    console.log(chalk.red(`\n编译结束！\n`));
    process.exit(false);
  });
}

// 生产打包
function prod_pack() {
  const prod_plugins = common_plugins(true);
  prod_plugins.push(terser({ maxWorkers: 4 }));

  return Promise.all([
    rollup.rollup({
      input: { config: configPath },
      plugins: [
        ...prod_plugins,
        htmlTemplate({
          template: `${templatePath}config.html`,
          target: `${destPath}/config.html`,
        }),
      ],
      onwarn: () => {},
    }),
    rollup.rollup({
      input: { config: mergePath },
      plugins: [
        ...prod_plugins,
        htmlTemplate({
          template: `${templatePath}merge.html`,
          target: `${destPath}/merge.html`,
        }),
      ],
      onwarn: () => {},
    }),
    rollup.rollup({
      input: { popup: popupPath },
      plugins: [
        ...prod_plugins,
        htmlTemplate({
          template: `${templatePath}popup.html`,
          target: `${destPath}/popup.html`,
        }),
      ],
      onwarn: () => {},
    }),
  ])
    .then(([config_bundle, merge_bundle, popup_bundle]) => {
      return [
        [
          config_bundle.write({
            format: "iife",
            dir: destPath,
            entryFileNames: "[name].[hash].min.js",
          }),
          merge_bundle.write({
            format: "iife",
            dir: destPath,
            entryFileNames: "[name].[hash].min.js",
          }),
          popup_bundle.write({
            format: "iife",
            dir: destPath,
            entryFileNames: "[name].[hash].min.js",
          }),
        ],
        [config_bundle, merge_bundle, popup_bundle],
      ];
    })
    .then(([output, bundle]) => {
      bundle[0] && bundle[0].close();
      bundle[1] && bundle[1].close();
      bundle[2] && bundle[2].close();

      console.log(chalk.greenBright(`\n编译结束！\n`));
      return Promise.all(output);
    })
    .catch((e) => {
      spinner.stop();
      console.log(chalk.red(`\n编译错误！`));
      console.error(chalk.red(e.stack || ""));
      return false;
    });
}

// https://stackoverflow.com/questions/4981891/node-js-equivalent-of-pythons-if-name-main
if (require.main === module) {
  if (!choices?.length) {
    console.error(chalk.red(`【启动错误】pages文件夹下无入口页面！`));
  } else if (choices?.length === 1) {
    // 单个选项，直接执行
    const { value } = choices[0] || {};
    if (is_production) {
      prod_pack(value);
    } else {
      test_pack(value);
    }
  } else {
    import("inquirer").then(({ default: inquirer }) => {
      inquirer
        .prompt({
          type: "rawlist",
          name: "page",
          message: `请选择需要调试的页面`,
          choices,
        })
        .then((answer) => {
          console.log("wswTest: ", answer);
          const { page } = answer || {};
          if (!page) {
            console.error(chalk.red(`【启动错误】未选择调试页面！`));
          }
          if (is_production) {
            prod_pack(page);
          } else {
            test_pack(page);
          }
        });
    });
  }
}

module.exports = {
  test_pack,
  prod_pack,
};
