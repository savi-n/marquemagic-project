/* In Document Upload section, a button is available to fetch cibil score.
On click of that a modal is popped up which is defined in this file */

import { useEffect, useContext, useRef } from 'react';
import Loading from '../components/Loading';
import {
	FETCH_CIBIL_SCORE,
	NC_STATUS_CODE,
	BANK_TOKEN_API,
} from '../_config/app.config';
import { AppContext } from '../reducer/appReducer';
import useFetch from '../hooks/useFetch';
import Modal from './Modal';

export default function GetCIBILScoreModal({ onClose, userData }) {
	const bankTokenRef = useRef();

	const {
		state: { clientToken },
	} = useContext(AppContext);

	const { response, newRequest } = useFetch({
		url: BANK_TOKEN_API,
		options: {
			method: 'POST',
			data: {
				type: 'EQFAX',
				linkRequired: false,
				isEncryption: false,
			},
		},
		headers: {
			Authorization: clientToken,
		},
	});

	useEffect(() => {
		async function getBankToken() {
			if (response.statusCode === NC_STATUS_CODE.NC200) {
				bankTokenRef.current = {
					bankToken: response.generated_key,
					requestId: response.request_id,
				};
				await fetchData();
				return;
			}

			onCloseMessage();
		}

		if (
			Object.entries(userData).length === 0 &&
			userData.constructor === Object
		) {
			onClose(false, { message: 'Data not available' });
			return;
		}

		if (response) {
			getBankToken();
		}
		return () => {};
		// eslint-disable-next-line
	}, [response]);

	function onCloseMessage() {
		onClose(false, { message: 'Something Went Wrong Try Again Later' });
	}

	async function fetchData() {
		try {
			const req = await newRequest(
				FETCH_CIBIL_SCORE,
				{
					method: 'POST',
					data: {
						requestFrom: 'CUB',
						transactionAmount: userData.loanAmount,
						fullName: `${userData.firstName} ${userData.lastName}`,
						firstName: userData.firstName,
						lastName: userData.lastName,
						inquiryAddresses: {
							addressLine: `${userData.address[0].address1 || ''} ${userData
								.address[0].address2 || ''} ${userData.address[0].address3 ||
								''}`,
							city: userData.address[0].city,
							state: userData.address[0].state,
							postal: userData.address[0].pinCode,
						},
						inquiryPhones: [
							{
								number: userData.mobileNo,
								phoneType: 'M',
							},
						],
						dob: userData.dob,
						panNumber: userData.panNumber,
						nationalIdCard: '',
						passportId: '',
						voterId: '',
						driverLicense: '',
					},
				},
				{ Authorization: bankTokenRef.current.bankToken }
			);

			const res = req.data;
			if (res.statusCode === NC_STATUS_CODE.NC200) {
				onClose(true, {
					...bankTokenRef.current,
					cibilScore: res.cibilScore,
					message: 'CIBIL Fetch Completed Successfully',
				});
			} else {
				onClose(false, { message: res.message });
			}
		} catch (error) {
			onCloseMessage();
		}
	}

	return (
		<Modal
			show={true}
			onClose={() => onClose(false, { message: 'not working' })}
			width='50%'>
			<Loading />
		</Modal>
	);
}
