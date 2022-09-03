/* This util file is used to store data/formdata in local/session storage */

import { HOSTNAME } from '_config/app.config';

export function setStore(data, dataFrom) {
	const storeData = {
		...(JSON.parse(sessionStorage.getItem(HOSTNAME)) || {}),
		[dataFrom]: data,
	};
	sessionStorage.setItem(HOSTNAME, JSON.stringify(storeData));
}

export function getStore() {
	return {
		...(JSON.parse(sessionStorage.getItem(HOSTNAME)) || {}),
	};
}

export function localStoreUserId(data) {
	sessionStorage.setItem('cub_user_id_dev', JSON.stringify(data));
}

export function removeStore() {
	sessionStorage.removeItem(HOSTNAME);
}

export function resetAllApplicationState() {
	sessionStorage.removeItem('formstate');
	sessionStorage.removeItem('formstatepan');
	sessionStorage.removeItem('aadhar');
	sessionStorage.removeItem('encryptWhiteLabel');
	sessionStorage.removeItem('userToken');
	sessionStorage.removeItem('documentReducer');
	sessionStorage.removeItem(HOSTNAME);
	const wt_lbl = sessionStorage.getItem('wt_lbl');
	const userDetails = sessionStorage.getItem('userDetails');
	sessionStorage.clear();
	sessionStorage.setItem('wt_lbl', wt_lbl);
	userDetails && sessionStorage.setItem('userDetails', userDetails);
}
