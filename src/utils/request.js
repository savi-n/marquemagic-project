import axios from 'axios';
import { API_END_POINT } from '../_config/app.config';

export const getKYCData = async (formData, token) => {
	const url = 'http://40.80.80.135:1337/getKycData';
	const config = {
		headers: {
			'Content-type': 'multipart/form-data',
			Authorization: token
		}
	};
	console.log(formData.get('document'));
	const g = await axios.post(url, formData, config);
	const t = await g;
	return t;
};

export const verifyPan = async (ref_id, req_id, token) => {
	const url = 'http://40.80.80.135:1337/verifyKycData';
	const g = await axios.post(url, { req_id, ref_id }, { headers: { Authorization: token } });
	const t = await g;
};

export const gstFetch = async (pan_number, token) => {
	const url = 'http://40.80.80.135:1337/GSTData';
	const g = await axios.post(url, { pan_number, state_code: '22' }, { headers: { Authorization: token } });
	const t = await g;
	return t;
};
