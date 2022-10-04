/* active personal details right section
active business details right section */
import { useContext, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';
import { LoanFormContext } from 'reducer/loanFormDataReducer';

import useForm from 'hooks/useForm';
import useFetch from 'hooks/useFetch';
import PersonalDetails from 'shared/components/PersonalDetails/PersonalDetails';
import SalaryDetails from 'shared/components/SalaryDetails/SalaryDetails';
import Button from 'components/Button';
import { FormContext } from 'reducer/formReducer';
import { FlowContext } from 'reducer/flowReducer';
import { UserContext } from 'reducer/userReducer';
import { AppContext } from 'reducer/appReducer';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	HOSTNAME,
	LOGIN_CREATEUSER,
	NC_STATUS_CODE,
	WHITELABEL_ENCRYPTION_API,
	APP_CLIENT,
	BANK_LIST_FETCH,
	BANK_LIST_FETCH_RESPONSE,
	LOGIN_CREATEUSER_REQ_BODY,
} from '_config/app.config';
import ConfirmModal from 'components/modals/ConfirmModal';
import moment from 'moment';
import { getFlowData } from 'utils/localStore';
import _ from 'lodash';

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
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);
	const {
		state: { completed: completedSections },
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeApplicantData, setUsertypeBankData, setFlowData },
	} = useContext(FormContext);

	const {
		actions: { setUserDetails, setUserId },
	} = useContext(UserContext);

	// const {
	// 	state: { companyDetail },
	// } = useContext(BussinesContext);
	const { state } = useContext(LoanFormContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const { newRequest } = useFetch();
	const [modalConfirm, setModalConfirm] = useState(false);
	const [loading, setLoading] = useState(false);

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	const isEditLoan = !editLoanData ? false : editLoanData?.isEditLoan;

	const applicantDataDirectorDetails =
		editLoanData?.director_details?.filter(d => !!d.isApplicant)?.[0] || {};
	const editApplicantData = {
		...(editLoanData?.business_id || {}),
		...applicantDataDirectorDetails,
		aadhaar: applicantDataDirectorDetails?.daadhaar,
	};

	let userTokensss = sessionStorage.getItem(HOSTNAME);

	// let loan = JSON.parse(userTokensss)?.formReducer?.user?.loanData;
	let form = JSON.parse(userTokensss)?.formReducer?.user?.applicantData;

	const amountConverter = (value, k) => {
		if (k) return Math.round(value * valueConversion[k || 'One']);
		return value;
	};

	const onSave = async data => {
		const reqBody = {
			email: data?.email || '',
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

		const oldReqBody = await getFlowData(LOGIN_CREATEUSER_REQ_BODY);
		const applicationState = JSON.parse(sessionStorage.getItem(HOSTNAME));
		const userReducer = applicationState?.userReducer;
		// console.log(userReducer?.userId, typeof userReducer?.userId, isEditLoan);
		if (
			!_.isEqual(oldReqBody, reqBody) &&
			typeof userReducer?.userId === 'object' &&
			!isEditLoan
		) {
			const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
				method: 'POST',
				data: reqBody,
			});
			setFlowData(reqBody, LOGIN_CREATEUSER_REQ_BODY);
			const userDataRes = userDetailsReq.data;

			if (userDataRes.statusCode === NC_STATUS_CODE.NC200) {
				sessionStorage.setItem('userToken', userDataRes.token);
				if (!sessionStorage.getItem('encryptWhiteLabel')) {
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
			}
			// fetch BANK-LIST to avoid repetate api call's
			try {
				const bankListRes = await newRequest(
					BANK_LIST_FETCH,
					{
						method: 'GET',
					},
					{ Authorization: `Bearer ${userDataRes.token}` }
				);
				// console.log('formconroller-fetch-bank-list-res', bankListRes);
				if (bankListRes?.data?.length > 0) {
					setFlowData(bankListRes?.data, BANK_LIST_FETCH_RESPONSE);
				}
			} catch (error) {
				console.error('error-formcontroller-fetch-bank-list-', error);
			}
			// --fetch BANK-LIST
			const userData = {
				// userAccountToken: userDetailsReq.accToken,
				// userDetails: userDetailsReq.userDetails,
				// userBankDetails: userDetailsReq.cubDetails,
				...userDataRes,
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
		}

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
		setLoading(true);
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
		!isViewLoan && onSave(data);
		setCompleted(id);
		onFlowChange(map.main);
		setLoading(false);
	};

	const formatPersonalDetails = personalDetails => {
		// console.log('formatPersonalDetails-', personalDetails);
		const newPersonalDetails = {
			firstName: personalDetails?.businessname,
			incomeType: personalDetails?.businesstype,
			BusinessType: personalDetails?.businesstype || '',
			lastName: personalDetails?.last_name,
			pan: personalDetails?.businesspancardnumber,
			dob: personalDetails?.ddob ? personalDetails?.ddob.split(' ')[0] : '',
			aadhaar: personalDetails?.aadhaar,
			mobileNum: personalDetails?.contactno,
			email: personalDetails?.business_email,
			residentTypess: personalDetails?.residence_status,
			countryResidence: personalDetails?.country_residence,
			maritalStatus: personalDetails?.marital_status,
			equifaxscore: personalDetails?.dcibil_score?.toString(),
		};
		// gross income
		// annual_op_expense
		// op_expense_um
		if (editLoanData?.annual_turn_over || editLoanData?.annual_revenue) {
			newPersonalDetails.grossIncome = amountConverter(
				editLoanData.annual_turn_over || editLoanData.annual_revenue,
				editLoanData.revenue_um
			).toString();
		}
		// net monthly income
		// annual_op_expense
		// op_expense_um
		if (editLoanData?.annual_op_expense) {
			newPersonalDetails.netMonthlyIncome = amountConverter(
				editLoanData.annual_op_expense,
				editLoanData.op_expense_um
			).toString();
		}
		return newPersonalDetails;
	};

	const prefilledValues = () => {
		try {
			if (isViewLoan) {
				return formatPersonalDetails(editApplicantData);
			}
			if (editLoanData) {
				// form = formatPersonalDetails(editApplicantData);
				// return form;
				const appData = JSON.parse(userTokensss)?.formReducer?.user
					?.applicantData;
				let form = {};
				if (appData?.firstName !== undefined) {
					form = (appData && Object.keys(appData).length > 0 && appData) || {};
				} else {
					form = formatPersonalDetails(editApplicantData) || {};
				}
				return form;
			}
			const formstate = JSON.parse(sessionStorage.getItem('formstate'));
			return formstate?.values;
		} catch (error) {
			return {};
		}
	};

	const getAdhar = () => {
		try {
			const formStat =
				JSON.parse(sessionStorage.getItem('formstate'))?.values?.aadhaar ||
				sessionStorage.getItem('aadhar') ||
				editApplicantData?.aadhaar;
			// console.log('getAdhar-formState-', formState);
			if (formStat) {
				const adharNum = formStat;

				const d = `xxxxxxxx${adharNum[adharNum.length - 4]}${
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

	const getDataFromPan = () => {
		const t = JSON.parse(sessionStorage.getItem('formstatepan'));
		const name = t?.values?.companyName?.split(' ');
		if (name) {
			return name;
		}
	};

	const ButtonProceed = (
		<Button
			fill
			name={`${isViewLoan ? 'Next' : 'Proceed'}`}
			isLoader={loading}
			disabled={loading}
			onClick={handleSubmit(onProceed)}
		/>
	);

	const ButtonConfirm = (
		<Button
			fill
			isLoader={loading}
			disabled={loading}
			name={`${isViewLoan ? 'Next' : 'Proceed'}`}
			onClick={validateForm}
		/>
	);

	let displayProceedButton = ButtonProceed;

	if (
		id === 'personal-details' &&
		!completedSections.includes('personal-details') &&
		Object.keys(formState.error).length === 0
	)
		displayProceedButton = ButtonConfirm;

	const preDataPersonalDetails = {
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
			sessionStorage.getItem('pan') ||
			prefilledValues()?.pan ||
			JSON.parse(sessionStorage.getItem('formstatepan'))?.values?.panNumber ||
			'',
		residenceStatus: prefilledValues()?.residentTypess || '',
		aadhaar: getAdhar() || prefilledValues()?.aadhar || '',
		aadhaarUnMasked: getAdharUnMasked(),
		countryResidence: prefilledValues()?.countryResidence || 'india',
		incomeType: prefilledValues()?.incomeType || '',
		equifaxscore: prefilledValues()?.equifaxscore || '',
		maritalStatus: prefilledValues()?.maritalStatus || '',
		grossIncome: prefilledValues()?.grossIncome || '',
		netMonthlyIncome: prefilledValues()?.netMonthlyIncome || '',
		...form,
	};

	// console.log('PersonalDetailes-Prefill-allstates-', {
	// 	preDataPersonalDetails,
	// });

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
					...preDataPersonalDetails,
					dob: preDataPersonalDetails.dob
						? moment(preDataPersonalDetails.dob).format('YYYY-MM-DD')
						: '',
				}}
				jsonData={map?.fields[id]?.data}
				productDetails={productDetails}
			/>
			<SalaryDetails
				jsonData={map?.fields['salary-details'].data}
				jsonLable={map?.fields['salary-details'].label}
				register={register}
				formState={formState}
				incomeType={formState?.values?.incomeType || null}
				// incomeType={'business'}
				preData={{ ...preDataPersonalDetails }}
				// (form && Object.keys(form).length > 0 && form) || editLoanDataSalary
				// preData={{
				// 	incomeType: prefilledValues()?.incomeType?.value || '',
				// 	incomeType:
				// 		prefilledValues()?.incomeType ||
				// 		JSON.parse(sessionStorage.getItem('personal-details'))?.incomeType
				// 			?.value ||
				// 		'',
				// }}
			/>
			<ButtonWrap>{displayProceedButton}</ButtonWrap>
		</Div>
	);
}

PersonalDetailsPage.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};
