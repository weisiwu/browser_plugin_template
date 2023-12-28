import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
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
    this.clickTest.bind(this);
  }

  clickTest() {
    chrome.tabs.create({
      url: '../dest/index.html',
    });
  }

  render() {
    return (
      <StoreContext.Provider value={this.state}>
        <div>
          pop的内容
          <ul>
            <li className="padding-24" onClick={this.clickTest}>
              Test
            </li>
          </ul>
        </div>
      </StoreContext.Provider>
    );
  }

  componentDidMount() {}
}

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ChakraProvider>
      <PopupPage />
    </ChakraProvider>
  </ErrorBoundary>,
);
