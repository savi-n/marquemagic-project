/* This util file is used to store data/formdata in local/session storage */

const name = window.location.hostname;

export function setStore(data, dataFrom) {
	const storeData = {
		...(JSON.parse(sessionStorage.getItem(name)) || {}),
		[dataFrom]: data,
	};
	sessionStorage.setItem(name, JSON.stringify(storeData));
}

export function getStore() {
	return {
		...(JSON.parse(sessionStorage.getItem(name)) || {}),
	};
}

export function localStoreUserId(data) {
	sessionStorage.setItem('cub_user_id_dev', JSON.stringify(data));
}

export function removeStore() {
	sessionStorage.removeItem(name);
}

export function resetAllApplicationState() {
	const url = window.location.hostname;
	sessionStorage.removeItem('formstate');
	sessionStorage.removeItem('formstatepan');
	sessionStorage.removeItem('aadhar');
	sessionStorage.removeItem('encryptWhiteLabel');
	sessionStorage.removeItem('userToken');
	sessionStorage.removeItem('documentReducer');
	sessionStorage.removeItem(url);
	const wt_lbl = sessionStorage.getItem('wt_lbl');
	const userDetails = sessionStorage.getItem('userDetails');
	sessionStorage.clear();
	sessionStorage.setItem('wt_lbl', wt_lbl);
	userDetails && sessionStorage.setItem('userDetails', userDetails);
}
