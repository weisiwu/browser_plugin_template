/** @format */

import axios from "axios";
import moment from "moment";
import querystring from "querystring";
import { version } from "@base/package.json";
import { isDevlopment, findMostFrequent } from "@base/src/utils";

/**
 * 获取梵天项目的配置信息
 * @param {Number} id
 * @return {Object|Promise}
 */
const fetchDetail = !isDevlopment
  ? ({ id }) => {
      return axios.get(`https://api/${id}`).then((res) => {
        return { test: "test" };
      });
    }
  : () => {
      return Promise.resolve(projectDetail);
    };

export { fetchDetail };
