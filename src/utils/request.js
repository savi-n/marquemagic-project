/* This util file is used to make api calls */

import axios from 'axios';
import { ENDPOINT_BANK } from '../_config/app.config';

export const getKYCData = async (formData, token) => {
	try {
		const url = `${ENDPOINT_BANK}/getKycDataUiUx`;
		const config = {
			headers: {
				'Content-type': 'multipart/form-data',
				Authorization: token,
			},
		};
		const g = await axios.post(url, formData, config);
		const t = await g;
		// USE THIS FOR TESTING WHEN FORENSIC API IS NOT READY
		// if (t) {
		// 	t.data.forensicData = {};
		// 	t.data.forensicData.flag = 'warning';
		// 	t.data.forensicData.flag_message =
		// 		'Uploaded document is tampered. Please Upload an authentic document or proceed with uploaded document';
		// }
		return t;
	} catch (err) {
		if (err.response) {
			return { data: err.response.data };
		}
		return { data: { message: err.message, status: 'nok' } };
	}
};
export const getKYCDataId = async (id, formData, token) => {
	try {
		const url = `${ENDPOINT_BANK}/getKycDataUiUx?ref_id=${id}`;
		const config = {
			headers: {
				'Content-type': 'multipart/form-data',
				Authorization: token,
			},
		};
		const g = await axios.post(url, formData, config);
		const t = await g;
		return t;
	} catch (err) {
		if (err.response) {
			return { data: err.response.data };
		}
		return { data: { message: err.message, status: 'nok' } };
	}
};
export const verifyPan = async (ref_id, number, name, token) => {
	try {
		const url = `${ENDPOINT_BANK}/verifyKycData`;
		const g = await axios.post(
			url,
			{ ref_id, number, name, doc_type: 'pan' },
			{ headers: { Authorization: token } }
		);
		const t = await g;
		return t;
	} catch (err) {
		if (err.response) {
			return { data: err.response.data };
		}
		return { status: 500, message: err.message };
	}
};

export const gstFetch = async (pan_number, state_code, gstin, token) => {
	const url = `${ENDPOINT_BANK}/GSTData`;
	if (state_code == null) state_code = '22';
	try {
		const g = await axios.post(
			url,
			{
				//pan_number, state_code,
				gst: gstin,
			},
			{ headers: { Authorization: token } }
		);
		const t = await g;
		return t;
	} catch (err) {
		if (err.response) {
			return { data: err.response.data };
		}
		return { status: 500, message: err.message };
	}
};
