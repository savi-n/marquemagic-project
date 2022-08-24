/* Populate search of ifsc with list of banks */

import { useState, useEffect, useContext } from 'react';
import { FlowContext } from '../../reducer/flowReducer';
import useFetch from 'hooks/useFetch';
import SearchSelect from '../SearchSelect';
import { IFSC_LIST_FETCH } from '_config/app.config';
import { UserContext } from 'reducer/userReducer';
import { BussinesContext } from 'reducer/bussinessReducer';
import { includes } from 'lodash';
import useForm from '../../hooks/useForm';
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
		actions: { setIfscList },
	} = useContext(FlowContext);
	const { field, onSelectOptionCallback, value } = props;

	const { handleSubmit, register, formState, clearError } = useForm();
	// if (field.name.includes('ifsc')) {
	// 	field.mask = {};
	// 	field.rules = {};
	// }

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const {
		state: { userToken },
	} = useContext(UserContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const [options, setOptions] = useState([]);

	const onIfscChange = value => {
		const newOptions = _.cloneDeep(options);
		newOptions.push({ value, name: value });
		setOptions(newOptions);
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

	return (
		<SearchSelect
			field={field}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={options}
			onSelectOptionCallback={onSelectOptionCallback}
			defaultValue={value}
			disabled={isViewLoan}
			onIfscChange={onIfscChange}
		/>
	);
}
