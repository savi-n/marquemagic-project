/* Loan Address details section */
import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';
import useFetch from 'hooks/useFetch';
import { BUSSINESS_PROFILE_UPDATE, HOSTNAME } from '_config/app.config';
import { UserContext } from 'reducer/userReducer';
import useForm from 'hooks/useForm';
import Button from 'components/Button';
import AddressDetails from 'shared/components/AddressDetails/AddressDetails';
import { FormContext } from 'reducer/formReducer';
import { FlowContext } from 'reducer/flowReducer';
import { BussinesContext } from 'reducer/bussinessReducer';
import { useToasts } from 'components/Toast/ToastProvider';

const Div = styled.div`
	flex: 1;
	padding: 50px;
	background: #ffffff;
	@media (max-width: 700px) {
		padding: 50px 0;
	}
`;

const ButtonWrap = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

const formatData = (type, data, fields) => {
	const formatedData = {};
	for (const f of fields) {
		formatedData[f.name] = data[`${type}_${f.name}`];
	}
	return {
		addressType: type,
		aid: type === 'present' ? 1 : 2,
		...formatedData,
	};
};

AddressDetailsPage.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
	fieldConfig: object,
};
const getPinCode = add => {
	// console.log('getPinCode-add-', add);
	if (add && add?.pncd) return add.pncd;
	const digits = '1234567890';
	let str = '';
	for (const char of add) {
		if (digits.includes(char)) {
			str += char;
		}
	}
	str = str.trim();
	str = str.replace(' ', '');
	if (str.length < 6) return '';
	return str.substr(str.length - 6);
};

const getAddress = add => {
	// flno: "MEZZANINE FLOOR - NORTH SIDE"
	// bno: "NO  5"
	// bnm: "CRIMSON COURT - 1"
	// loc: "HAL III STAGE, BANGALORE"
	// st: "JEEVANBHIMA NAGAR MAIN ROAD"
	// city: ""
	// dst: "Bengaluru (Bangalore) Urban"
	// stcd: "Karnataka"
	// pncd: "560075"
	// lg: ""
	// lt: ""
	if (add && add?.pncd) {
		const addressLine1 = [];
		if (add.flno) addressLine1.push(add.flno);
		if (add.bno) addressLine1.push(add.bno);
		if (add.bnm) addressLine1.push(add.bnm);
		if (add.loc) addressLine1.push(add.loc);
		if (add.st) addressLine1.push(add.st);
		return addressLine1.join(', ');
	} else return add;
};

