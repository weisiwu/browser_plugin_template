import React from "react";
import { createRoot } from "react-dom/client";
import { Layout } from "antd";
import { ErrorBoundary } from "react-error-boundary";
import { StoreContext } from "@base/src/store.js";
import { ErrorFallback } from "@components/ErrorFallback.jsx";
import "@styles/config.less";

const prefix = "testBig";
const root = createRoot(document.getElementById("app"));

class Testbig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StoreContext.Provider value={this.state}>
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
      <Testbig />
    </Layout>
  </ErrorBoundary>,
);
