import React from 'react';
import { Button, VStack, ChakraProvider } from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { StoreContext } from '@base/src/store.js';
import { ErrorFallback } from '@components/ErrorFallback.jsx';
import '@styles/popup.less';

const prefixCls = "popup-page";
const root = createRoot(document.getElementById('app'));

class PopupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.goPage.bind(this);
    this.buttonWidth = props.buttonWidth || 100;
  }

  componentDidMount() {}

  goPage(page) {
    console.log("wswTest: page", page);
    if (!page) {
    }
    chrome.tabs.create({
      url: `../dest/${page}.html`,
    });
  }

  render() {
    return (
      <ChakraProvider>
        <StoreContext.Provider value={this.state}>
          <VStack direction="row" spacing={2}>
            <Button
              w={this.buttonWidth}
              leftIcon={<LinkIcon />}
              onClick={() => this.goPage("index")}
              colorScheme="teal"
              variant="solid"
            >
              Test1
            </Button>
            <Button
              w={this.buttonWidth}
              leftIcon={<LinkIcon />}
              onClick={() => this.goPage("index")}
              colorScheme="teal"
              variant="solid"
            >
              Test2
            </Button>
            <Button
              w={this.buttonWidth}
              leftIcon={<LinkIcon />}
              onClick={() => this.goPage("index")}
              colorScheme="teal"
              variant="solid"
            >
              Test3
            </Button>
          </VStack>
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
