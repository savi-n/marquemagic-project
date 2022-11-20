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
