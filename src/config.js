import taggedTemplate from "./utils/taggedTemplate";

const API_END_POINT =
  process.env.REACT_APP_API_URL || "http://3.108.54.252:1337";
const ENDPOINT_BANK =
  process.env.REACT_APP_BANK_API || "http://40.80.80.135:1337";

const CLIENT_VERIFY_URL = `${ENDPOINT_BANK}/sails-exp/ClientVerify`;

const BANK_TOKEN_API = `${ENDPOINT_BANK}/generateLink`;
const BANK_LIST_API = `${ENDPOINT_BANK}/bank_list`;

const CLIENT_EMAIL_ID = "cub@nc.com";

const WHITE_LABEL_URL = taggedTemplate`${API_END_POINT}/wot/whitelabelsolution?name=${"name"}`;
const PRODUCT_LIST_URL = taggedTemplate`${API_END_POINT}/productDetails?white_label_id=${"whiteLabelId"}`;
const PRODUCT_DETAILS_URL = taggedTemplate`${API_END_POINT}/productDetails?white_label_id=${"whiteLabelId"}&product_id=${"productId"}`;
const DOCS_UPLOAD_URL = taggedTemplate`${API_END_POINT}/loanDocumentUpload?userId=${"userId"}"}`;
const BORROWER_UPLOAD_URL = `${API_END_POINT}/borrowerdoc-upload`;

const NC_STATUS_CODE = {
  success: "NC200",
  serverError: "NC500",
};

export {
  API_END_POINT,
  ENDPOINT_BANK,
  CLIENT_EMAIL_ID,
  CLIENT_VERIFY_URL,
  BANK_TOKEN_API,
  BANK_LIST_API,
  NC_STATUS_CODE,
  WHITE_LABEL_URL,
  PRODUCT_LIST_URL,
  PRODUCT_DETAILS_URL,
  DOCS_UPLOAD_URL,
  BORROWER_UPLOAD_URL,
};
