import axios from "axios";

import { API_END_POINT } from "../../_config/app.config";

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo4MTI3MiwibmFtZSI6InRlc3RjYSIsImVtYWlsIjoidGVzdHVzZXJAY2EuY29tIiwiY29udGFjdCI6Ijk4NzY1NDU2NzgiLCJjYWNvbXBuYW1lIjoiQ29jbyIsImNhcGFuY2FyZCI6ImFzZGNmMTIzNGsiLCJhZGRyZXNzMSI6IiM1NDMiLCJhZGRyZXNzMiI6bnVsbCwicGluY29kZSI6IjU2MDEwNCIsImxvY2FsaXR5IjoiSGFtcGluYWdhciBTTyIsImNpdHkiOiJCZW5nYWx1cnUiLCJzdGF0ZSI6IktBUk5BVEFLQSIsInVzZXJ0eXBlIjoiQ0EiLCJsZW5kZXJfaWQiOjAsInBhcmVudF9pZCI6MCwidXNlcl9ncm91cF9pZCI6MCwiYXNzaWduZWRfc2FsZXNfdXNlciI6NzIyMjcsIm9yaWdpbmF0b3IiOjI4NDAsImlzX2xlbmRlcl9hZG1pbiI6MCwic3RhdHVzIjoiYWN0aXZlIiwib3N2X25hbWUiOm51bGwsImZpcnN0bG9naW4iOiIxIiwiY3JlYXRlZG9uIjoiMjAyMC0xMS0xOVQwOToyOTo0NC4wMDBaIiwidXBkYXRlX3RpbWUiOiIyMDIxLTA2LTI5VDA3OjA4OjU3LjAwMFoiLCJpc19sZW5kZXJfbWFuYWdlciI6MSwib3JpZ2luIjoiU3VwZXIgQWRtaW5pc3RyYXRvciBBZGQiLCJ3aGl0ZV9sYWJlbF9pZCI6IjEiLCJkZWFjdGl2YXRlX3JlYXNzaWduIjoiTm8iLCJub3RpZmljYXRpb25fcHVycG9zZSI6NCwidXNlcl9zdWJfdHlwZSI6bnVsbCwibm90aWZpY2F0aW9uX2ZsYWciOiJubyIsImNyZWF0ZWRieVVzZXIiOjI4NDAsInNvdXJjZSI6Ik5hbWFzdGVjcmVkaXQiLCJjaGFubmVsX3R5cGUiOiIxIiwib3RwIjpudWxsLCJ3b3JrX3R5cGUiOiIxIiwicHJvZmlsZV9jb21wbGV0aW9uIjozLCJwaWMiOm51bGwsImxvZ2luX3N0YXR1cyI6MTYyNDk1MTIxOTQ0ODY0NDgsImJyYW5jaF9pZCI6bnVsbH0sImlhdCI6MTYyNDk1MTIxOSwiZXhwIjoxNjI1MDM3NjE5fQ.qg7y5CZPRnG_SRA457r8l1hmt6CQhcWl5zvsw4hzsKk";

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
