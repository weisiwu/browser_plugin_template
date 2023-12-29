import React, { Suspense } from "react";
import { Button, VStack, Spinner, ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { StoreContext } from "@base/src/store.js";
import { ErrorFallback } from "@components/ErrorFallback.jsx";
import "@styles/popup.less";
import { popup } from "@base/config.json";

const LazyIcons = React.lazy(() => import("@chakra-ui/icons"));

const prefixCls = "popup-page";
const LAYOUT = {
  BUTTON: "button", // popup为自上到下平展开来的按钮
};
const ACTIONS = {
  OPEN_PAGE: "open_page",
  JUMP_URL: "jump_url",
};
const root = createRoot(document.getElementById("app"));
const { layout, btns = [] } = popup || {};

/**
 * 通过配置快速生成popup
 */
class PopupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.buttonWidth = props.buttonWidth || 100;
  }

  componentDidMount() {}

  clickButton = (action, params) => {
    if (!action || !params) {
      return;
    }

    if (action === ACTIONS.OPEN_PAGE) {
      chrome?.tabs?.create?.({ url: `../dest/${params}.html` });
    } else if (action === ACTIONS.JUMP_URL) {
      chrome?.tabs?.create?.({ url: params });
    }
  };

  /**
   * 支持两种icon类型
   * 1、内嵌资源
   * 2、ChakraIcon: 以CI_前缀开头
   */
  renderIcon = (icon) => {
    if (!icon || typeof icon !== "string") {
      return null;
    }
    if (icon.startWith("CI_")) {
      const _icon = icon.replace("CI_", "");
      const Icon = LazyIcons[_icon];
      console.log("wswTest: ", LazyIcons);
      console.log("wswTest: _icon", _icon);
      return (
        <Suspense fallback={<Spinner />}>
          <Icon />
        </Suspense>
      );
    }
    // 内嵌资源
  };

  renderLayout = () => {
    switch (layout) {
      case LAYOUT.BUTTON:
      default:
        return this.renderButtonLayout();
    }
  };

  renderButtonLayout = () => {
    if (btns.length === 0) {
      return null;
    }
    return (
      <VStack direction="row" spacing={2}>
        {btns.map((btn, key) => {
          if (!btn) {
            return null;
          }
          const { text, action, params, icon } = btn || {};
          return (
            <Button
              key={`popup_btn_${key}`}
              // w={this.buttonWidth}
              leftIcon={this.renderIcon(icon)}
              onClick={() => this.clickButton(action, params)}
              colorScheme="teal"
              variant="solid"
            >
              {text}
            </Button>
          );
        })}
      </VStack>
    );
  };

  render() {
    return (
      <ChakraProvider>
        <StoreContext.Provider value={this.state}>
          {this.renderLayout()}
        </StoreContext.Provider>
      </ChakraProvider>
    );
  }
}

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <PopupPage />
  </ErrorBoundary>,
);
