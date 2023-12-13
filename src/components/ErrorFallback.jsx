import React from "react";

const prefix = "error-page";
const onClick = () => {
  window.open("", "_blank");
};

export const ErrorFallback = () => {
  return (
    <div className="relative bg-gray h-screen">
      <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg text-center text-blue cursor-pointer">
        插件异常啦！请联系
        <a href="mailto://2436887475@qq.com">2436887475@qq.com</a>
      </p>
    </div>
  );
};
