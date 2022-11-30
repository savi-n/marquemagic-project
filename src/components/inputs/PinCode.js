/* Input field which is used to search if valid pincode is entered and
based on this search city and state is identified */

import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';

import useFetch from 'hooks/useFetch';
import { PINCODE_ADRRESS_FETCH, PINCODE_RESPONSE } from '_config/app.config';
import InputField from './InputField';
import { useToasts } from 'components/Toast/ToastProvider';
import { FormContext } from 'reducer/formReducer';
import _ from 'lodash';
import { getFlowData } from 'utils/localStore';

// const Input = styled.input`
// 	height: 50px;
// 	padding: 10px;
// 	width: 100%;
// 	border: 1px solid rgba(0, 0, 0, 0.1);
// 	border-radius: 6px;
// 	position: relative;
// `;

const Div = styled.div`
	position: relative;
	/* overflow: hidden; */
`;

const Label = styled.label`
	position: absolute;
	background: rgba(0, 0, 0, 0.3);
	top: -10%;
	bottom: 0%;
	left: 0%;
	right: 0%;
	z-index: 9;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(15px);

	&:before {
		content: '';
		border: 5px solid lightgrey;
		border-bottom-color: white;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		animation: rotating 2s linear infinite;
	}

	@keyframes rotating {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
`;

const getCityStateName = (props, k) => {
	if (
		props?.name.split('_')[0].includes('permanent') ||
		props?.name.split('_')[0].includes('present')
	) {
		return `${props.name.split('_')[0]}_${k}`;
	} else {
		return k;
	}
};

export default function Pincode(props) {
	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const [processing, setProcessing] = useState(false);

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const {
		actions: { setFlowData },
	} = useContext(FormContext);

	useEffect(() => {
		if (props.value) {
			onPinChange({
				target: { name: props.name, value: props.value },
			});
		}
		// eslint-disable-next-line
	}, [props.value]);

	const onPinChange = async event => {
		const { value } = event.target;

		props.onChange(event);

		if (props.noActionTrigger) {
			return;
		}

		if (value.length === props.makeApiCall) {
			if (isViewLoan) return;
			setProcessing(true);
			try {
				const oldPincodeData = getFlowData(PINCODE_RESPONSE);
				const pincodeResponseHistory = [];
				for (const key in oldPincodeData || {}) {
					pincodeResponseHistory.push(key);
				}
				let selectedPincodeRes = {};
				if (pincodeResponseHistory.includes(value)) {
					selectedPincodeRes = oldPincodeData[value];
				} else {
					const pincodeRes = await newRequest(
						PINCODE_ADRRESS_FETCH({ pinCode: value }),
						{}
					);

					if (pincodeRes.status === 'nok' || !pincodeRes) {
						setProcessing(false);
						return;
					}
					selectedPincodeRes = pincodeRes.data;
					const newPincodeData = _.cloneDeep(oldPincodeData);
					newPincodeData[value] = selectedPincodeRes;
					setFlowData(newPincodeData, PINCODE_RESPONSE);
				}
				// const pincodeData = pincodeResponse.data;
				//console.log(response);
				for (const [k, v] of props.value_for_fields) {
					const target = {
						name: getCityStateName(props, k),
						value: selectedPincodeRes?.[v]?.[0] || '',
					};
					props.onChange({ target });
				}
			} catch (err) {
				setProcessing(false);
				// console.log(err);
				addToast({
					message:
						'Could not fetch the data for entered pincode' || err.message,
					type: 'error',
				});
			}
		}
		setProcessing(false);
	};

	return (
		<Div>
			<InputField
				type={'text'}
				{...props}
				onChange={onPinChange}
				processing={processing}
			/>
			{processing && <Label />}
		</Div>
	);
}
