import React from "react";
import { Button, Grid, Box, ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { StoreContext } from "@base/src/store.js";
import { ErrorFallback } from "@components/ErrorFallback.jsx";
import "@styles/popup.less";
import { popup } from "@base/config.json";
import iconsMap from "../iconsMap.js";
import clear_zhihu_question from "../utils/clear_zhihu_question.js";

const prefixCls = "popup-page";
const LAYOUT = {
  BUTTON: "button", // popup为自上到下平展开来的按钮
};
const ACTIONS = {
  FUCNTION: "function",
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
    this.buttonWidth = props.buttonWidth || 120;
    this.bodyPadding = 15;
  }

  componentDidMount() {}

  clickButton = (action, params) => {
    if (!action || !params) {
      return;
    }

    if (action === ACTIONS.OPEN_PAGE) {
      chrome?.tabs?.create?.({ url: `../dest/${params}` });
    } else if (action === ACTIONS.JUMP_URL) {
      chrome?.tabs?.create?.({ url: params });
    } else if (action === ACTIONS.FUCNTION) {
      clear_zhihu_question();
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
    if (icon.startsWith("CI_")) {
      const IconComponent = iconsMap[icon];
      return <IconComponent />;
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
      <Grid
        templateColumns="repeat(1, 3fr)"
        gap={1}
        mx="auto"
        placeItems="center"
        minWidth={this.buttonWidth + this.bodyPadding * 2}
        // w={this.buttonWidth + this.bodyPadding * 2}
      >
        {btns.map((btn, key) => {
          if (!btn) {
            return null;
          }
          const { text, action, params, icon } = btn || {};
          return (
            <Box p={0.5} key={`popup_btn_${key}`}>
              <Button
                minWidth={this.buttonWidth}
                justifySelf="center"
                size="sm"
                leftIcon={this.renderIcon(icon)}
                onClick={() => this.clickButton(action, params)}
                colorScheme="teal"
                variant="solid"
              >
                {text}
              </Button>
            </Box>
          );
        })}
      </Grid>
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
