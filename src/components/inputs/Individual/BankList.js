/* Populate search of bank with list of banks */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SearchSelect from '../../SearchSelect';
import { IFSC_LIST_FETCH } from '_config/app.config';
import { setIfscList } from 'store/appSlice';
import axios from 'axios';

export default function BankList(props) {
	const { field, onSelectOptionCallback, value } = props;
	const { bankList } = useSelector(state => state.app);
	const [bankId, setBankId] = useState(value);
	const dispatch = useDispatch();

	const getIfscData = async () => {
		try {
			const ifscDataRes = await axios.get(IFSC_LIST_FETCH, {
				params: { bankId: bankId },
			});
			// console.log('ifscDataRes-', { ifscDataRes });
			if (ifscDataRes?.data?.status === 'ok') {
				const newIfscList = [];
				ifscDataRes?.data?.IFSC_list?.map(bank => {
					newIfscList.push({
						value: `${bank?.ifsc}`,
						name: `${bank?.ifsc}`,
					});
					return null;
				});
				dispatch(setIfscList(newIfscList));
			}
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		if (!value) return;
		if (!field?.ifsc_required) return;
		getIfscData();
		// console.log('banklist-value-changed-', value);
		// eslint-disable-next-line
	}, [bankId]);

	return (
		<SearchSelect
			// customLabel='Bank Name'
			onBlurCallback={() => {
				// if (field.ifsc_required) {
				// getIfscData(value.value);
				setBankId(value?.value);
				// }
			}}
			field={field}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={bankList}
			onSelectOptionCallback={onSelectOptionCallback}
			defaultValue={value}
			disabled={field.disabled}
		/>
	);
}
