// active personal details right section
// active business details right section
import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import useFetch from '../../../hooks/useFetch';
import PersonalDetails from '../../../shared/components/PersonalDetails/PersonalDetails';
import SalaryDetails from '../../../shared/components/SalaryDetails/SalaryDetails';
import Button from '../../../components/Button';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { UserContext } from '../../../reducer/userReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { LoanFormContext } from '../../../reducer/loanFormDataReducer';
import { AppContext } from '../../../reducer/appReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import {
	LOGIN_CREATEUSER,
	NC_STATUS_CODE,
	WHITELABEL_ENCRYPTION_API,
	DOCTYPES_FETCH,
} from '../../../_config/app.config';
import { APP_CLIENT } from '../../../_config/app.config';
import ConfirmModal from 'components/modals/ConfirmModal';

const Div = styled.div`
	flex: 1;
	padding: 50px;
	background: #ffffff;
	@media (max-width: 700px) {
		padding: 50px 0px;
	}
`;

const ButtonWrap = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

function formatUserDetails(data, fields) {
	let formatedData = {};
	fields.forEach(f => {
		formatedData[f.name] = data[f.name] || '0';
	});
	return formatedData;
}

const valueConversion = {
	Thousand: 1000,
	Thousands: 1000,
	Lakhs: 100000,
	Crores: 10000000,
	Millions: 1000000,
	One: 1,
};

