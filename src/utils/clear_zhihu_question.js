import axios from "axios";

const pageParams = { offset: 0, limit: 20, total: 0 };
const listApi = (offset) =>
  `https://www.zhihu.com/api/v4/members/wei-si-wu/following-questions?offset=${offset}&limit=${pageParams.limit}`;
// DELETE 方法
const cancelApi = (question_id) =>
  `https://www.zhihu.com/api/v4/questions/${question_id}/followers`;

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const cancel_follow_question = (question_id) =>
  axios.delete(cancelApi(question_id));

const clear_zhihu_follow_question = () =>
  axios.get(listApi(pageParams.offset)).then((result) => {
    const { status, data } = result || {};
    console.log("wswTeststatus", status);
    if (status !== 200) {
      return false;
    }
    const { data: list, paging } = data || [];
    console.log("wswTest: pageParams.total", pageParams.total);
    if (!pageParams.total) {
      pageParams.total = paging.totals;
    }
    if (pageParams.offset && pageParams.total <= pageParams.offset) {
      return false;
    }
    if (list?.length) {
      console.log("wswTestpageParams.offset: ", pageParams.offset);
      pageParams.offset += list?.length || pageParams.limit;
      list
        .reduce((sum, question) => {
          console.log("wswTestquestion: ", question);
          if (question.id) {
            return sum.then(() =>
              sleep(500).then(() => cancel_follow_question(question.id)),
            );
          }
          return sum.then(() => sleep(500));
        }, Promise.resolve())
        .then(() => clear_zhihu_follow_question());
    }
  });

export default clear_zhihu_follow_question;
