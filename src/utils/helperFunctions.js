import axios from 'axios';

const formatOptionsKeys = {
	bank_details: { id: 'id', name: 'bankname', queryKey: 'bankId' },
	business_details: {
		id: 'id',
		name: 'IndustryName',
		queryKey: 'IndustryName',
	},
	// may need modifications
	employment_details: {
		id: 'id',
		name: 'IndustryName',
		queryKey: 'IndustryName',
	},
};

export const fetchOptions = async data => {
	const { fetchOptionsURL, sectionId } = data;
	let formatedOptions;
	try {
		const resOptions = await axios.get(fetchOptionsURL);

		formatedOptions = resOptions?.data?.data?.map(option => {
			return {
				name: option?.[formatOptionsKeys?.[sectionId]?.['name']],
				value: `${option?.[formatOptionsKeys?.[sectionId]?.['id']]}`,
			};
		});
	} catch (error) {
		console.error(error);
	}
	return formatedOptions;
};

export const fetchSubCompOptions = async data => {
	const { reqURL, sectionId, selectedOption, value } = data;
	if (reqURL) {
		try {
			const dynamicKeyName = formatOptionsKeys?.[sectionId]?.['queryKey'];
			const selectedValue = selectedOption?.value || value;
			const fetchRes = await axios.get(reqURL, {
				params: {
					[dynamicKeyName]: selectedValue,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				let newOptionsList = [];
				// we should get all the options in an option array
				fetchRes.data.options = fetchRes?.data?.data || fetchRes?.data?.message;
				console.log({ res: fetchRes?.data?.options });
				fetchRes?.data?.options?.length === 0
					? (newOptionsList = [{ value: '', name: '' }])
					: fetchRes?.data?.options?.map(subOption => {
							newOptionsList.push({
								value: `${subOption?.id}`,
								name: `${subOption?.subindustry ||
									subOption?.IndustryName ||
									subOption.name}`,
							});
							return null;
					  });
				return newOptionsList;
			}
		} catch (err) {
			console.error(err);
		}
	}
};

export const maxUploadSize =
	JSON.parse(sessionStorage.getItem('permission'))?.document_mapping &&
	JSON.parse(JSON.parse(sessionStorage.getItem('permission'))?.document_mapping)
		?.document_file_limit &&
	JSON.parse(JSON.parse(sessionStorage.getItem('permission'))?.document_mapping)
		?.document_file_limit.length > 0
		? JSON.parse(
				JSON.parse(sessionStorage.getItem('permission'))?.document_mapping
		  )?.document_file_limit[0]?.max_file_size
		: null;

export const validateFileUpload = files => {
	const respFile = [];
	if (maxUploadSize) {
		if (files && files.length > 0) {
			files.map(selectedFile => {
				if (selectedFile.size > maxUploadSize * 1024 * 1024) {
					// setFile(null);
					respFile.push({
						status: 'fail',
						file: selectedFile,
						error: `File size exceeded ${maxUploadSize}MB. Please select another file`,
					});
				} else {
					respFile.push({ status: 'pass', file: selectedFile });
				}
			});
		}
	} else {
		files.map(selectedFile => {
			respFile.push({ status: 'pass', file: selectedFile });
		});
	}
	return respFile;
};
