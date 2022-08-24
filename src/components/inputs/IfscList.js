/* Populate search of ifsc with list of banks */

import { useState, useEffect, useContext } from 'react';

import useFetch from 'hooks/useFetch';
import SearchSelect from '../SearchSelect';
import { IFSC_LIST_FETCH } from '_config/app.config';
import { UserContext } from 'reducer/userReducer';
import { BussinesContext } from 'reducer/bussinessReducer';

// const Input = styled.input`
// 	height: 50px;
// 	padding: 10px;
// 	width: 100%;
// 	border: 1px solid rgba(0, 0, 0, 0.1);
// 	border-radius: 6px;
// `;

export default function IfscList(props) {
	const { field, onSelectOptionCallback, value, ifscData } = props;
	console.log(ifscData, 'hi', '**********ifsc in ifsclist');
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	console.log(ifscData, 'IFSC LIST -');
	const {
		state: { userToken },
	} = useContext(UserContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);
	const { response } = useFetch({
		url: IFSC_LIST_FETCH,
		params: { bankId: 2 },
		headers: {
			Authorization: `Bearer ${userToken ||
				companyDetail?.token ||
				sessionStorage.getItem('userToken')} `,
		},
	});

	const [options, setOptions] = useState([]);

	useEffect(() => {
		console.log('ifscList-useeffect-ifscData', ifscData);
		if (ifscData?.length > 0) {
			setOptions(
				ifscData.map(bank => ({
					value: bank.id.toString(),
					name: bank.ifsc,
				}))
			);
		}
	}, [ifscData]);

	return (
		<SearchSelect
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
