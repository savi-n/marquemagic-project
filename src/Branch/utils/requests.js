import axios from "axios";

import { API_END_POINT } from "../../_config/app.config";

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo4NzcxNCwibmFtZSI6IlJBR0hBVkFOICBHIiwiZW1haWwiOiJyYWdoYXZhbjE2MDNAZ21haWwuY29tIiwiY29udGFjdCI6Ijk4OTQ3NDU4ODAiLCJjYWNvbXBuYW1lIjpudWxsLCJjYXBhbmNhcmQiOm51bGwsImFkZHJlc3MxIjoiMy8zMzNBLCBQRVJVTUFMIEtPVklMIFNUUkVFVCwiLCJhZGRyZXNzMiI6IlNBVEhBTkdVREksQVNVUixLVU1CQUtPTkFNIFRIQU5KQVZVUiIsInBpbmNvZGUiOm51bGwsImxvY2FsaXR5IjpudWxsLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwidXNlcnR5cGUiOiJCb3Jyb3dlciIsImxlbmRlcl9pZCI6MzIsInBhcmVudF9pZCI6MCwidXNlcl9ncm91cF9pZCI6bnVsbCwiYXNzaWduZWRfc2FsZXNfdXNlciI6ODc3MTQsIm9yaWdpbmF0b3IiOm51bGwsImlzX2xlbmRlcl9hZG1pbiI6MCwic3RhdHVzIjoiYWN0aXZlIiwib3N2X25hbWUiOm51bGwsImZpcnN0bG9naW4iOiIwIiwiY3JlYXRlZG9uIjoiMDAwMC0wMC0wMCAwMDowMDowMCIsInVwZGF0ZV90aW1lIjoiMjAyMS0wNi0yOVQwODozNTowNS4wMDBaIiwiaXNfbGVuZGVyX21hbmFnZXIiOjAsIm9yaWdpbiI6IkNVQi1Qb3J0YWwiLCJ3aGl0ZV9sYWJlbF9pZCI6IjQwIiwiZGVhY3RpdmF0ZV9yZWFzc2lnbiI6Ik5vIiwibm90aWZpY2F0aW9uX3B1cnBvc2UiOjIsInVzZXJfc3ViX3R5cGUiOiJDcmVkaXQiLCJub3RpZmljYXRpb25fZmxhZyI6Im5vIiwiY3JlYXRlZGJ5VXNlciI6ODc3MTQsInNvdXJjZSI6IkNVQiIsImNoYW5uZWxfdHlwZSI6bnVsbCwib3RwIjoiNTc1MzE4Iiwid29ya190eXBlIjpudWxsLCJwcm9maWxlX2NvbXBsZXRpb24iOjAsInBpYyI6bnVsbCwibG9naW5fc3RhdHVzIjoiMTYyNDk1NjM1NTU4MjgwNjYiLCJicmFuY2hfaWQiOm51bGwsImN1c3RvbWVySWQiOiIwMDAwMDAwMDAwMTI3OTYwMCIsImN1YkRldGFpbHMiOnsiZXhwaXJ5RGF0ZTEiOiIiLCJ1bmNsZWFyZWRDaGVxdWVWYWwiOiIwLjArIiwiaW50ZXJuZXRCYW5raW5nRmxhZyI6Ijk5IiwiYWNjVHlwZSI6IlNCIiwibW9iaWxlTnVtIjoiOTg5NDc0NTg4MCIsImRvYiI6IjE5OTAwMzE2IiwiY3VzdG9tZXJIb21lQnJhbmNoIjoiMDAwMDQiLCJsaW1pdDQiOiIwLjArIiwibGltaXQzIjoiMC4wKyIsImxpbWl0MiI6IjAuMCsiLCJsaW1pdDEiOiIwLjArIiwicGFuIjoiQVpIUFI3NjgxTiIsImRhaWx5TGltaXQiOiIxMDAiLCJyZWxhdGlvbnNoaXBDb250MiI6IiIsInJlbGF0aW9uc2hpcENvbnQxIjoiIiwiYWNjTnVtIjoiMDAwMDAwNTcxNDc2IiwibWlkTmFtZSI6IiIsInByb2R1Y3RDb2RlIjoiNTAwMTEwMDciLCJyZWxhdGlvbnNoaXBNYWlsSWQiOiIiLCJyZWxhdGlvbnNoaXBOYW1lIjoiIiwiYWRkcmVzczQiOiJUSEFOSkFWVVIiLCJhZGRyZXNzMyI6IlNBVEhBTkdVREksQVNVUixLVU1CQUtPTkFNIiwiYWRkcmVzczIiOiJQRVJVTUFMIEtPVklMIFNUUkVFVCwiLCJhZGRyZXNzMSI6IjMvMzMzQSwiLCJicmFuY2hDb2RlIjoiMDAwMDQiLCJhY2NTdGF0dXMiOiIwMSIsInJlbGF0aW9uc2hpcFRlbGxlcklkIjoiIiwiaG9sZFZhbHVlIjoiMC4wKyIsInB1c2hGbGFnIjoiOTgiLCJsYXN0TmFtZSI6IkciLCJkcmF3aW5nUG93ZXJGbGFnIjoiTiIsImVtYWlsIjoicmFnaGF2YW4xNjAzQGdtYWlsLmNvbSIsInRpZXJDdXN0b21lclR5cGUiOiIwMTA0MDEiLCJicENhdCI6IkluZGl2aWR1YWwiLCJyZXNpZGVudFN0YXR1cyI6IjEiLCJjdXN0b21lcklkIjoiMDAwMDAwMDAwMDEyNzk2MDAiLCJzbXNGbGFnIjoiOTkiLCJwaW4iOiI2MTI1MDEiLCJ0aXRsZSI6IjAzIiwidG90YWxMaW1pdCI6IjAuMCsiLCJ3b3JrUGhvbmVOdW0iOiIiLCJwdWxsRmxhZyI6Ijk4IiwiY3VycmVudEJhbGFuY2UiOiIyNzAwNS4wNCsiLCJmaXJzdE5hbWUiOiJSQUdIQVZBTiIsImJwVHlwZSI6IlJlc2lkZW50IiwidmlwQ29kZSI6Ik4iLCJkcmF3aW5nUG93ZXIiOiIwLjArIiwic2VjdXJpdHlGbGFnIjoiMDEiLCJhdmFpbGFibGVCYWxhbmNlIjoiMjcwMDUuMDQrIiwiaG9tZVBob25lTnVtIjoiOTg5NDc0NTg4MCIsImV4cGlyeURhdGU0IjoiIiwiZXhwaXJ5RGF0ZTMiOiIiLCJleHBpcnlEYXRlMiI6IiIsInByb2R1Y3REZXNjIjoiQ1VCIFNBTEFSWSBTQVZJTkdTIiwiZmF4TnVtIjoiIn19LCJpYXQiOjE2MjQ5NTYzNjksImV4cCI6MTYyNTA0Mjc2OX0.ZCRbMswy0mVyn83eraieONHtGhsTsfGdoMPwvOIs_0Q";

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
