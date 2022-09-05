/* dynamic section for multiple pages */
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';
import axios from 'axios';
import useForm from 'hooks/useForm';
import PersonalDetails from 'shared/components/PersonalDetails/PersonalDetails';
import Button from 'components/Button';
import ROCBusinessDetailsModal from 'components/ROCBusinessDetailsModal';
import { LoanFormContext } from 'reducer/loanFormDataReducer';
import { FormContext } from 'reducer/formReducer';

import { FlowContext } from 'reducer/flowReducer';
import { BussinesContext } from 'reducer/bussinessReducer';
import { useToasts } from 'components/Toast/ToastProvider';
import { AppContext } from 'reducer/appReducer';
import { UserContext } from 'reducer/userReducer';
import {
	LOGIN_CREATEUSER,
	WHITELABEL_ENCRYPTION_API,
	APP_CLIENT,
	NC_STATUS_CODE,
	SEARCH_BANK_BRANCH_LIST,
	HOSTNAME,
} from '_config/app.config';
import useFetch from 'hooks/useFetch';
import ConfirmModal from 'components/modals/ConfirmModal';
import moment from 'moment';

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
	flex-wrap: wrap;
	align-items: center;
	gap: 20px;
`;

const valueConversion = {
	Thousand: 1000,
	Thousands: 1000,
	Lakhs: 100000,
	Crores: 10000000,
	Millions: 1000000,
	One: 1,
};

export default function FormController({
	id,
	map,
	onFlowChange,
	productDetails,
	productId,
}) {
	const {
		state: { completed: completedSections },
		actions: { setCompleted },
	} = useContext(FlowContext);

	const { state } = useContext(LoanFormContext);

	// loanData?.loanAmount ||
	// loan?.loanAmount ||
	// data['business-loan-details']?.LoanAmount ||
	// data['vehicle-loan-details']?.loanAmount ||
	// 0
	// const { state } = useContext(BussinesContext);

	const { handleSubmit, register, formState, clearError } = useForm();
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);

	const {
		state: { companyDetail },
		actions: { setCompanyDetails },
	} = useContext(BussinesContext);

	const {
		actions: {
			setUsertypeLoanData,
			// setUserSubsidiaryDetailsData,
			setUsertypeBankData,
			// setUsertypeAgreementData,
			setFlowData,
		},
	} = useContext(FormContext);

	const {
		state: { bankId, userToken: userToken1 },
		actions: { setUserDetails, setUserId },
	} = useContext(UserContext);

	// const {
	// 	actions: {
	// 		setUsertypeLoanData,
	// 		// setUsertypeEmiData,
	// 		setUsertypeBankData,
	// 		setUsertypeAgreementData,
	// 	},
	// } = useContext(FormContext);

	// const { state } = useContext(LoanFormContext);
	const { newRequest } = useFetch();
	const { addToast } = useToasts();
	const [modalConfirm, setModalConfirm] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (id === 'vehicle-loan-details') {
			getBranchOptions();
		}
		return () => {
			// console.log('unmount form');
		};
		// eslint-disable-next-line
	}, []);

	const getBranchOptions = async () => {
		try {
			const opitionalDataReq = await axios.get(
				SEARCH_BANK_BRANCH_LIST({ bankId }),
				{
					headers: {
						Authorization: `Bearer ${userToken1 ||
							sessionStorage.getItem('userToken')}`,
					},
				}
			);
			if (opitionalDataReq.data.status === 'ok') {
				sethomeBranchList(opitionalDataReq?.data?.branchList || []);
			}
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		clearError();
		// eslint-disable-next-line
	}, [map.name]);

	const onSave = data => {
		setFlowData(data, id);
		// setLoanData({ ...data }, id);
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const onProceed = async data => {
		try {
			setModalConfirm(false);
			setLoading(true);
			// console.log('form-controller-on-proceed-data-', {
			// 	data,
			// 	companyDetail,
			// 	api: LOGIN_CREATEUSER,
			// 	reqBody: {
			// 		email: formState?.values?.Email,
			// 		white_label_id: whiteLabelId,
			// 		source: APP_CLIENT,
			// 		name: formState?.values?.BusinessName,
			// 		mobileNo: formState?.values?.mobileNo,
			// 		addrr1: '',
			// 		addrr2: '',
			// 	},
			// });
			let homeLoanBranchName = '';
			if (id === 'vehicle-loan-details') {
				homeLoanBranchName =
					homeBranchList.filter(ele => ele.id === data.branchId)[0]?.branch ||
					'';
				data = { ...data, branchIdName: homeLoanBranchName };
			}
			if (id === 'business-loan-details') {
				setUsertypeLoanData({
					...data,
				});
			}

			const reqBody = {
				email: formState?.values?.Email || '',
				white_label_id: whiteLabelId,
				source: APP_CLIENT,
				name: formState?.values?.BusinessName,
				mobileNo: formState?.values?.mobileNo,
			};
			if (sessionStorage.getItem('userDetails')) {
				try {
					reqBody.user_id =
						JSON.parse(sessionStorage.getItem('userDetails'))?.id || null;
				} catch (err) {
					return err;
				}
			}

			// or loan type
			// Loan Against Property Individual Loan
			// console.log('formcontroller-onProceed-productDetails-', productDetails);
			if (!isViewLoan && id === 'business-details') {
				const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
					method: 'POST',
					data: reqBody,
				});

				const userDetailsRes = userDetailsReq.data;

				let userToken = sessionStorage.getItem(HOSTNAME);

				userToken = JSON.parse(userToken);

				userToken = {
					...userToken,
					userReducer: {
						...userToken.userReducer,
						userToken: userDetailsRes.token,
					},
				};

				sessionStorage.setItem('userToken', userDetailsRes.token);
				sessionStorage.setItem(HOSTNAME, JSON.stringify(userToken));

				if (userDetailsRes.statusCode === NC_STATUS_CODE.NC200) {
					const encryptWhiteLabelReq = await newRequest(
						WHITELABEL_ENCRYPTION_API,
						{
							method: 'GET',
						},
						{ Authorization: `Bearer ${userDetailsRes.token}` }
					);

					const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

					sessionStorage.setItem(
						'encryptWhiteLabel',
						encryptWhiteLabelRes.encrypted_whitelabel[0]
					);

					const userData = {
						...userDetailsRes,
						bankId: userDetailsRes.bankId,
						branchId: userDetailsRes.branchId,
						userToken: userDetailsRes.token,
					};
					setUserId(userDetailsRes.userId);
					setUserDetails(userData);
					setUsertypeBankData({
						bankId: userDetailsRes.bankId,
						branchId: userDetailsRes.branchId,
					});

					// console.log('before-setting-company-details-', {
					// 	status: encryptWhiteLabelRes.status === NC_STATUS_CODE.OK,
					// 	object: {
					// 		...companyDetail,
					// 		token: userDetailsRes.token,
					// 		userId: userDetailsRes.userId,
					// 		branchId: userDetailsRes.branchId,
					// 		encryptedWhitelabel: encryptWhiteLabelRes.encrypted_whitelabel[0],
					// 	},
					// });
					if (encryptWhiteLabelRes.status === NC_STATUS_CODE.OK)
						setCompanyDetails({
							...companyDetail,
							...formState?.values,
							token: userDetailsRes.token,
							userId: userDetailsRes.userId,
							branchId: userDetailsRes.branchId,
							encryptedWhitelabel: encryptWhiteLabelRes.encrypted_whitelabel[0],
							// formEmail: formState?.values?.Email,
							// formMobile: formState?.values?.mobileNo,
							Email: formState?.values?.Email,
							mobileNo: formState?.values?.mobileNo,
						});
				}
			}
			!isViewLoan && onSave(data);
			setCompleted(id);
			onFlowChange(map.main);
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.error('error-formcontroller-onproceed-', error);
		}
	};

	const onSkip = () => {
		setCompleted(id);
		onFlowChange(map.main);
	};

	// const [actions, setActions] = useState({});

	// const onClickActions = (action) => {
	//   const newActions = { ...actions, action };

	//   setActions(newActions);
	// };

	const [viewBusinessDetail, setViewBusinessDetail] = useState(false);
	const [homeBranchList, sethomeBranchList] = useState([]);

	let userToken = sessionStorage.getItem(HOSTNAME);

	//let loan = JSON.parse(userToken)?.formReducer?.user?.loanData;

	let appData = JSON.parse(userToken)?.formReducer?.user?.applicantData;
	let companyData = JSON.parse(sessionStorage.getItem('companyData'));

	let formReducer = JSON.parse(sessionStorage.getItem(HOSTNAME))?.formReducer;
	let form =
		state[`${id}`] ||
		formReducer?.user[`${id}`] ||
		companyDetail ||
		companyData ||
		appData;
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const skipButton = map?.fields[id]?.data?.some(f => f?.rules?.required);

	const amountConverter = (value, k) => {
		if (k) return value * valueConversion[k || 'One'];
		return value;
	};
	const formatLoanData = loanData => {
		return {
			tenure: loanData?.applied_tenure.toString(),
			LoanAmount:
				loanData?.loan_amount &&
				amountConverter(
					loanData?.loan_amount,
					loanData?.loan_amount_um
				).toString(),
		};
	};
	const formatVehicalLoanData = loanData => {
		return {
			tenure: loanData?.applied_tenure.toString(),
			loanAmount:
				loanData?.loan_amount &&
				amountConverter(
					loanData?.loan_amount,
					loanData?.loan_amount_um
				).toString(),
			// branchId: loanData?.branchId
		};
	};

	const formatSubsidiaryData = subsidiaryData => {
		return {
			SubsidiaryName: subsidiaryData?.business_name,
			BankName: subsidiaryData?.SubsidiaryName || subsidiaryData?.bank_name,
			AccountNumber: subsidiaryData?.account_number,
			Relation: subsidiaryData?.relation,
			RelationSubsidiary: subsidiaryData?.relation,
		};
	};

	const formatShareholderData = shareholderData => {
		// console.log('formatShareholderData-', { shareholderData });
		return {
			ShareholderName: shareholderData?.name,
			ShareholderPercentage: shareholderData?.percentage.toString(),
			Relation: shareholderData?.relationship,
			RelationShareholder: shareholderData?.relationship,
			CompanyAddress: shareholderData?.address,
			Pincode: shareholderData?.pincode,
		};
	};

	const formaBankDetailsData = bankDetailsData => {
		// console.log('formaBankDetailsData-', bankDetailsData);
		return {
			BankName: bankDetailsData?.bank_id?.toString(),
			AccountNumber: bankDetailsData?.account_number,
			AccountType: bankDetailsData?.account_type,
			Relation: bankDetailsData?.relationship || '',
			AccountHolderName: bankDetailsData?.account_holder_name,
			StartDate: bankDetailsData?.outstanding_start_date,
			EndDate: bankDetailsData?.outstanding_end_date,
			ifsccode: bankDetailsData?.IFSC,
		};
	};

	const formatReferenceDetailsData = referenceDetailsData => {
		const obj = {};
		referenceDetailsData.map((ele, i) => {
			for (const key in ele) {
				obj[`${key}${i}`] = ele[key];
			}
			obj[`Name${i}`] = ele?.ref_name;
			obj[`ReferenceEmail${i}`] = ele?.ref_email;
			obj[`ContactNumber${i}`] = ele?.ref_contact;
			obj[`Pincode${i}`] = ele?.ref_pincode;
			return null;
		});
		return obj;
	};

	const formatCollateralDetails = () => {
		const collateralData =
			editLoanData?.loan_assets?.filter(
				d => d?.loan_type === 'Collateral'
			)?.[0] || {};
		// console.log(
		// 	collateralData?.loan_json,
		// 	typeof collateralData?.loan_json,
		// 	'100'
		// );

		let collateralValue;
		if (typeof collateralData?.loan_json === 'string') {
			collateralValue = JSON.parse(collateralData?.loan_json);
		}
		// console.log(collateralValue, typeof collateralValue, '101');
		return {
			...(collateralData?.loan_json?.[0] || {}),
			Collateraltype:
				collateralData?.loan_json?.[0]?.Collateraltype ||
				collateralValue?.[0]?.Collateraltype ||
				'',
			CurrentMarketValue:
				collateralData?.loan_json?.[0]?.CurrentMarketValue ||
				collateralValue?.[0]?.CurrentMarketValue ||
				'',
		};
	};

	if (state[`${id}`]) {
		if (id === 'business-loan-details') {
			form =
				Object.keys(JSON.parse(userToken)?.formReducer?.user?.loanData).length >
					0 && JSON.parse(userToken)?.formReducer?.user?.loanData;
		}
	} else {
		if (id === 'business-loan-details') {
			form =
				(Object.keys(JSON.parse(userToken)?.formReducer?.user?.loanData)
					.length > 0 &&
					JSON.parse(userToken)?.formReducer?.user?.loanData) ||
				(editLoanData && formatLoanData(editLoanData));
		}
		if (id === 'vehicle-loan-details') {
			form =
				(Object.keys(JSON.parse(userToken)?.formReducer?.user?.loanData)
					.length > 0 &&
					JSON.parse(userToken)?.formReducer?.user?.loanData) ||
				JSON.parse(userToken)?.formReducer?.user?.['vehicle-loan-details'] ||
				(editLoanData && formatVehicalLoanData(editLoanData));
		}
		if (id === 'subsidiary-details' && editLoanData) {
			form =
				editLoanData &&
				formatSubsidiaryData(editLoanData.subsidiary_details[0]);
		}
		if (id === 'shareholder-details' && editLoanData?.shareholder_details) {
			form =
				editLoanData &&
				formatShareholderData(editLoanData.shareholder_details[0]);
		}
		if (id === 'bank-details' && editLoanData?.bank_details) {
			form = editLoanData && formaBankDetailsData(editLoanData.bank_details[0]);
		}
		if (id === 'reference-details' && editLoanData?.reference_details) {
			form =
				editLoanData &&
				formatReferenceDetailsData(editLoanData.reference_details);
		}
		if (id === 'collateral-details' && editLoanData) {
			form = formatCollateralDetails();
		}
	}

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
			name={`${isViewLoan ? 'Next' : 'Proceed'}`}
			isLoader={loading}
			disabled={loading}
			onClick={() => setModalConfirm(true)}
		/>
	);

	let displayProceedButton = ButtonProceed;

	if (
		id === 'business-details' &&
		!completedSections.includes('business-details') &&
		Object.keys(formState.error).length === 0
	)
		displayProceedButton = ButtonConfirm;

	// console.log('FormController-allstates-', { form });

	return (
		<>
			<ConfirmModal
				type='Business'
				show={modalConfirm}
				onClose={setModalConfirm}
				ButtonProceed={ButtonProceed}
			/>
			<Div>
				<PersonalDetails
					register={register}
					formState={formState}
					companyDetail={companyDetail || companyData}
					pageName={map.name}
					preData={{
						...form,
						panNumber: sessionStorage.getItem('pan') || form?.panNumber || '',
						BusinessVintage: form?.BusinessVintage
							? moment(form?.BusinessVintage).format('YYYY-MM-DD')
							: '',
					}}
					jsonData={map?.fields[id]?.data || []}
					id={id}
					productDetails={productDetails}
				/>

				{/* {id === 'land-additional-details' && (
					<InputField
						placeholder='Total Value (In  ₹ )'
						value='0'
						style={{ width: '25%', marginBottom: '3%' }}
						jsonData={map?.fields[id]?.data || []}
						id={id}
					/>
				)} */}

				<ButtonWrap>
					{id === 'business-details' && !isViewLoan && (
						<Button
							fill
							name='View Business Details'
							onClick={() => setViewBusinessDetail(true)}
						/>
					)}
					{displayProceedButton}
					{!skipButton && !isViewLoan && (
						<Button name='Skip' onClick={onSkip} />
					)}
				</ButtonWrap>
			</Div>

			{id === 'business-details' && viewBusinessDetail && (
				<ROCBusinessDetailsModal
					onClose={() => {
						setViewBusinessDetail(false);
					}}
				/>
			)}
		</>
	);
}

FormController.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};
