/* Populate search of bank with list of banks */

import { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import useFetch from 'hooks/useFetch';
import SearchSelect from '../SearchSelect';
import {
	IFSC_LIST_FETCH,
	BANK_LIST_FETCH,
	BANK_LIST_FETCH_RESPONSE,
} from '_config/app.config';
import { FlowContext } from 'reducer/flowReducer';
import { FormContext } from 'reducer/formReducer';
// import { UserContext } from 'reducer/userReducer';
// import { BussinesContext } from 'reducer/bussinessReducer';
import axios from 'axios';
// import { API_END_POINT } from '_config/app.config';

// const Input = styled.input`
// 	height: 50px;
// 	padding: 10px;
// 	width: 100%;
// 	border: 1px solid rgba(0, 0, 0, 0.1);
// 	border-radius: 6px;
// `;

export default function BankList(props) {
	const { field, onSelectOptionCallback, value } = props;
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	const { app } = useSelector(state => state);

	const { userToken } = app;

	const {
		actions: { setIfscList },
	} = useContext(FlowContext);

	const {
		actions: { setFlowData },
	} = useContext(FormContext);

	// const {
	// 	state: { userToken },
	// } = useContext(UserContext);

	// const {
	// 	state: { companyDetail },
	// } = useContext(BussinesContext);

	const { response } = useFetch({
		url: BANK_LIST_FETCH,
		headers: {
			Authorization: `Bearer ${userToken}`,
		},
	});

	const getIfscData = async bankId => {
		if (typeof bankId === 'string' || typeof bankId === 'number') {
			try {
				const ifscDataReq = await axios.get(IFSC_LIST_FETCH, {
					params: { bankId: bankId },
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				});
				if (ifscDataReq.data.status === 'ok') {
					// setIfscList(ifscDataReq?.data?.IFSC_list || []);
					setIfscList(ifscDataReq?.data.IFSC_list);
				}
			} catch (err) {
				console.error(err);
			}
		}
	};
	const [options, setOptions] = useState([]);

	useEffect(() => {
		if (response) {
			setOptions(
				response.map(bank => ({
					value: bank.id.toString(),
					name: bank.bankname,
				}))
			);
			setFlowData(response, BANK_LIST_FETCH_RESPONSE);
		}
		// eslint-disable-next-line
	}, [response]);

	// useEffect(() => {
	// 	console.log(bankToken, '333');
	// 	console.log(clientToken, '222');
	// 	console.log(userToken, '111');
	// }, []);

	// TODO: provide custom label to bank details and emi details section
	return (
		<SearchSelect
			// customLabel='Bank Name'
			onBlurCallback={() => {
				if (field.ifsc_required) {
					getIfscData(value.value);
				}
			}}
			field={field}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={options}
			onSelectOptionCallback={onSelectOptionCallback}
			defaultValue={value}
			disabled={isViewLoan}
		/>
	);
}
