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

	const resOptions = await axios.get(fetchOptionsURL);
	const formatedOptions = resOptions?.data?.message?.map(option => {
		return {
			name: option?.[formatOptionsKeys?.[sectionId]?.['name']],
			value: `${option?.[formatOptionsKeys?.[sectionId]?.['name']]}`,
		};
	});
	return formatedOptions;
};

export const fetchSubCompOptions = async data => {
	const { reqURL, sectionId, selectedOption, value } = data;
	if (reqURL) {
		try {
			const dynamicKeyName = formatOptionsKeys?.[sectionId]?.['queryKey'];
			const selectedValue = selectedOption?.value || value;
			console.log(selectedOption);
			const fetchRes = await axios.get(reqURL, {
				params: {
					[dynamicKeyName]: selectedValue,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				let newOptionsList = [];
				// we should get all the options in an option array
				fetchRes.data.options = fetchRes?.data?.data || fetchRes?.data?.message;
				fetchRes?.data?.options?.length === 0
					? (newOptionsList = [{ value: '', name: '' }])
					: fetchRes?.data?.options?.map(subOption => {
							newOptionsList.push({
								value: `${subOption?.IndustryName}`,
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
