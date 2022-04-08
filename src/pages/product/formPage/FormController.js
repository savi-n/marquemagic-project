// active
// dynamic section
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';
import axios from 'axios';
import useForm from '../../../hooks/useForm';
import PersonalDetails from '../../../shared/components/PersonalDetails/PersonalDetails';
import Button from '../../../components/Button';
import ROCBusinessDetailsModal from '../../../components/ROCBusinessDetailsModal';
import { LoanFormContext } from '../../../reducer/loanFormDataReducer';
import { FormContext } from '../../../reducer/formReducer';

import { FlowContext } from '../../../reducer/flowReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import { AppContext } from '../../../reducer/appReducer';
import { UserContext } from '../../../reducer/userReducer';
import {
	LOGIN_CREATEUSER,
	WHITELABEL_ENCRYPTION_API,
	APP_CLIENT,
	NC_STATUS_CODE,
	SEARCH_BANK_BRANCH_LIST,
	DOCTYPES_FETCH,
} from '../../../_config/app.config';
import useFetch from '../../../hooks/useFetch';
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

	const {
		state,
		actions: { setLoanData },
	} = useContext(LoanFormContext);

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
		state: businessDataStore,
		actions: {
			setUsertypeLoanData,
			// setUserSubsidiaryDetailsData,
			// setUsertypeBankData,
			// setUsertypeAgreementData,
		},
	} = useContext(FormContext);

	const {
		state: { bankId, userToken: userToken1 },
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

	useEffect(() => {
		if (id === 'vehicle-loan-details') {
			getBranchOptions();
		}
		return () => {
			console.log('unmount form');
		};
	}, []);

	const getBranchOptions = async () => {
		try {
			const opitionalDataReq = await axios.get(
				SEARCH_BANK_BRANCH_LIST({ bankId }),
				{
					headers: { Authorization: `Bearer ${userToken1}` },
				}
			);
			if (opitionalDataReq.data.status == 'ok') {
				sethomeBranchList(opitionalDataReq?.data?.branchList || []);
			}
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		clearError();
	}, [map.name]);

	const onSave = data => {
		setLoanData({ ...data }, id);
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const onProceed = async data => {
		setModalConfirm(false);
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
				homeBranchList.filter(ele => ele.id == data.branchId)[0]?.branch || '';
			data = { ...data, branchIdName: homeLoanBranchName };
		}
		if (id === 'business-loan-details') {
			setUsertypeLoanData({
				...data,
			});
		}

		const reqBody = {
			email: formState?.values?.Email,
			white_label_id: whiteLabelId,
			source: APP_CLIENT,
			name: formState?.values?.BusinessName,
			mobileNo: formState?.values?.mobileNo,
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

		// or loan type
		// Loan Against Property Individual Loan
		// console.log('formcontroller-onProceed-productDetails-', productDetails);
		if (id === 'business-details') {
			const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
				method: 'POST',
				data: reqBody,
			});

			const userDetailsRes = userDetailsReq.data;

			const url = window.location.hostname;

			let userToken = sessionStorage.getItem(url);

			userToken = JSON.parse(userToken);

			userToken = {
				...userToken,
				userReducer: {
					...userToken.userReducer,
					userToken: userDetailsRes.token,
				},
			};

			sessionStorage.setItem('userToken', userDetailsRes.token);
			sessionStorage.setItem(url, JSON.stringify(userToken));

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

		onSave(data);
		setCompleted(id);
		onFlowChange(map.main);
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

	const skipButton = map?.fields[id]?.data?.some(f => f?.rules?.required);

	const url = window.location.hostname;

	let userToken = sessionStorage.getItem(url);

	let loan = JSON.parse(userToken)?.formReducer?.user?.loanData;

	let appData = JSON.parse(userToken)?.formReducer?.user?.applicantData;
	let companyData = JSON.parse(sessionStorage.getItem('companyData'));
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
			BankName: subsidiaryData?.SubsidiaryName,
			AccountNumber: subsidiaryData?.account_number,
			Relation: subsidiaryData?.relation,
		};
	};

	const formatShareholderData = shareholderData => {
		return {
			ShareholderName: shareholderData?.name,
			ShareholderPercentage: shareholderData?.percentage.toString(),
			Relation: shareholderData?.relationship,
		};
	};

	const formaBankDetailsData = bankDetailsData => {
		return {
			BankName: bankDetailsData?.bank_id,
			AccountNumber: bankDetailsData?.account_number,
			AccountType: bankDetailsData?.account_type,
			Relation: bankDetailsData?.relationship || '',
			AccountHolderName: bankDetailsData?.account_holder_name,
			StartDate: bankDetailsData?.outstanding_start_date,
			EndDate: bankDetailsData?.outstanding_end_date,
		};
	};

	const formReferenceDetailsData = referenceDetailsData => {
		const obj = {};
		referenceDetailsData.map((ele, i) => {
			obj[`Name${i}`] = ele?.ref_name;
			obj[`ReferenceEmail${i}`] = ele?.ref_email;
			obj[`ContactNumber${i}`] = ele?.ref_contact;
			obj[`Pincode${i}`] = ele?.ref_pincode;
		});
		return obj;
	};

	let form = state[`${id}`] || companyDetail || companyData || appData;
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
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
				formReferenceDetailsData(editLoanData.reference_details);
		}
	}

	const ButtonProceed = (
		<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
	);

	const ButtonConfirm = (
		<Button fill name='Proceed' onClick={() => setModalConfirm(true)} />
	);

	let displayProceedButton = ButtonProceed;

	if (
		id === 'business-details' &&
		!completedSections.includes('business-details') &&
		Object.keys(formState.error).length === 0
	)
		displayProceedButton = ButtonConfirm;

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
					preData={form}
					jsonData={map?.fields[id]?.data || []}
					id={id}
				/>
				<ButtonWrap>
					{id === 'business-details' && (
						<Button
							fill
							name='View Business Details'
							onClick={() => setViewBusinessDetail(true)}
						/>
					)}
					{displayProceedButton}
					{/* <Button name='Save' onClick={handleSubmit(onSave)} /> */}
					{!skipButton && <Button name='Skip' onClick={onSkip} />}
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
