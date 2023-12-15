/* Populate search of ifsc with list of banks */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SearchSelect from '../../SearchSelect';
import { IFSC_LIST_FETCH } from '_config/app.config';
import { setSingleIfscList } from 'store/appSlice';
// import _ from 'lodash';
import axios from 'axios';
// import { useToasts } from 'components/Toast/ToastProvider';

export default function IfscList(props) {
	// const { addToast } = useToasts();
	const { field, onSelectOptionCallback, value } = props;
	const { ifscList, singleIfscList } = useSelector(state => state.app);
	const { selectedBank, setIfscListLoading, sectionIFSC } = field;

	const onIfscSelectCallback = value => {
		onSelectOptionCallback({ name: value.name, value: value.value.value });
	};

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const [, setOptions] = useState([]);
	const dispatch = useDispatch();

	const [loading, setloading] = useState(false);

	const removeDuplicates = arr => {
		const uniqueValues = new Set();

		const uniqueArray = arr.filter(obj => {
			if (!uniqueValues.has(obj.value)) {
				uniqueValues.add(obj.value);
				return true;
			}
			return false;
		});

		return uniqueArray;
	};

	const getNewIfscData = async ifscCode => {
		try {
			setloading(true);
			setIfscListLoading(true);
			const ifscDataRes = await axios.get(IFSC_LIST_FETCH, {
				params: { ifsc: ifscCode, bankId: selectedBank?.value },
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
				dispatch(setSingleIfscList(newIfscList));
			}
		} catch (err) {
			console.error(err);
		} finally {
			setloading(false);
			setIfscListLoading(false);
		}
	};

	const onIfscChange = value => {
		// const newOptions = _.cloneDeep(options);
		const totalIfscList = removeDuplicates([...ifscList, ...singleIfscList]);
		const isIfscCodePresentInCurrentList =
			totalIfscList?.filter(ifsc => ifsc.value === value)?.length > 0;
		if (value.length > 10 && !isIfscCodePresentInCurrentList) {
			getNewIfscData(value);
		}
	};

	useEffect(() => {
		getNewIfscData(value);
		// eslint-disable-next-line
	}, []);
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

	const combinedIfscOptions =
		ifscList?.[0]?.value?.slice(0, 5) ===
		singleIfscList?.[0]?.value?.slice(0, 5)
			? removeDuplicates([...ifscList, ...singleIfscList])
			: ifscList;

	// console.log({ ifscList, singleIfscList });

	return (
		<SearchSelect
			field={field}
			// ifscLIstField={true}
			// onBlurCallback={() => {
			// 	// if (field.ifsc_required) {
			// 	// getIfscData(value.value);
			// 	setifscCode(value?.value);
			// 	// }
			// }}
			name={field.name}
			placeholder={field.placeholder || ''}
			options={combinedIfscOptions}
			onSelectOptionCallback={onIfscSelectCallback}
			defaultValue={value || sectionIFSC}
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
