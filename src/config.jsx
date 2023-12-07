import React from "react";
import { createRoot } from "react-dom/client";
import { Layout, Radio } from "antd";
import Icon, { QrcodeOutlined, FileTextOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "react-error-boundary";
import { PageHeader } from "./components/PageHeader.jsx";
import { ProjectIntro } from "./components/ProjectIntro.jsx";
import { QRSlider } from "./components/QRSlider.jsx";
import { ErrorFallback } from "./components/ErrorFallback.jsx";
import { defaultStore, StoreContext } from "./store.js";
import { _pluginConfig } from "../package.json";
import "../styles/config.less";

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
        <PageHeader />
        <Layout>
          <StoreContext.Consumer>
            {({ project }) => (
              <ProjectIntro
                {...project}
                contextState={this.state.contextState}
                fetchFTInfo={this.fetchFTInfo}
                updateContext={this.updateContext}
              />
            )}
          </StoreContext.Consumer>
          <Layout>
            <Layout.Header
              style={{ textAlign: "center", background: "#f5f5f5" }}
            >
              <Radio.Group
                defaultValue={btnTypes.CODE}
                size="large"
                onChange={this.handleSelectType}
              >
                <Radio.Button
                  value={btnTypes.CODE}
                  style={{ width: "180px", textAlign: "center" }}
                >
                  <Icon
                    component={FileTextOutlined}
                    style={{ margin: "0px 12px 0px 0px" }}
                  />
                  test
                </Radio.Button>
                <Radio.Button
                  value={btnTypes.TESTING}
                  style={{ width: "180px", textAlign: "center" }}
                >
                  <Icon
                    component={QrcodeOutlined}
                    style={{ margin: "0px 12px 0px 0px" }}
                  />
                  test
                </Radio.Button>
              </Radio.Group>
            </Layout.Header>
            <Layout.Content>
              <StoreContext.Consumer>
                {({ qrcode, testingCode, testingCodeName }) => (
                  <QRSlider
                    {...qrcode}
                    codeType={this.state.contextState.selectType}
                    testingCode={testingCode}
                    testingCodeName={testingCodeName}
                    updateContext={this.updateContext}
                  />
                )}
              </StoreContext.Consumer>
            </Layout.Content>
          </Layout>
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
