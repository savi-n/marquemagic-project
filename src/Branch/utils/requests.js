import axios from "axios";

import { API_END_POINT } from "../../_config/app.config";

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo4NzcxNCwibmFtZSI6IlJBR0hBVkFOICBHIiwiZW1haWwiOiJyYWdoYXZhbjE2MDNAZ21haWwuY29tIiwiY29udGFjdCI6Ijk4OTQ3NDU4ODAiLCJjYWNvbXBuYW1lIjpudWxsLCJjYXBhbmNhcmQiOm51bGwsImFkZHJlc3MxIjoiMy8zMzNBLCBQRVJVTUFMIEtPVklMIFNUUkVFVCwiLCJhZGRyZXNzMiI6IlNBVEhBTkdVREksQVNVUixLVU1CQUtPTkFNIFRIQU5KQVZVUiIsInBpbmNvZGUiOm51bGwsImxvY2FsaXR5IjpudWxsLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwidXNlcnR5cGUiOiJCcmFuY2giLCJsZW5kZXJfaWQiOjMyLCJwYXJlbnRfaWQiOjAsInVzZXJfZ3JvdXBfaWQiOm5";

export const getNCStatus = () => {
  axios
    .get(`${API_END_POINT}/case_nc_status`, {
      headers: { Authorization: `${token}` },
    })
    .then((res) => {
      return res;
    });
};

export const getCase = async (order) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/viewLoan`,
    { ncStatus: `${order}` },
    {
      headers: { Authorization: `${token}` },
    }
  );

  const t = await g;
  return g.data.loanList;
};

export const getUsersList = async () => {
  const g = await axios.get(`${API_END_POINT}/branch/getUserList`, {
    headers: { Authorization: `${token}` },
    params: { userType: "Branch" },
  });
  const t = await g;
  return t;
};

export const reassignLoan = async (
  loanId,
  reAssignTo,
  comments,
  recommendation
) => {
  const g = await axios.post(
    `${API_END_POINT}/branch/reAssignLoans`,
    { loanId, reAssignTo, comments, recommendation },
    {
      headers: { Authorization: `${token}` },
    }
  );

  const t = await g;
  return t;
};

export const getLoanDetails = async (loanId) => {
  const g = await axios.post(
    `${API_END_POINT}/cub/getLoanDeatils`,
    { loanId },
    {
      headers: { Authorization: `${token}` },
    }
  );

  const t = await g;
  console.log(t);
};
