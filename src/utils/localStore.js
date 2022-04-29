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
