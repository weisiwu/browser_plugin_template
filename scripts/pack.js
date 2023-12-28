/* eslint-env node */
const fs = require("fs");
const ora = require("ora");
const path = require("path");
const rollup = require("rollup");
const chalk = require("chalk");
const tailwindcss = require("tailwindcss");
const babel = require("rollup-plugin-babel");
const replace = require("rollup-plugin-replace");
const polyfill = require("rollup-plugin-polyfill-node");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const jsonimport = require("@rollup/plugin-json");
const clear = require("rollup-plugin-clear");
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const terser = require("@rollup/plugin-terser");
const alias = require("@rollup/plugin-alias");
const postcss = require("rollup-plugin-postcss");
const htmlTemplate = require("rollup-plugin-generate-html-template");

const args = process.argv.slice(2);
const templatePath = path.join(__dirname, "../template");
const entryPath = path.join(__dirname, "../src/pages");
const destPath = path.join(__dirname, "../dest");
const parsedArgs = {};
args.forEach((arg) => {
  const matches = arg.match(/^--([^=]+)=(.*)$/);
  if (matches) {
    const key = matches[1];
    const value = matches[2];
    parsedArgs[key] = value;
  }
});

const port = parsedArgs.port || 5001;
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
      { find: "@base", replacement: path.join(__dirname, "../") },
      { find: "@styles", replacement: path.join(__dirname, "../styles") },
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
  postcss({
    plugins: [tailwindcss],
    minimize: true,
    use: ["less"],
  }),
  polyfill(), // 调换node下的全局变量,编译的产物最后是在浏览器运行，所以要将node中独有的能力替换掉（比如process/events）
  jsonimport(),
  nodeResolve({ browser: true, extensions: ["js"] }),
  commonjs({ include: "node_modules/**" }), // 支持common模块，自定义module等变量
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
const entry_files = fs.readdirSync(entryPath);
const choices = entry_files
  .filter((file) => file)
  .map((file) => {
    return {
      type: "rawlist",
      name: file,
      message: `请选择需要调试的页面`,
      value: file,
    };
  });

function test_pack(page_name) {
  const test_plugins = common_plugins();

  const watchOptions = entry_files
    .map((fileName) => {
      const filePath = path.join(__dirname, "../src/pages", fileName);
      const [current_name] = fileName.split(".");
      if (!fs.existsSync(filePath)) return null;
      fsInfo = fs.statSync(filePath);
      if (!fsInfo.isFile()) return null;
      const servePlugins =
        page_name === current_name
          ? [
              serve({
                open: true,
                contentBase: "dest",
                port,
                verbose: false,
                openPage: `/${current_name}.html`,
                onListening: function (server) {
                  const address = server.address();
                  const host =
                    address.address === "::" ? "localhost" : address.address;
                  const protocol = this.https ? "https" : "http";
                  console.log(
                    chalk.green(
                      `服务已启动: ${protocol}://${host}:${address.port}/${current_name}.html\n`,
                    ),
                  );
                },
              }),
              livereload({ watch: "dest", delay: 500 }),
            ]
          : [];

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
            template: `${templatePath}/${current_name}.html`,
            target: `${destPath}/${current_name}.html`,
          }),
          ...servePlugins,
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
      console.log("wswTest: ", event);
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
  const spinner = ora("loading");
  const prod_plugins = common_plugins(true);
  prod_plugins.push(terser({ maxWorkers: 4 }));

  const entry_tasks = entry_files
    .filter((entry) => entry.endsWith(".jsx"))
    .map((entry) => {
      const fileName = entry.split(".")[0] || "";
      return rollup.rollup({
        input: { config: `${entryPath}/${entry}` },
        plugins: [
          ...prod_plugins,
          htmlTemplate({
            template: `${templatePath}/${fileName}.html`,
            target: `${destPath}/${fileName}.html`,
          }),
        ],
        onwarn: () => {},
      });
    });

  return Promise.all(entry_tasks)
    .then((task_results) => {
      return [
        task_results.map((result) =>
          result.write({
            format: "iife",
            dir: destPath,
            entryFileNames: "[name].[hash].min.js",
          }),
        ),
        task_results,
      ];
    })
    .then(([output, bundle]) => {
      for (let i = 0; i < output.length; i++) {
        if (bundle[i] && output[i]) {
          bundle[i] && bundle[i].close();
        }
      }

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
          const { page } = answer || {};
          if (!page) {
            console.error(chalk.red(`【启动错误】未选择调试页面！`));
          }
          const [page_name] = page.split(".");
          if (is_production) {
            prod_pack(page_name);
          } else {
            test_pack(page_name);
          }
        });
    });
  }
}

module.exports = {
  test_pack,
  prod_pack,
};
