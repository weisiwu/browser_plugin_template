import React from 'react';
import { List, ListItem, ListIcon, ChakraProvider } from "@chakra-ui/react";
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { StoreContext } from '@base/src/store.js';
import { ErrorFallback } from '@components/ErrorFallback.jsx';
import '@styles/popup.less';

const prefix = 'popup-page';
const root = createRoot(document.getElementById('app'));

class PopupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.goPage.bind(this);
  }

  componentDidMount() {}

  goPage(page) {
    if (!page) {
    }
    // chrome.tabs.create({
    //   url: `../dest/${page}.html`,
    // });
  }

  render() {
    return (
      <ChakraProvider>
        <StoreContext.Provider value={this.state}>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={() => this.goPage("popup")} color="green.500" />
              Test
            </ListItem>
          </List>
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
