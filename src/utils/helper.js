/* This file contains helper functions and the functions are used in file upload */
export const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const asyncForEach = async (array, callback) => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
};

export const getRandomNumber = (min = 10000, max = 99999) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

export const isBusinessPan = companyName => {
	return (
		companyName?.toLowerCase()?.includes('private limited') ||
		companyName?.toLowerCase()?.includes('public limited') ||
		companyName?.toLowerCase()?.includes('limited') ||
		companyName?.toLowerCase()?.includes('pvt ltd') ||
		companyName?.toLowerCase()?.includes('private')
	);
};

export const getGeoLocation = () => {
	return new Promise((resolve, reject) => {
		try {
			const getPosition = position =>
				resolve({
					latitude: position?.coords?.latitude,
					longitude: position?.coords?.longitude,
					timestamp: position?.timestamp,
					// timestamp: moment(position?.timestamp).format('MM/DD/YYYY HH:mm:ss'),
				});
			const gotError = error => reject(false);
			navigator?.geolocation?.getCurrentPosition(getPosition, gotError);
		} catch (error) {
			reject(false);
		}
	});
};

export const extractPincode = singleLineAddress => {
	const pinRegex = /\b\d{6}\b/; // regex to match 6-digit pin code
	return singleLineAddress?.match(pinRegex)?.reverse()[0] ?? '';
};

export const scrollToTopRootElement = () => {
	document.getElementById('root').scrollTop = 0;
};
