import axios from 'axios';

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

export const generateOtp = async (mobileNo, customerId) => {
	const data = await axios.post('http://54.255.204.250:1337/cub/generateOtp', null, {
		params: { mobileNo, customerId, white_label_id: JSON.parse(localStorage.getItem('wt_lbl')).id }
	});
	console.log(data);
};
