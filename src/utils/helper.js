/* This file contains helper functions and the functions are used in file upload */
export const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const asyncForEach = async (array, callback) => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
};