export default function PersonalDetailsPage({
	id,
	productDetails,
	map,
	onFlowChange,
	productId,
}) {
	const { state } = useContext(LoanFormContext);

	const {
		state: { whiteLabelId },
	} = useContext(AppContext);
	const {
		state: { completed: completedSections },
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeApplicantData, setUsertypeBankData },
	} = useContext(FormContext);

	const {
		state: { userBankDetails, userToken },
		actions: { setUserDetails, setUserId },
	} = useContext(UserContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const { newRequest } = useFetch();
	const [modalConfirm, setModalConfirm] = useState(false);

	const amountConverter = (value, k) => {
		if (k) return value * valueConversion[k || 'One'];
		return value;
	};

	const onSave = async data => {
		const reqBody = {
			email: data.email,
			white_label_id: whiteLabelId,
			source: APP_CLIENT,
			name: data.firstName,
			mobileNo: data.mobileNo,
			addrr1: '',
			addrr2: '',
		};
		if (sessionStorage.getItem('userDetails')) {
			try {
				reqBody.user_id =
					JSON.parse(sessionStorage.getItem('userDetails'))?.id || null;
			} catch (err) {
				return err;
			}
		}
		// if (!userToken) {
		const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
			method: 'POST',
			data: reqBody,
		});

		const userDataRes = userDetailsReq.data;

		if (userDataRes.statusCode === NC_STATUS_CODE.NC200) {
			sessionStorage.setItem('userToken', userDataRes.token);

			const encryptWhiteLabelReq = await newRequest(
				WHITELABEL_ENCRYPTION_API,
				{
					method: 'GET',
				},
				{ Authorization: `Bearer ${userDataRes.token}` }
			);

			const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

			sessionStorage.setItem(
				'encryptWhiteLabel',
				encryptWhiteLabelRes.encrypted_whitelabel[0]
			);
		}

		const userData = {
			// userAccountToken: userDetailsReq.accToken,
			// userDetails: userDetailsReq.userDetails,
			// userBankDetails: userDetailsReq.cubDetails,
			bankId: userDataRes.bankId,
			branchId: userDataRes.branchId,
			userToken: userDataRes.token,
		};
		setUserId(userDataRes.userId);
		setUserDetails(userData);
		setUsertypeBankData({
			bankId: userDataRes.bankId,
			branchId: userDataRes.branchId,
		});
		// }

		setUsertypeApplicantData({
			...data,
			isApplicant: '1',
			...formatUserDetails(data, map.fields['salary-details'].data),
		});
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const validateForm = () => {
		// console.log('PersonalDetails-onProceed-document-', {
		// 	state,
		// 	formState,
		// 	aadhaar_otp_res: sessionStorage.getItem('aadhaar_otp_res'),
		// });
		if (state?.documents?.filter(d => d.req_type === 'aadhar')?.length === 0) {
			if (
				formState.values.aadhaar !== '' &&
				!sessionStorage.getItem('aadhaar_otp_res')
			) {
				return addToast({
					message: 'Please verify your Aadhaar with OTP',
					type: 'error',
				});
			}
		}
		if (
			Number(formState?.values?.grossIncome) === 0 ||
			Number(formState?.values?.netMonthlyIncome) === 0
		) {
			return addToast({
				message: 'Income cannot be 0',
				type: 'error',
			});
		}
		setModalConfirm(true);
	};

	const onProceed = async data => {
		const formstatepan = JSON.parse(sessionStorage.getItem('formstatepan'));
		sessionStorage.setItem(
			'formstatepan',
			JSON.stringify({ ...formstatepan, ...data })
		);
		const formstate = JSON.parse(sessionStorage.getItem('formstate'));
		sessionStorage.setItem(
			'formstate',
			JSON.stringify({ ...formstate, ...data })
		);
		onSave(data);

		setCompleted(id);
		onFlowChange(map.main);
	};

	const formatPersonalDetails = personalDetails => {
		const newPersonalDetails = {
			firstName: personalDetails?.businessname,
			incomeType: personalDetails?.businesstype,
			// personalDetails?.businesstype === 1
			// 	? 'business'
			// 	: personalDetails?.businesstype === 18
			// 	? 'selfemployed'
			// 	: personalDetails?.businesstype === 7
			// 	? 'salaried'
			// 	: undefined,
			BusinessType: personalDetails?.businesstype || '',
			lastName: personalDetails?.last_name,
			pan: personalDetails?.businesspancardnumber,
			dob: personalDetails?.businessstartdate
				? personalDetails?.businessstartdate.split(' ')[0]
				: '',
			aadhaar: personalDetails?.relation,
			mobileNum: personalDetails?.contactno,
			residentTypess: personalDetails?.relation,
			email: personalDetails?.business_email,
			countryResidence: personalDetails?.relation,
			maritalStatus: personalDetails?.relation,
		};
		return newPersonalDetails;
	};

	const prefilledValues = () => {
		try {
			const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
			const appData = JSON.parse(userTokensss)?.formReducer?.user
				?.applicantData;
			let form =
				(appData && Object.keys(appData).length > 0 && appData) ||
				formatPersonalDetails(editLoanData?.business_id) ||
				{};
			if (form) return form;
			else {
				var formStat = JSON.parse(sessionStorage.getItem('formstate'));
				return formStat?.values;
			}
		} catch (error) {
			return {};
		}
	};

	const getAdhar = () => {
		try {
			var formStat =
				JSON.parse(sessionStorage.getItem('formstate'))?.values?.aadhaar ||
				sessionStorage.getItem('aadhar');
			// console.log('getAdhar-formState-', formState);
			if (formStat) {
				const adharNum = formStat;

				let d = `xxxxxxxx${adharNum[adharNum.length - 4]}${
					adharNum[adharNum.length - 3]
				}${adharNum[adharNum.length - 2]}${adharNum[adharNum.length - 1]}`;

				return `${d}`;
			}
		} catch (error) {
			return '';
		}
	};

	const getAdharUnMasked = () => {
		try {
			return (
				JSON.parse(sessionStorage.getItem('formstate'))?.values
					?.aadhaarUnMasked ||
				JSON.parse(sessionStorage.getItem('formstate'))?.values?.aadharNum ||
				sessionStorage.getItem('aadhar') ||
				''
			);
		} catch (error) {
			return '';
		}
	};

	const getDOB = () => {
		try {
			// first check DOB extracted from Aadhar, if its only a year or giving invalid data
			// check Pan extraction data for a valid DOB
			var formStat = JSON.parse(sessionStorage.getItem('formstate'))?.values
				?.dob;
			if (formStat.length < 10) {
				formStat = JSON.parse(sessionStorage.getItem('formstatepan'))?.values
					?.dob;
			}
			if (formStat && formStat) {
				let d = formStat.split('/');
				if (d.length > 2) {
					d = `${d[2]}-${d[1]}-${d[0]}`;
				} else {
					// for old format of aadhar where only date appears
					d = '';
				}
				return d;
			} else {
				return '';
			}
		} catch (error) {
			return '';
		}
	};

	const url = window.location.hostname;

	let userTokensss = sessionStorage.getItem(url);

	// let loan = JSON.parse(userTokensss)?.formReducer?.user?.loanData;
	let form = JSON.parse(userTokensss)?.formReducer?.user?.applicantData;

	const getDataFromPan = () => {
		const t = JSON.parse(sessionStorage.getItem('formstatepan'));
		const name = t?.values?.companyName?.split(' ');
		if (name) {
			return name;
		}
	};
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	let editLoanDataSalary = {};
	if (editLoanData && (!form || (form && Object.keys(form).length === 0))) {
		editLoanDataSalary = {
			grossIncome:
				editLoanData.annual_turn_over &&
				amountConverter(
					editLoanData.annual_turn_over,
					editLoanData.revenue_um
				).toString(),

			netMonthlyIncome:
				editLoanData.annual_op_expense &&
				amountConverter(
					editLoanData.annual_op_expense,
					editLoanData.op_expense_um
				).toString(),
		};
	}

	const ButtonProceed = (
		<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
	);

	const ButtonConfirm = <Button fill name='Proceed' onClick={validateForm} />;

	let displayProceedButton = ButtonProceed;

	if (
		id === 'personal-details' &&
		!completedSections.includes('personal-details') &&
		Object.keys(formState.error).length === 0
	)
		displayProceedButton = ButtonConfirm;

	return (
		<Div>
			<ConfirmModal
				type='Income'
				show={modalConfirm}
				onClose={setModalConfirm}
				ButtonProceed={ButtonProceed}
			/>
			<PersonalDetails
				id={id}
				register={register}
				formState={formState}
				preData={{
					firstName:
						prefilledValues()?.firstName ||
						(getDataFromPan() && getDataFromPan()[0]) ||
						'',
					lastName:
						prefilledValues()?.lastName ||
						(getDataFromPan() && getDataFromPan()[1]) ||
						'',
					dob: getDOB() || prefilledValues()?.dob || '',
					email: prefilledValues()?.email || '',
					mobileNo: prefilledValues()?.mobileNum || '',
					panNumber:
						prefilledValues()?.pan ||
						JSON.parse(sessionStorage.getItem('formstatepan'))?.values
							?.panNumber ||
						sessionStorage.getItem('pan') ||
						'',
					residenceStatus: prefilledValues()?.residentTypess || '',
					aadhaar: getAdhar() || prefilledValues()?.aadhar || '',
					aadhaarUnMasked: getAdharUnMasked(),
					countryResidence: prefilledValues()?.countryResidence || 'india',
					incomeType: prefilledValues()?.incomeType || '',
					...form,
				}}
				jsonData={map?.fields[id]?.data}
			/>
			<SalaryDetails
				jsonData={map?.fields['salary-details'].data}
				jsonLable={map?.fields['salary-details'].label}
				register={register}
				formState={formState}
				incomeType={formState?.values?.incomeType || null}
				// incomeType={'business'}
				preData={
					(form && Object.keys(form).length > 0 && form) || editLoanDataSalary
				}

				// preData={{
				// 	incomeType: prefilledValues()?.incomeType?.value || '',
				// 	incomeType:
				// 		prefilledValues()?.incomeType ||
				// 		JSON.parse(sessionStorage.getItem('personal-details'))?.incomeType
				// 			?.value ||
				// 		'',
				// }}
			/>
			<ButtonWrap>
				{displayProceedButton}
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
			</ButtonWrap>
		</Div>
	);
}

PersonalDetailsPage.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};
