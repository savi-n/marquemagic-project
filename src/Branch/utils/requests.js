import axios from "axios";

import { API_END_POINT } from "../../_config/app.config";

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxMDYwOSwibmFtZSI6IlJBR0hBVkFOICBHIiwiZW1haWwiOiJyYWdoYXZhbjE2MDNAZ21haWwuY29tIiwiY29udGFjdCI6Ijk4OTQ3NDU4ODAiLCJjYWNvbXBuYW1lIjpudWxsLCJjYXBhbmNhcmQiOm51bGwsImFkZHJlc3MxIjoiMy8zMzNBLCBQRVJVTUFMIEtPVklMIFNUUkVFVCwiLCJhZGRyZXNzMiI6IlNBVEhBTkdVREksQVNVUixLVU1CQUtPTkFNIFRIQU5KQVZVUiIsInBpbmNvZGUiOm51bGwsImxvY2FsaXR5IjpudWxsLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwidXNlcnR5cGUiOiJCcmFuY2giLCJsZW5kZXJfaWQiOjMyLCJwYXJlbnRfaWQiOjAsInVzZXJfZ3JvdXBfaWQiOm51bGwsImFzc2lnbmVkX3NhbGVzX3VzZXIiOjEwNjA5LCJvcmlnaW5hdG9yIjpudWxsLCJpc19sZW5kZXJfYWRtaW4iOjAsInN0YXR1cyI6ImFjdGl2ZSIsIm9zdl9uYW1lIjpudWxsLCJmaXJzdGxvZ2luIjoiMCIsImNyZWF0ZWRvbiI6IjAwMDAtMDAtMDAgMDA6MDA6MDAiLCJ1cGRhdGVfdGltZSI6IjIwMjEtMDYtMjlUMDQ6NDc6NDYuMDAwWiIsImlzX2xlbmRlcl9tYW5hZ2VyIjowLCJvcmlnaW4iOiJDVUItUG9ydGFsIiwid2hpdGVfbGFiZWxfaWQiOiIzMiwyLDMiLCJkZWFjdGl2YXRlX3JlYXNzaWduIjoiTm8iLCJub3RpZmljYXRpb25fcHVycG9zZSI6bnVsbCwidXNlcl9zdWJfdHlwZSI6Ik1hbmFnZXIiLCJub3RpZmljYXRpb25fZmxhZyI6InllcyIsImNyZWF0ZWRieVVzZXIiOjEwNjA5LCJzb3VyY2UiOiJDVUIiLCJjaGFubmVsX3R5cGUiOm51bGwsIm90cCI6Ijg0MDE4MyIsIndvcmtfdHlwZSI6bnVsbCwicHJvZmlsZV9jb21wbGV0aW9uIjowLCJwaWMiOm51bGwsImxvZ2luX3N0YXR1cyI6IjE2MjQ5NjE4NjQ5ODE3MDc2IiwiYnJhbmNoX2lkIjoxNzkzOTYsImN1c3RvbWVySWQiOiIwMDAwMDAwMDAwMTI3OTYwMCIsImN1YkRldGFpbHMiOnsiZXhwaXJ5RGF0ZTEiOiIiLCJ1bmNsZWFyZWRDaGVxdWVWYWwiOiIwLjArIiwiaW50ZXJuZXRCYW5raW5nRmxhZyI6Ijk5IiwiYWNjVHlwZSI6IjAwMDAwIiwibW9iaWxlTnVtIjoiOTg5NDc0NTg4MCIsImRvYiI6IjE5OTAwMzE2IiwiY3VzdG9tZXJIb21lQnJhbmNoIjoiMDAwMDQiLCJsaW1pdDQiOiIwLjArIiwibGltaXQzIjoiMC4wKyIsImxpbWl0MiI6IjAuMCsiLCJsaW1pdDEiOiIwLjArIiwicGFuIjoiQVpIUFI3NjgxTiIsImRhaWx5TGltaXQiOiIxMDAiLCJyZWxhdGlvbnNoaXBDb250MiI6IiIsInJlbGF0aW9uc2hpcENvbnQxIjoiIiwiYWNjTnVtIjoiMDAwMDAxMjc5NjAwIiwibWlkTmFtZSI6IiIsInByb2R1Y3RDb2RlIjoiIiwicmVsYXRpb25zaGlwTWFpbElkIjoiIiwicmVsYXRpb25zaGlwTmFtZSI6IiIsImFkZHJlc3M0IjoiVEhBTkpBVlVSIiwiYWRkcmVzczMiOiJTQVRIQU5HVURJLEFTVVIsS1VNQkFLT05BTSIsImFkZHJlc3MyIjoiUEVSVU1BTCBLT1ZJTCBTVFJFRVQsIiwiYWRkcmVzczEiOiIzLzMzM0EsIiwiYnJhbmNoQ29kZSI6IiIsImFjY1N0YXR1cyI6IjAyIiwicmVsYXRpb25zaGlwVGVsbGVySWQiOiIiLCJob2xkVmFsdWUiOiIwLjArIiwicHVzaEZsYWciOiI5OCIsImxhc3ROYW1lIjoiRyIsImRyYXdpbmdQb3dlckZsYWciOiIiLCJlbWFpbCI6InJhZ2hhdmFuMTYwM0BnbWFpbC5jb20iLCJ0aWVyQ3VzdG9tZXJUeXBlIjoiMDEwNDAxIiwiYnBDYXQiOiJJbmRpdmlkdWFsIiwicmVzaWRlbnRTdGF0dXMiOiIxIiwiY3VzdG9tZXJJZCI6IjAwMDAwMDAwMDAxMjc5NjAwIiwic21zRmxhZyI6Ijk5IiwicGluIjoiNjEyNTAxIiwidGl0bGUiOiIwMyIsInRvdGFsTGltaXQiOiIwLjArIiwid29ya1Bob25lTnVtIjoiIiwicHVsbEZsYWciOiI5OCIsImN1cnJlbnRCYWxhbmNlIjoiMC4wKyIsImZpcnN0TmFtZSI6IlJBR0hBVkFOIiwiYnBUeXBlIjoiUmVzaWRlbnQiLCJ2aXBDb2RlIjoiTiIsImRyYXdpbmdQb3dlciI6IjAuMCsiLCJzZWN1cml0eUZsYWciOiIiLCJhdmFpbGFibGVCYWxhbmNlIjoiMC4wKyIsImhvbWVQaG9uZU51bSI6Ijk4OTQ3NDU4ODAiLCJleHBpcnlEYXRlNCI6IiIsImV4cGlyeURhdGUzIjoiIiwiZXhwaXJ5RGF0ZTIiOiIiLCJwcm9kdWN0RGVzYyI6IiIsImZheE51bSI6IiJ9fSwiaWF0IjoxNjI0OTYxOTM1LCJleHAiOjE2MjUwNDgzMzV9.if1zNNfUaeBV0m6UqY39GhFFm4NwXHhmap4OawGqeSA";

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
