/* Populate search of ifsc with list of banks */

import { useState, useEffect, useContext } from 'react';
import { FlowContext } from '../../reducer/flowReducer';

import SearchSelect from '../SearchSelect';
import _ from 'lodash';
// const Input = styled.input`
// 	height: 50px;
// 	padding: 10px;
// 	width: 100%;
// 	border: 1px solid rgba(0, 0, 0, 0.1);
// 	border-radius: 6px;
// `;

export default function IfscList(props) {
	const {
		state: { ifscList },
	} = useContext(FlowContext);
	const { field, onSelectOptionCallback, value } = props;
	const onIfscSelectCallback = value => {
		onSelectOptionCallback({ name: value.name, value: value.value.value });
	};

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const [options, setOptions] = useState([]);

	const onIfscChange = value => {
		const newOptions = _.cloneDeep(options);
		// 11 is the length for any ifsc code
		if (value.length === 11) {
			newOptions.unshift({ value, name: value });
			setOptions(newOptions);
		}
	};
	useEffect(() => {
		if (ifscList?.length > 0) {
			setOptions(
				ifscList[0].map(bank => ({
					value: bank.ifsc,
					name: bank.ifsc,
				}))
			);
		}
	}, [ifscList]);
	useEffect(() => {
		if (value.length > 0) {
			const newOptions = _.cloneDeep(options);
			newOptions.unshift({ value, name: value });
			setOptions(newOptions);
		}
	}, []);

	return (
		<SearchSelect
			field={field}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={options}
			onSelectOptionCallback={onIfscSelectCallback}
			defaultValue={value}
			disabled={isViewLoan}
			onIfscChange={onIfscChange}
		/>
	);
}
