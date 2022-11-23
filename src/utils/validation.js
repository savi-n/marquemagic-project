export const isInvalidPan = pan => {
	if (!pan) return 'Please enter pan';
	if (pan.length !== 10) return 'PanNumber should be 10 digits';
	const lastFourDigitsValidation = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/.test(
		pan
	);
	if (!lastFourDigitsValidation || pan.trim().length <= 0)
		return 'Please specify a valid Pan Number';
	return false;
};

export const isInvalidAadhaar = aadhaar => {
	const invalidStart = [0, 1, '0', '1'];
	if (!aadhaar) {
		return 'Please enter aadhaar number';
	}
	if (aadhaar.length !== 12) {
		return 'Aadhar number should be 12 digit';
	}
	if (invalidStart.includes(aadhaar[0])) {
		return 'Invalid aadhaar number';
	}
	const regexForNumber = /^[0-9\b]+$/;
	if (!regexForNumber.test(aadhaar)) {
		return 'Aadhaar number should not contain alphabets';
	}
};
