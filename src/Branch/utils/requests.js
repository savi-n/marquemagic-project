import axios from "axios";

import { API_END_POINT } from "../../_config/app.config";

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxMDYwOSwibmFtZSI6IlJBR0hBVkFOICBHIiwiZW1haWwiOiJyYWdoYXZhbjE2MDNAZ21haWwuY29tIiwiY29udGFjdCI6Ijk4OTQ3NDU4ODAiLCJjYWNvbXBuYW1lIjpudWxsLCJjYXBhbmNhcmQiOm51bGwsImFkZHJlc3MxIjoiMy8zMzNBLCBQRVJVTUFMIEtPVklMIFNUUkVFVCwiLCJhZGRyZXNzMiI6IlNBVEhBTkdVREksQVNVUixLVU1CQUtPTkFNIFRIQU5KQVZVUiIsInBpbmNvZGUiOm51bGwsImxvY2FsaXR5IjpudWxsLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwidXNlcnR5cGUiOiJCb3Jyb3dlciIsImxlbmRlcl9pZCI6MzIsInBhcmVudF9pZCI6MCwidXNlcl9ncm91cF9pZCI6bnVsbCwiYXNzaWduZWRfc2FsZXNfdXNlciI6MTA2MDksIm9yaWdpbmF0b3IiOm51bGwsImlzX2xlbmRlcl9hZG1pbiI6MCwic3RhdHVzIjoiYWN0aXZlIiwib3N2X25hbWUiOm51bGwsImZpcnN0bG9naW4iOiIwIiwiY3JlYXRlZG9uIjoiMDAwMC0wMC0wMCAwMDowMDowMCIsInVwZGF0ZV90aW1lIjoiMjAyMS0wNi0yOFQwMzowMToxNS4wMDBaIiwiaXNfbGVuZGVyX21hbmFnZXIiOjAsIm9yaWdpbiI6IkNVQi1Qb3J0YWwiLCJ3aGl0ZV9sYWJlbF9pZCI6IjMyLDIsMyIsImRlYWN0aXZhdGVfcmVhc3NpZ24iOiJObyIsIm5vdGlmaWNhdGlvbl9wdXJwb3NlIjpudWxsLCJ1c2VyX3N1Yl90eXBlIjoiQ3JlZGl0Iiwibm90aWZpY2F0aW9uX2ZsYWciOiJ5ZXMiLCJjcmVhdGVkYnlVc2VyIjoxMDYwOSwic291cmNlIjoiQ1VCIiwiY2hhbm5lbF90eXBlIjpudWxsLCJvdHAiOiI4Nzc5ODUiLCJ3b3JrX3R5cGUiOm51bGwsInByb2ZpbGVfY29tcGxldGlvbiI6MCwicGljIjpudWxsLCJsb2dpbl9zdGF0dXMiOiIxNjI0ODY5MDc0OTc1NjI1NiIsImJyYW5jaF9pZCI6MSwiY3VzdG9tZXJJZCI6IjAwMDAwMDAwMDAxMjc5NjAwIiwiY3ViRGV0YWlscyI6eyJleHBpcnlEYXRlMSI6IiIsInVuY2xlYXJlZENoZXF1ZVZhbCI6IjAuMCsiLCJpbnRlcm5ldEJhbmtpbmdGbGFnIjoiOTkiLCJhY2NUeXBlIjoiMDAwMDAiLCJtb2JpbGVOdW0iOiI5ODk0NzQ1ODgwIiwiZG9iIjoiMTk5MDAzMTYiLCJjdXN0b21lckhvbWVCcmFuY2giOiIwMDAwNCIsImxpbWl0NCI6IjAuMCsiLCJsaW1pdDMiOiIwLjArIiwibGltaXQyIjoiMC4wKyIsImxpbWl0MSI6IjAuMCsiLCJwYW4iOiJBWkhQUjc2ODFOIiwiZGFpbHlMaW1pdCI6IjEwMCIsInJlbGF0aW9uc2hpcENvbnQyIjoiIiwicmVsYXRpb25zaGlwQ29udDEiOiIiLCJhY2NOdW0iOiIwMDAwMDEyNzk2MDAiLCJtaWROYW1lIjoiIiwicHJvZHVjdENvZGUiOiIiLCJyZWxhdGlvbnNoaXBNYWlsSWQiOiIiLCJyZWxhdGlvbnNoaXBOYW1lIjoiIiwiYWRkcmVzczQiOiJUSEFOSkFWVVIiLCJhZGRyZXNzMyI6IlNBVEhBTkdVREksQVNVUixLVU1CQUtPTkFNIiwiYWRkcmVzczIiOiJQRVJVTUFMIEtPVklMIFNUUkVFVCwiLCJhZGRyZXNzMSI6IjMvMzMzQSwiLCJicmFuY2hDb2RlIjoiIiwiYWNjU3RhdHVzIjoiMDIiLCJyZWxhdGlvbnNoaXBUZWxsZXJJZCI6IiIsImhvbGRWYWx1ZSI6IjAuMCsiLCJwdXNoRmxhZyI6Ijk4IiwibGFzdE5hbWUiOiJHIiwiZHJhd2luZ1Bvd2VyRmxhZyI6IiIsImVtYWlsIjoicmFnaGF2YW4xNjAzQGdtYWlsLmNvbSIsInRpZXJDdXN0b21lclR5cGUiOiIwMTA0MDEiLCJicENhdCI6IkluZGl2aWR1YWwiLCJyZXNpZGVudFN0YXR1cyI6IjEiLCJjdXN0b21lcklkIjoiMDAwMDAwMDAwMDEyNzk2MDAiLCJzbXNGbGFnIjoiOTkiLCJwaW4iOiI2MTI1MDEiLCJ0aXRsZSI6IjAzIiwidG90YWxMaW1pdCI6IjAuMCsiLCJ3b3JrUGhvbmVOdW0iOiIiLCJwdWxsRmxhZyI6Ijk4IiwiY3VycmVudEJhbGFuY2UiOiIwLjArIiwiZmlyc3ROYW1lIjoiUkFHSEFWQU4iLCJicFR5cGUiOiJSZXNpZGVudCIsInZpcENvZGUiOiJOIiwiZHJhd2luZ1Bvd2VyIjoiMC4wKyIsInNlY3VyaXR5RmxhZyI6IiIsImF2YWlsYWJsZUJhbGFuY2UiOiIwLjArIiwiaG9tZVBob25lTnVtIjoiOTg5NDc0NTg4MCIsImV4cGlyeURhdGU0IjoiIiwiZXhwaXJ5RGF0ZTMiOiIiLCJleHBpcnlEYXRlMiI6IiIsInByb2R1Y3REZXNjIjoiIiwiZmF4TnVtIjoiIn19LCJpYXQiOjE2MjQ4NjkxMDYsImV4cCI6MTYyNDk1NTUwNn0.wXjeKbCoxSj4IHSy6x11psy8gltCDSdkJEvG0IYnrWM";

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
