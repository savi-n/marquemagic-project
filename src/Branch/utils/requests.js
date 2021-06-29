import axios from "axios";

import { API_END_POINT } from "../../_config/app.config";

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo4NzcxNCwibmFtZSI6IlJBR0hBVkFOICBHIiwiZW1haWwiOiJyYWdoYXZhbjE2MDNAZ21haWwuY29tIiwiY29udGFjdCI6Ijk4OTQ3NDU4ODAiLCJjYWNvbXBuYW1lIjpudWxsLCJjYXBhbmNhcmQiOm51bGwsImFkZHJlc3MxIjoiMy8zMzNBLCBQRVJVTUFMIEtPVklMIFNUUkVFVCwiLCJhZGRyZXNzMiI6IlNBVEhBTkdVREksQVNVUixLVU1CQUtPTkFNIFRIQU5KQVZVUiIsInBpbmNvZGUiOm51bGwsImxvY2FsaXR5IjpudWxsLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwidXNlcnR5cGUiOiJCcmFuY2giLCJsZW5kZXJfaWQiOjMyLCJwYXJlbnRfaWQiOjAsInVzZXJfZ3JvdXBfaWQiOm51bGwsImFzc2lnbmVkX3NhbGVzX3VzZXIiOjg3NzE0LCJvcmlnaW5hdG9yIjpudWxsLCJpc19sZW5kZXJfYWRtaW4iOjAsInN0YXR1cyI6ImFjdGl2ZSIsIm9zdl9uYW1lIjpudWxsLCJmaXJzdGxvZ2luIjoiMCIsImNyZWF0ZWRvbiI6IjAwMDAtMDAtMDAgMDA6MDA6MDAiLCJ1cGRhdGVfdGltZSI6IjIwMjEtMDYtMjlUMDk6MjE6MDUuMDAwWiIsImlzX2xlbmRlcl9tYW5hZ2VyIjowLCJvcmlnaW4iOiJDVUItUG9ydGFsIiwid2hpdGVfbGFiZWxfaWQiOiI0MCIsImRlYWN0aXZhdGVfcmVhc3NpZ24iOiJObyIsIm5vdGlmaWNhdGlvbl9wdXJwb3NlIjoyLCJ1c2VyX3N1Yl90eXBlIjoiTWFuYWdlciIsIm5vdGlmaWNhdGlvbl9mbGFnIjoieWVzIiwiY3JlYXRlZGJ5VXNlciI6ODc3MTQsInNvdXJjZSI6IkNVQiIsImNoYW5uZWxfdHlwZSI6bnVsbCwib3RwIjoiIiwid29ya190eXBlIjpudWxsLCJwcm9maWxlX2NvbXBsZXRpb24iOjAsInBpYyI6bnVsbCwibG9naW5fc3RhdHVzIjoxNjI0OTU5MTE5NTY5ODQwMCwiYnJhbmNoX2lkIjoyODU0Mn0sImlhdCI6MTYyNDk1OTExOSwiZXhwIjoxNjI1MDQ1NTE5fQ.o_S3ojAp4RQjqnD0WufQc3Mw0koYn9CVusreOE1AmK4";

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
