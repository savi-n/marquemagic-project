/* Populate search of ifsc with list of banks */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SearchSelect from '../../SearchSelect';
// import _ from 'lodash';

export default function IfscList(props) {
	const { field, onSelectOptionCallback, value } = props;
	const { ifscList } = useSelector(state => state.app);

	const onIfscSelectCallback = value => {
		onSelectOptionCallback({ name: value.name, value: value.value.value });
	};

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const [options, setOptions] = useState([]);

	// const onIfscChange = value => {
	// const newOptions = _.cloneDeep(options);
	// 11 is the length for any ifsc code
	// if (value.length === 11) {
	// 	newOptions.unshift({ value, name: value });
	// 	setOptions(newOptions);
	// }
	// };
	// useEffect(() => {
	// 	if (ifscList?.length > 0) {
	// 		setOptions(
	// 			ifscList[0].map(bank => ({
	// 				value: bank.ifsc,
	// 				name: bank.ifsc,
	// 			}))
	// 		);
	// 	}
	// }, [ifscList]);

	// useEffect(() => {
	// 	if (value.length > 0) {
	// 		const newOptions = _.cloneDeep(options);
	// 		newOptions.unshift({ value, name: value });
	// 		setOptions(newOptions);
	// 	}
	// 	// eslint-disable-next-line
	// }, []);

	useEffect(() => {
		if (ifscList.length > 0) {
			setOptions(ifscList);
		}
	}, [ifscList]);

	return (
		<SearchSelect
			field={field}
			// ifscLIstField={true}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={options}
			onSelectOptionCallback={onIfscSelectCallback}
			defaultValue={value}
			disabled={field?.disabled || isViewLoan}
			// onIfscChange={onIfscChange}
			rules={field.rules}
		/>
	);
}
