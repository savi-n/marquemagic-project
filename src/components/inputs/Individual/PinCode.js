/* Input field which is used to search if valid pincode is entered and
based on this search city and state is identified */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import InputField from '../InputField';
import { PINCODE_ADRRESS_FETCH } from '_config/app.config';
import { useToasts } from 'components/Toast/ToastProvider';
import { addCacheAPIReqRes } from 'store/applicationSlice';
import axios from 'axios';

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

const showCityState = (props, k) => {
	if (
		props?.name.split('_')[0].includes('permanent') ||
		props?.name.split('_')[0].includes('present')
	) {
		return `${props.name.split('_')[0]}_${k}`;
	} else {
		return k;
	}
};

const PINCODE_PATH = 'pincode';

export default function Pincode(props) {
	const { app, application } = useSelector(state => state);
	const { isViewLoan, permission } = app;
	const { api } = application;
	const { addToast } = useToasts();
	const [processing, setProcessing] = useState(false);
	const dispatch = useDispatch();

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

		if (
			value.length === props.makeApiCall ||
			value.length === props.make_api_call
		) {
			if (isViewLoan) return;
			if (processing) return;
			setProcessing(true);
			try {
				let selectedPincodeRes = {};
				const API_REQ_ID = `${value}`;
				const isPinCodeResExist = !!api?.[PINCODE_PATH]?.[API_REQ_ID];
				if (isPinCodeResExist) {
					selectedPincodeRes = api?.[PINCODE_PATH]?.[API_REQ_ID];
				} else {
					const pincodeRes = await axios.get(
						PINCODE_ADRRESS_FETCH({
							pinCode: value,
							Country: permission?.country,
						})
					);
					if (pincodeRes.status === 'nok' || !pincodeRes) {
						await addToast({ message: 'Invalid Pincode', type: 'error' });
						setProcessing(false);
						return;
					}
					selectedPincodeRes = pincodeRes.data;
					dispatch(
						addCacheAPIReqRes({
							path: PINCODE_PATH,
							reqId: API_REQ_ID,
							res: selectedPincodeRes,
						})
					);
				}
				//Setting Locality
				sessionStorage.setItem(
					'locality',
					selectedPincodeRes?.locality?.[0] || ''
				);
				for (const [k, v] of props.value_for_fields) {
					const target = {
						name: showCityState(props, k),
						value: selectedPincodeRes?.[v]?.[0] || 'NA',
					};
					props.onChange({ target });
				}
			} catch (error) {
				setProcessing(false);
				console.error('error-pincodefetch-', error);
				for (const [k] of props.value_for_fields) {
					const target = {
						name: showCityState(props, k),
						value: 'NA',
					};
					props.onChange({ target });
				}
				// addToast({
				// 	message:
				// 		'Could not fetch the data for entered pincode' || err.message,
				// 	type: 'error',
				// });
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
