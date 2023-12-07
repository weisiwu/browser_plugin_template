import React, { useState } from "react";
import { Badge, Layout, Steps, Button } from "antd";
import { DingtalkOutlined } from "@ant-design/icons";
import { version } from "../../package.json";

const prefix = "config-page";
const badgeStyle = {
  position: "absolute",
  left: "10px",
  top: "10px",
  display: "inline-block",
  width: "120px",
  height: "24px",
  lineHeight: "24px",
  textAlign: "center",
};

export const PageHeader = (props) => {
  const { title = "", linkTitle = "" } = props;
  const versionStr = `当前版本: ${version || "1.1.0"}`;

  return (
    <Layout
      className={`${prefix}__header`}
      style={{ marginBottom: hide ? "30px" : "0px" }}
    >
      <div className={`${prefix}__header--title`}>
        {title}
        <a className={`${prefix}__header--creator`} href="">
          问题请联系
          <DingtalkOutlined className={`${prefix}__header--icon`} />
        </a>
        <a className={`${prefix}__header--doc`} target="_blank" href="">
          {linkTitle}
        </a>
        <Badge.Ribbon
          text={versionStr}
          placement="start"
          style={badgeStyle}
        ></Badge.Ribbon>
      </div>
    </Layout>
  );
};
