/* eslint-env node */
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { capitalize, camelCase } = require("lodash");

const templatePath = path.join(__dirname, "..", "template");
const pagePath = path.join(__dirname, "..", "src", "pages");

if (require.main === module) {
  import("inquirer").then(({ default: inquirer }) => {
    inquirer
      .prompt({
        type: "input",
        name: "name",
        message: `输入需要新增的文件名: `,
        validate: (value) => {
          if (!value.trim()) {
            return "文件名不能为空，请重新输入！";
          }
          return true;
        },
      })
      .then((answer) => {
        const { name } = answer || {};
        const templateFile = path.join(templatePath, `${name}.html`);
        const logicFile = path.join(pagePath, `${name}.jsx`);
        const normalName = capitalize(camelCase(name));
        fs.writeFileSync(
          templateFile,
          `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="../assets/favicon.ico" type="image/x-icon" />
    <title></title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
        `,
        );
        fs.writeFileSync(
          logicFile,
          `
import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { StoreContext } from "@base/src/store.js";
import { ErrorFallback } from "@components/ErrorFallback.jsx";
import "@styles/config.less";

const prefix = "${name}";
const root = createRoot(document.getElementById("app"));

class ${normalName} extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StoreContext.Provider value={this.state}>
        <div className={\`\$\{prefix\}\`}></div>
      </StoreContext.Provider>
    );
  }

  componentDidMount() {}

  updateContext(newContext, cb) {
    if (!newContext) {
      return false;
    }
    this.setState(newContext, () => {
      if (typeof cb === "function") {
        cb();
      }
    });
  }
}

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <div className={\`\$\{prefix\}\`}>
      <${normalName} />
    </div>
  </ErrorBoundary>,
);
        `,
        );

        if (!fs.existsSync(templateFile)) {
          return console.log(chalk.red(`创建 ${name}.html 失败!`));
        } else if (!fs.existsSync(logicFile)) {
          return console.log(chalk.red(`创建 ${name}.jsx 失败!`));
        }
        console.log(chalk.green(`创建 ${name}.html、${name}.jsx 成功!`));
      });
  });
}

// module.exports = {};
