/* Populate search of bank with list of banks */

import { useState, useEffect, useContext } from 'react';

import useFetch from 'hooks/useFetch';
import SearchSelect from '../SearchSelect';
import { BANK_LIST_FETCH } from '_config/app.config';
import { IFSC_LIST_FETCH } from '_config/app.config';
import { UserContext } from 'reducer/userReducer';
import { BussinesContext } from 'reducer/bussinessReducer';
import axios from 'axios';
import { useDispatch } from 'react-redux';

// const Input = styled.input`
// 	height: 50px;
// 	padding: 10px;
// 	width: 100%;
// 	border: 1px solid rgba(0, 0, 0, 0.1);
// 	border-radius: 6px;
// `;

export default function BankList(props) {
	const { field, onSelectOptionCallback, value, ifsc, setIfscData } = props;
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	// console.log('BankList-', props);
	const {
		state: { userToken },
	} = useContext(UserContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const { response } = useFetch({
		url: BANK_LIST_FETCH,
		headers: {
			Authorization: `Bearer ${userToken ||
				companyDetail?.token ||
				sessionStorage.getItem('userToken')} `,
		},
	});
	// console.log(ifscData, 'ifscData in banklist bf fn inv');

	// const [ifscList, setIfscList] = useState([]);
	const getIfscData = async bankId => {
		console.log(bankId, typeof bankId, '-----------');
		if (typeof bankId === 'string' || typeof bankId === 'number') {
			try {
				const ifscDataReq = await axios.get(IFSC_LIST_FETCH, {
					params: { bankId: bankId },
					headers: {
						Authorization: `Bearer ${userToken ||
							companyDetail?.token ||
							sessionStorage.getItem('userToken')}`,
					},
				});
				if (ifscDataReq.data.status === 'ok') {
					// setIfscList(ifscDataReq?.data?.IFSC_list || []);
					console.log(ifscDataReq?.data.IFSC_list);
					setIfscData(ifscDataReq?.data.IFSC_list);
				}
			} catch (err) {
				console.error(err);
				console.log('error occured');
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
		}
	}, [response]);

	// TODO: provide custom label to bank details and emi details section
	return (
		<SearchSelect
			// customLabel='Bank Name'
			onBlurCallback={() => getIfscData(value.value)}
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
