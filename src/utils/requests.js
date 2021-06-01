import axios from 'axios';

import { GENERATE_OTP_URL } from '../_config/app.config';

export const getBankList = async (type, linkRequired, isEncryption) => {
	const body = { email: 'cub@nc.com', white_label_id: 32 };
	const data = await axios.post('http://40.80.80.135:1337/sails-exp/ClientVerify', body);
	const generatedLink = await axios.post('http://40.80.80.135:1337/generateLink', null, {
		headers: { authorization: `${data.data.token}` },
		params: { type, linkRequired, isEncryption }
	});
	localStorage.setItem('token', generatedLink.data.generated_key);
	const bankData = await axios.get('http://40.80.80.135:1337/bank_list', {
		headers: { authorization: localStorage.getItem('token') }
	});
	return bankData.data.banks;
};

export const generateOtp = async (mobileNo, customerId, whiteLabel) => {
	const data = await axios.post(GENERATE_OTP_URL, null, {
		params: {
			mobileNo,
			customerId,
			white_label_id: whiteLabel
		}
	});
	return data.data;
};

export const verifyOtp = async paramsData => {
	const data = await axios.post('http://3.108.54.252:1337/cub/verifyOtp', null, {
		params: { ...paramsData }
	});
	if (!data) return null;
	return data;
};

export const creatCase = async (data, token) => {
	const res = await axios.post(
		'http://3.108.54.252:1337/cub/createCase',
		{ ...data },
		{
			headers: { authorization: `Bearer ${token}` }
		}
	);
	return res;
};

export const getVehicleList = async (el, token, item) => {
	const data = await axios.post('http://3.108.54.252:1337/searchByBrandname/', null, {
		params: { brandName: el, modelName: el, type: '2 wheeler' },
		headers: { authorization: `Bearer ${token}` }
	});
	item.option = data.data.data;
	return data.data.data;
};
