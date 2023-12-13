import React from "react";

const prefix = "error-page";
const onClick = () => {
  window.open("", "_blank");
};

export const ErrorFallback = () => {
  return (
    <div className={`bg-gray-dark ${prefix}`}>
      <p className={" rounded-sm"}>插件异常啦!</p>
    </div>
  );
};