export default function AddressDetailsPage({
	id,
	onFlowChange,
	map,
	fieldConfig,
	productDetails,
	productId,
	companyData,
	data,
}) {
	let formReducer = JSON.parse(sessionStorage.getItem(HOSTNAME))?.formReducer;
	let applicantData = formReducer?.user?.applicantData;

	let userTokensss = sessionStorage.getItem(HOSTNAME);

	let form = JSON.parse(userTokensss).formReducer?.user?.applicantData;
	const isBusiness = productDetails.loan_request_type === 1 ? true : false;
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);
	const { newRequest } = useFetch();
	const {
		state: { userToken },
	} = useContext(UserContext);
	const {
		actions: { setUsertypeAddressData },
	} = useContext(FormContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();

	const [loading, setLoading] = useState(false);
	const [match, setMatch] = useState(false);

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const onSave = formData => {
		let formatedData = [formatData('permanent', formData, map.fields[id].data)];

		// !match &&
		// 	formatedData.push(formatData('present', formData, map.fields[id].data));

		formatedData.push(formatData('present', formData, map.fields[id].data));

		setUsertypeAddressData(formatedData);
		//setSaved(true);
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const businessProfileUpdate = async formData => {
		try {
			if (!companyData) {
				companyData =
					sessionStorage.getItem('companyData') &&
					JSON.parse(sessionStorage.getItem('companyData'));
			}
			const reqBody = {
				first_name: applicantData?.firstName || '',
				last_name: applicantData?.lastName || '',
				businessName:
					applicantData?.firstName ||
					sessionStorage.getItem('BusinessName') ||
					companyData?.BusinessName,
				businessPancardNumber:
					applicantData?.panNumber || companyData?.panNumber || '',
				// // crime_check: "Yes",,
				businessPancardFdkey: '',
				businessEmail:
					applicantData?.email ||
					companyData?.email ||
					companyData?.Email ||
					formReducer?.user['business-details']?.Email ||
					'',
				contactNo: applicantData?.mobileNo || companyData?.mobileNo || '',
				gstin: '',
				businessStartDate: '4/8/90',
				businesstype: applicantData?.incomeType || companyData?.BusinessType,
				Line1: formData?.permanent_address1 || applicantData?.address?.address1,
				Line2: formData?.permanent_address2 || applicantData?.address?.address2,
				locality:
					formData?.permanent_address3 ||
					formData?.permanent_city ||
					applicantData?.address?.city,
				city: formData?.permanent_city,
				state: formData?.permanent_state,
				pincode: formData?.permanent_pinCode,
				business_id: sessionStorage.getItem('business_id') || '',
				baid: sessionStorage.getItem('baid') || '',
				aid: 2,
				origin: 'nconboarding',
			};
			if (editLoanData) {
				reqBody.business_id = editLoanData?.business_id?.id;
				reqBody.baid = editLoanData?.business_address?.[0]?.id;
			}
			const businessProfilereq = await newRequest(BUSSINESS_PROFILE_UPDATE, {
				method: 'POST',
				data: reqBody,
				headers: {
					Authorization: `Bearer ${userToken ||
						sessionStorage.getItem('userToken')}`,
				},
			});

			const businessProfileres = businessProfilereq.data;
			sessionStorage.setItem(
				'business_id',
				JSON.stringify(businessProfileres.data[0].id)
			);
			sessionStorage.setItem(
				'baid',
				JSON.stringify(businessProfileres.data[0].business_address[0].id)
			);
			return true;
		} catch (error) {
			addToast({
				message: error.message || 'Business Profile is failed',
				type: 'error',
			});
			return false;
		}
	};

	const onProceed = async formData => {
		setLoading(true);
		let formatedData = [formatData('permanent', formData, map.fields[id].data)];
		!match &&
			formatedData.push(formatData('present', formData, map.fields[id].data));
		sessionStorage.setItem('address_details', JSON.stringify(formatedData));
		setUsertypeAddressData(formatedData);
		!isViewLoan && onSave(formData);
		let isBusinessProfileUpdated = true;
		if (!isViewLoan) {
			isBusinessProfileUpdated = await businessProfileUpdate(formData);
		}
		if (!isBusinessProfileUpdated) {
			setLoading(false);
			addToast({
				message: 'Server down, try after sometimes',
				type: 'error',
			});
			return;
		}
		setCompleted(id);
		onFlowChange(map.main);
		setLoading(false);
	};

	//   const subFlowActivate = () => {
	//     activateSubFlow(id);
	//     onFlowChange(map.sub);
	//   };
	useEffect(() => {
		const getData = async () => {
			!isBusiness &&
				form &&
				form.address &&
				form.address.length === 1 &&
				setMatch(true);
			if (form && form.address && form.address[0]) {
				// if formdata have address that allready saved details
			} else {
				let lengthAddress =
					editLoanData && formatAddressData(editLoanData.business_address);
				if (lengthAddress?.length === 1) {
					setMatch(true);
				}
			}
		};
		getData();
		// eslint-disable-next-line
	}, []);

	const prefilledValues = () => {
		try {
			let newFormState = {};
			try {
				newFormState = JSON.parse(sessionStorage.getItem('formstate')) || {};
			} catch (e) {
				newFormState = { values: {} };
			}
			// initialize values if not exist
			if (!newFormState?.values) {
				newFormState.values = {};
			}
			let aadhaarOtpRes = null;
			try {
				aadhaarOtpRes = JSON.parse(sessionStorage.getItem('aadhaar_otp_res'));
			} catch (e) {
				aadhaarOtpRes = null;
			}
			if (aadhaarOtpRes) {
				const newAddress1 = [];
				if (aadhaarOtpRes?.data?.address?.house)
					newAddress1.push(aadhaarOtpRes?.data?.address?.house || '');
				if (aadhaarOtpRes?.data?.address?.street)
					newAddress1.push(aadhaarOtpRes?.data?.address?.street || '');
				if (aadhaarOtpRes?.data?.address?.loc)
					newAddress1.push(aadhaarOtpRes?.data?.address?.loc || '');
				if (aadhaarOtpRes?.data?.address?.vtc)
					newAddress1.push(aadhaarOtpRes?.data?.address?.vtc || '');
				if (aadhaarOtpRes?.data?.address?.subdist)
					newAddress1.push(aadhaarOtpRes?.data?.address?.subdist || '');
				newFormState.values.address1 = newAddress1.join(', ');
				newFormState.values.address2 =
					aadhaarOtpRes?.data?.address?.landmark || '';
				newFormState.values.address3 = aadhaarOtpRes?.data?.address?.po || '';
				newFormState.values.pin = aadhaarOtpRes?.data?.address?.pc || '';
				newFormState.values.city = aadhaarOtpRes?.data?.address?.dist || '';
				newFormState.values.state = aadhaarOtpRes?.data?.address?.state || '';
			}
			return newFormState?.values;
		} catch (error) {
			console.error('error-LoanAddressDetails-prefilledValues-', error);
			return {};
		}
	};

	const formatAddressData = address => {
		const BAddress = address.map((ele, i) => {
			return {
				address1: ele.line1,
				address2: ele.line2,
				address3: ele.locality,
				aid: ele.aid,
				city: ele.city,
				state: ele.state,
				pinCode: ele.pincode,
				addressType: i === 0 ? 'permanent' : 'present',
			};
		});
		return BAddress;
	};

	const Address =
		(form && form.address && form.address[0]) ||
		(editLoanData && formatAddressData(editLoanData.business_address)[0]);

	// console.log('LoanAddressDetails-states-', {
	// 	Address,
	// 	preprefilledValues: prefilledValues(),
	// });

	return (
		<Div>
			<AddressDetails
				userType={'applicant'}
				isBusiness={isBusiness}
				register={register}
				formState={formState}
				match={match}
				setMatch={setMatch}
				jsonData={map.fields[id].data}
				preDataFilled={
					form?.address ||
					(editLoanData && formatAddressData(editLoanData.business_address))
				}
				preData={{
					address1:
						Address && Address.address1
							? Address && Address.address1
							: companyDetail?.Address
							? getAddress(companyDetail?.Address)
							: prefilledValues()?.address1 || '',
					address2:
						(Address && Address.address2) || prefilledValues()?.address2 || '',
					address3:
						(Address && Address.address3) || prefilledValues()?.address3 || '',
					address4:
						(Address && Address.address4) || prefilledValues()?.address4 || '',
					city: (Address && Address.city) || prefilledValues()?.city || '',
					state: (Address && Address.state) || prefilledValues()?.state || '',
					pinCode:
						Address && Address.pinCode
							? Address.pinCode
							: companyDetail?.Address
							? companyDetail?.Address
								? getPinCode(companyDetail?.Address)
								: ''
							: prefilledValues()?.pin || '',
				}}
			/>
			<ButtonWrap>
				<Button
					fill
					isLoader={loading}
					disabled={loading}
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					onClick={handleSubmit(onProceed)}
				/>
			</ButtonWrap>
		</Div>
	);
}
