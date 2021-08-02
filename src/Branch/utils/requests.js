import axios from "axios";
import CryptoJS from "crypto-js";
import {
  API_END_POINT,
  SECRET,
  BORROWER_UPLOAD_URL,
  ENDPOINT_BANK,
} from "../../_config/app.config";

const userToken = localStorage.getItem("token");

export const dashboardData = async (token = localStorage.getItem("token")) => {
  const g = await axios.get(`${API_END_POINT}/branch/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const t = await g;
  return t.data.data;
};

export const getNCStatus = (token = localStorage.getItem("token")) => {
  axios
    .get(`${API_END_POINT}/case_nc_status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      return res;
    });
};

export const getLoan = async (
  product_id,
  white_label_id = localStorage.getItem("wt_lbl"),
  token = userToken
) => {
  const g = await axios.get(`${API_END_POINT}/productDetails`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { white_label_id, product_id },
  });
  const t = await g;
  return t.data?.data?.edit_json
    ? JSON.parse(t.data.data.edit_json).flow
    : t.data;
};

export const getCase = async (order, token = localStorage.getItem("token")) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/viewLoan`,
    { ncStatus: `${order}` },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const t = await g;
  return g.data.loanList;
};

export const getUsersList = async (token = localStorage.getItem("token")) => {
  const g = await axios.get(`${API_END_POINT}/branch/getUserList`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { userType: "Branch" },
  });
  const t = await g;
  return t.data.userList;
};

export const getCommentList = async (
  loanId,
  token = localStorage.getItem("token")
) => {
  const g = await axios.get(`${API_END_POINT}/branch/commentList`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { loanId },
  });
  const t = await g;
  return t;
};

export const reassignLoan = async (
  loanId,
  reAssignTo,
  comments,
  recommendation,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/reAssignLoans`,
    { loanId, reAssignTo, comments, recommendation },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const t = await g;
  return t;
};

export const reassignLoanQuery = async (
  loanId,
  query,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/reAssignLoans`,
    { loanId, query },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const t = await g;
  return t;
};

export const getLoanDetails = async (
  loanId,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/cub/getLoanDeatils`,
    { loanId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const t = await g;
  console.log(t.data);
  return t.data;
};

export const getWhiteLabelPermission = async (
  token = localStorage.getItem("token")
) => {
  const g = await axios.get(`${API_END_POINT}/whiteLabelPermission`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const t = await g;
  localStorage.setItem("wt_lbl", t.data.data.white_label);
  localStorage.setItem("permission", JSON.stringify(t.data.data.permission));
};

export const getLoanDocs = async (token = localStorage.getItem("token")) => {
  const g = await axios.get(`${API_END_POINT}/Loanrequest`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const t = await g;
};

export const loanDocMapping = async (
  loanId,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/applicantMapping/view`,
    { loanId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const t = await g;
};

export const viewDocument = async (
  loan_id,
  userid,
  filename,
  token = localStorage.getItem("token")
) => {
  console.log(loan_id, filename, userid);
  const g = await axios.post(
    `${API_END_POINT}/viewDocument`,
    { filename, userid, loan_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const t = await g;

  if (t.data.status !== "nok") {
    const dec = (data) => {
      var rawData = CryptoJS.enc.Base64.parse(data);
      var key = CryptoJS.enc.Latin1.parse(SECRET);
      var iv = CryptoJS.enc.Latin1.parse(SECRET);
      var plaintextData = CryptoJS.AES.decrypt({ ciphertext: rawData }, key, {
        iv: iv,
      });
      var plaintext = plaintextData.toString(CryptoJS.enc.Latin1);
      t.data.signedurl = plaintext;
      window.open(plaintext);
    };
    dec(t.data.signedurl);
  }
};

export const needAction = async (
  ncStatusManageName,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/loanListAlert`,
    { ncStatusManageName },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const t = await g;
  return t.data.loanList;
};

export const getApprovalStatus = async (
  loanId,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/getApproverList`,
    { loanId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const t = await g;
};

export const assignUserToLoan = async (
  loanId,
  assignUserId,
  comment,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/assignUserToLoan`,
    { loanId, assignUserId, comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const t = await g;
};

export const searchData = async (
  caseData,
  ncStatus,
  token = localStorage.getItem("token")
) => {
  if (caseData !== "") {
    const g = await axios.post(
      `${API_END_POINT}/cub/viewCaseDetails`,
      { caseData, ncStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const t = await g;
    return t.data.result ? t.data.result : t.data.message;
  }
};

export const docTypes = async (
  loan_product,
  business_type,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/loan/documentTypes`,
    { loan_product, business_type },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const t = await g;
  return t.data;
};

export const borrowerDocUpload = async (
  upload_document,
  token = localStorage.getItem("token")
) => {
  try {
    const g = await axios.post(
      BORROWER_UPLOAD_URL,
      { upload_document },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const t = await g;
    return t;
  } catch {
    return "Error in uploading";
  }
};

export const uploadDoc = async (
  userid,
  token = localStorage.getItem("token")
) => {
  const g = await axios.post(
    `${API_END_POINT}/loanDocumentUpload`,
    { userid },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const t = await g;
};

export const getGroupedDocs = async (
  case_id,
  white_label_id = localStorage.getItem("wt_lbl"),
  token = localStorage.getItem("token")
) => {
  const gq = await axios.get(`${API_END_POINT}/case-whitelabelEncrypt`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { white_label_id },
  });
  const tq = await gq;
  const g = await axios.get(`${API_END_POINT}/uploaded_doc_list`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { case_id, white_label_id: tq.data.encrypted_whitelabel[0] },
  });
  const t = await g;
  return t?.data?.data;
};

export const verification = async (
  businessId,
  token = localStorage.getItem("token")
) => {
  const g = await axios.get(`${ENDPOINT_BANK}/verificationDataApi_uiux`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { businessId },
  });
  const t = await g;
  console.log(t);
};
