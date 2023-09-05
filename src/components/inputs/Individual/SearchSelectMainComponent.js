/* Populate search of bank with list of banks */
import { useEffect, useState } from 'react';
import SearchSelect from '../../SearchSelect';
// import axios from 'axios';
import { fetchSubCompOptions } from 'utils/helperFunctions';
export default function SearchSelectMainComponent(props) {
	const { field, onSelectOptionCallback, value } = props;
	const {
		apiURL,
		mainComponentOptions,
		setSubComponentOptions,
		sectionId,
		errMessage,
	} = field;
	const [selectedOption, setSelectedOption] = useState(value);

	const onOptionSelectCallback = selectedOption => {
		onSelectOptionCallback({
			name: selectedOption.name,
			value: selectedOption.value.value,
		});
	};

	// const getSelectedFieldData = async () => {
	// 	if (apiURL) {
	// 		try {
	// 			const resData = await axios.get(apiURL, {
	// 				params: {
	// 					bankId: selectedOption.value || value,
	// 				},
	// 			});
	// 			if (resData?.data?.status === 'ok') {
	// 				const newOptionsList = [];
	// 				resData.data.options = resData?.data?.IFSC_list;
	// 				resData?.data?.options?.length === 0
	// 					? newOptionsList.push({ value: '', name: '' })
	// 					: resData?.data?.options?.map(bank => {
	// 							newOptionsList.push({
	// 								value: `${bank?.ifsc}`,
	// 								name: `${bank?.ifsc}`,
	// 							});
	// 							return null;
	// 					  });
	// 				setSubComponentOptions(prev => (prev = newOptionsList));
	// 			}
	// 		} catch (err) {
	// 			console.error(err);
	// 		}
	// 	}
	// };

	// useEffect(async () => {
	// 	setOptions(mainComponentOptions);
	// }, [mainComponentOptions.length]);
	const fetchSubComponents = async () => {
		try {
			if (!value) return;
			if (apiURL) {
				const subOptions = await fetchSubCompOptions({
					reqURL: apiURL,
					sectionId: sectionId,
					selectedOption,
					value,
				});
				console.log({ subOptions });
				setSubComponentOptions(subOptions);
			}
		} catch (error) {
			console.error(error, 'Searchselect-sub-component-fetchSubCompoents');
		}
	};
	/* Fetching the sub-component options starts */
	useEffect(() => {
		fetchSubComponents();
		//eslint-disable-next-line
	}, [selectedOption]);

	return (
		<SearchSelect
			onBlurCallback={() => {
				setSelectedOption(value);
			}}
			field={field}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={mainComponentOptions}
			onSelectOptionCallback={onOptionSelectCallback}
			defaultValue={value}
			disabled={field.disabled}
			rules={field.rules}
			errorMessage={errMessage || 'No Options Found'}
		/>
	);
}
