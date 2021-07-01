import axios from 'axios';
import { API_END_POINT } from '../../_config/app.config';

const userToken = localStorage.getItem('token');

export const getNCStatus = (token = userToken) => {
	axios
		.get(`${API_END_POINT}/case_nc_status`, {
			headers: { Authorization: `${token}` }
		})
		.then(res => {
			return res;
		});
};

export const getCase = async (order, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/branch/viewLoan`,
		{ ncStatus: `${order}` },
		{
			headers: { Authorization: `Bearer ${token}` }
		}
	);

	const t = await g;
	return g.data.loanList;
};

export const getUsersList = async (token = userToken) => {
	const g = await axios.get(`${API_END_POINT}/branch/getUserList`, {
		headers: { Authorization: `${token}` },
		params: { userType: 'Branch' }
	});
	const t = await g;
	return t;
};

export const reassignLoan = async (loanId, reAssignTo, comments, recommendation, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/branch/reAssignLoans`,
		{ loanId, reAssignTo, comments, recommendation },
		{
			headers: { Authorization: `${token}` }
		}
	);

	const t = await g;
	return t;
};

export const getLoanDetails = async (loanId, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/cub/getLoanDeatils`,
		{ loanId },
		{
			headers: { Authorization: `${token}` }
		}
	);
	const t = await g;
};
