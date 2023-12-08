import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { defaultStore, StoreContext } from "@base/src/store.js";
import { ErrorFallback } from "@components/ErrorFallback.jsx";
import "@styles/popup.less";

const prefix = "popup-page";
const root = createRoot(document.getElementById("app"));

class PopupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StoreContext.Provider value={this.state}>
        <div>
          pop的内容
          <ul>
            <li>test1</li>
            <li>test2</li>
            <li>test3</li>
            <li>test4</li>
          </ul>
        </div>
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
    <PopupPage />
  </ErrorBoundary>,
);
