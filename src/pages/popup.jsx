import React from "react";
import { createRoot } from "react-dom/client";
import { Layout } from "antd";
import { ErrorBoundary } from "react-error-boundary";
import { defaultStore, StoreContext } from "@base/src/store.js";
import { ErrorFallback } from "@components/ErrorFallback.jsx";
import "@styles/config.less";

// 直接跳转到用户面前
// https://stackoverflow.com/questions/3188384/google-chrome-extensions-open-new-tab-when-clicking-a-toolbar-icon
const prefix = "config-page";
const root = createRoot(document.getElementById("app"));

class ConfigPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contextState: defaultStore,
    };
    this.updateContext = this.updateContext.bind(this);
    this.handleSelectType = this.handleSelectType.bind(this);
  }

  render() {
    return (
      <StoreContext.Provider value={this.state.contextState}>
        <Layout>
          <Layout.Content></Layout.Content>
        </Layout>
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
    <Layout className={`${prefix}`}>
      <ConfigPage />
    </Layout>
  </ErrorBoundary>,
);
