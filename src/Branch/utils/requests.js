import axios from 'axios';
import CryptoJS from 'crypto-js';
import { API_END_POINT, SECRET } from '../../_config/app.config';

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
		headers: { Authorization: `Bearer ${token}` },
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
			headers: { Authorization: `Bearer ${token}` }
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
			headers: { Authorization: `Bearer ${token}` }
		}
	);
	const t = await g;
	return t.data;
};

export const getWhiteLabelPermission = async (token = userToken) => {
	const g = await axios.get(`${API_END_POINT}/whiteLabelPermission`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	const t = await g;
	localStorage.setItem('permission', JSON.stringify(t.data.data.permission));
};

export const getLoanDocs = async (token = userToken) => {
	const g = await axios.get(`${API_END_POINT}/Loanrequest`, { headers: { Authorization: `Bearer ${token}` } });
	const t = await g;
	console.log(t);
};

export const loanDocMapping = async (loanId, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/applicantMapping/view`,
		{ loanId },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	const t = await g;
};

export const viewDocument = async (loan_id, userid, filename, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/viewDocument`,
		{ filename, userid, loan_id },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	const t = await g;

	const dec = data => {
		var rawData = CryptoJS.enc.Base64.parse(data);
		var key = CryptoJS.enc.Latin1.parse(SECRET);
		var iv = CryptoJS.enc.Latin1.parse(SECRET);
		var plaintextData = CryptoJS.AES.decrypt({ ciphertext: rawData }, key, { iv: iv });
		var plaintext = plaintextData.toString(CryptoJS.enc.Latin1);
		t.data.signedurl = plaintext;
		window.open(plaintext);
	};
	dec(t.data.signedurl);
};

export const needAction = async (ncStatusManageName, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/branch/loanListAlert`,
		{ ncStatusManageName },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	const t = await g;
	console.log(t);
};

export const getApprovalStatus = async (loanId, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/branch/getApproverList`,
		{ loanId },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	const t = await g;
	console.log(t);
};

export const assignUserToLoan = async (loanId, assignUserId, comment, token = userToken) => {
	const g = await axios.post(
		`${API_END_POINT}/branch/assignUserToLoan`,
		{ loanId, assignUserId, comment },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	const t = await g;
	console.log(t);
};

export const searchData = async (caseData, token = userToken) => {
	if (caseData !== '') {
		const g = await axios.post(
			`${API_END_POINT}/cub/viewCaseDetails`,
			{ caseData },
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		const t = await g;
		return t.data.result ? t.data.result : t.data.message;
	}
};
