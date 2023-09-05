/* Populate search of ifsc with list of banks */
import { useState, useEffect } from 'react';
import SearchSelect from '../../SearchSelect';

export default function SearchSelectSubComponent(props) {
	const { field, onSelectOptionCallback, value } = props;
	const { errMessage, subComponentOptions } = field;

	const [subOptions, setSubOptions] = useState(subComponentOptions);

	const onOptionSelectCallback = selectedOption => {
		// console.log(selectedOption);
		onSelectOptionCallback({
			name: selectedOption.name,
			value: selectedOption.value.value,
		});
	};

	// check for the loan is opened in view mode.
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const optionsArr = JSON.stringify(subComponentOptions);
	useEffect(() => {
		// the options that we receives for this component(sub-component), we will set it every time it changes
		if (subComponentOptions?.length > 0) {
			setSubOptions(subComponentOptions);
		}

		// if we pass array directly inside dependency array It can cause infinite render, hence passing by stringifying it
		//eslint-disable-next-line
	}, [optionsArr]);
	return (
		<SearchSelect
			field={field}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={subOptions || subComponentOptions}
			onSelectOptionCallback={onOptionSelectCallback}
			defaultValue={value}
			disabled={field?.disabled || isViewLoan}
			rules={field.rules}
			errorMessage={errMessage || 'Options Does Not Matches Your Search'}
		/>
	);
}
