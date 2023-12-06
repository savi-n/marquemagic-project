/* Populate search of ifsc with list of banks */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SearchSelect from '../../SearchSelect';
import { IFSC_LIST_FETCH } from '_config/app.config';
import { setIfscList } from 'store/appSlice';
// import _ from 'lodash';
import axios from 'axios';

export default function IfscList(props) {
	const { field, onSelectOptionCallback, value } = props;
	const { ifscList } = useSelector(state => state.app);

	const onIfscSelectCallback = value => {
		onSelectOptionCallback({ name: value.name, value: value.value.value });
	};

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const [, setOptions] = useState([]);
	const dispatch = useDispatch();
	const [ifscCode, setifscCode] = useState(value);

	const [loading, setloading] = useState(false);

	const getNewIfscData = async () => {
		setloading(true);

		try {
			const ifscDataRes = await axios.get(IFSC_LIST_FETCH, {
				params: { ifsc: ifscCode },
			});

			if (ifscDataRes?.data?.status === 'ok') {
				const newIfscList = [];
				ifscDataRes?.data?.IFSC_list?.length === 0
					? newIfscList.push({ value: '', name: '' })
					: ifscDataRes?.data?.IFSC_list?.map(bank => {
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
		} finally {
			setloading(false);
		}
	};

	const onIfscChange = value => {
		// const newOptions = _.cloneDeep(options);
		if (value.length > 10) {
			setifscCode(value);

			getNewIfscData();
		}

		// 11 is the length for any ifsc code
		// if (value.length === 11) {
		// 	newOptions.unshift({ value, name: value });
		// 	setOptions(newOptions);
		// }
	};
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
			onBlurCallback={() => {
				// if (field.ifsc_required) {
				// getIfscData(value.value);
				setifscCode(value?.value);
				// }
			}}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={ifscList}
			onSelectOptionCallback={onIfscSelectCallback}
			defaultValue={value}
			disabled={field?.disabled || isViewLoan}
			onIfscChange={onIfscChange}
			rules={field.rules}
			errorMessage={
				loading
					? 'Loading...Please wait'
					: 'IFSC Not Available. Please check with the Support Team.'
			}
		/>
	);
}
