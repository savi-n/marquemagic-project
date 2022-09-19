/* Loan details page of Housing Loan */
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from 'hooks/useForm';
import Button from 'components/Button';
import HomeLoanAddressDetails from 'shared/components/AddressDetails/HomeLoanAddress';
import HomeLoanDetailsTable from 'shared/components/LoanDetails/HomeLoanDetailsTable';
import UploadAgreementModal from 'components/UploadAgreementModal';
import LoanDetails from 'shared/components/LoanDetails/LoanDetails';
import { FormContext } from 'reducer/formReducer';
import { LoanFormContext } from 'reducer/loanFormDataReducer';
import { FlowContext } from 'reducer/flowReducer';
import { UserContext } from 'reducer/userReducer';
import { formatLoanData } from 'utils/formatData';
import { useToasts } from 'components/Toast/ToastProvider';
import { HOSTNAME, SEARCH_BANK_BRANCH_LIST } from '_config/app.config';

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

const Caption = styled.div`
	background: #e6e7e9;
	padding: 15px 20px;
	font-size: 16px;
	border-radius: 10px;
	margin-bottom: 30px;
	font-weight: 500;
`;

const FormWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

const FlexColom = styled.div`
	flex-basis: ${({ base }) => (base ? base : '100%')};
`;

HomeLoanDetailsPage.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};

const valueConversion = {
	Thousand: 1000,
	Thousands: 1000,
	Lakhs: 100000,
	Crores: 10000000,
	Millions: 1000000,
	One: 1,
};

export default function HomeLoanDetailsPage({ id, map, onFlowChange }) {
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		// state: { documents },
		actions: { setLoanDocuments },
	} = useContext(LoanFormContext);

	const {
		actions: {
			setUsertypeLoanData,
			// setUsertypeEmiData,
			setUsertypeBankData,
			setUsertypeAgreementData,
		},
	} = useContext(FormContext);

	const {
		state: { bankId, userToken },
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const [uploadAgreementModal, setUploadAgreementModal] = useState(false);
	const [uploadAgreementName, setUploadAgreementName] = useState(null);
	const [uploadAgreementDocs, setUploadAgreementDocs] = useState({});
	const [homeBranchList, sethomeBranchList] = useState([]);

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;

	const onProceed = data => {
		!isViewLoan && onSave(data);
		setCompleted(id);
		onFlowChange(map.main);
	};

	const onSave = data => {
		const {
			branchId,
			loanAmount,
			loanType,
			tenure,
			address1,
			address2,
			address3,
			city,
			pinCode,
			state,
			...rest
		} = data;

		const homeLoanBranchName =
			homeBranchList.filter(ele => ele.id === branchId)[0]?.branch || '';
		const loanData = formatLoanData(data, map.fields[id].data);
		const address = map?.fields['address-details']?.data
			? formatLoanData(data, map.fields['address-details'].data)
			: {};
		// setUsertypeEmiData(emiData);
		setUsertypeBankData({
			bankId: bankId,
			branchId: data?.branchId?.value || data?.branchId || '',
		});
		setUsertypeLoanData({
			...loanData,
			...rest,
			branchIdName: homeLoanBranchName,
			address: address,
			summary: 'summary',
		});
		setUsertypeAgreementData(uploadAgreementDocs[uploadAgreementName]);
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const onUploadAgreement = name => {
		setUploadAgreementName(name);
		setUploadAgreementModal(true);
	};

	const onDone = (files, name) => {
		// console.log('agreement docs', files, name);
		// console.log('--', documents);
		setLoanDocuments(files);
		setUploadAgreementDocs(p => ({
			...p,
			[name]: files,
		}));
		setUploadAgreementModal(false);
		// console.log('-->', documents);
	};

	const getBranchOptions = async () => {
		try {
			const opitionalDataReq = await axios.get(
				SEARCH_BANK_BRANCH_LIST({ bankId }),
				{
					headers: { Authorization: `Bearer ${userToken}` },
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
		sessionStorage.removeItem('pan');
		// homebranchdropdown();
		let branchField = map?.fields?.['home-loan-details']?.data?.find(field => {
			return field.name === 'branchId';
		});
		if (branchField.visibility) {
			getBranchOptions();
		}
		// sethomeBranchList(dropdown);
		// eslint-disable-next-line
	}, []);
	const amountConverter = (value, k) => {
		return Math.round(value * valueConversion[k || 'One']);
	};
	const formatEditLoanData = loanData => {
		return {
			loanAmount: amountConverter(
				loanData?.loan_amount,
				loanData?.loan_amount_um
			).toString(),
			tenure: loanData?.applied_tenure.toString(),
			loanType: loanData?.loan_type_id || '',
			address: {
				address1: loanData?.address1 || loanData?.loan_assets?.[0]?.address1,
				address2: loanData?.address2 || loanData?.loan_assets?.[0]?.address2,
				address3: loanData?.address3 || loanData?.loan_assets?.[0]?.flat_no,
				pinCode: loanData?.pinCode || loanData?.loan_assets?.[0]?.pincode,
				city: loanData?.city || loanData?.loan_assets?.[0]?.city,
				state: loanData?.state || loanData?.loan_assets?.[0]?.state,
			},
			branchId: loanData?.branch_id,
		};
	};

	let userTokensss = sessionStorage.getItem(HOSTNAME);
	let preData = {};
	if (
		Object.keys(JSON.parse(userTokensss).formReducer?.user?.loanData).length > 0
	) {
		preData = JSON.parse(userTokensss).formReducer?.user?.loanData;
	} else {
		const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
		preData = formatEditLoanData(editLoanData);
	}

	return (
		<Div>
			<FormWrapper>
				<FlexColom base='60%'>
					<LoanDetails
						register={register}
						formState={formState}
						jsonData={map.fields[id].data}
						size='60%'
						buttonAction={onUploadAgreement}
						uploadedDocs={uploadAgreementDocs}
						label={map.fields[id].label}
						preData={preData}
					/>
				</FlexColom>
				{map?.fields['address-details']?.data && (
					<FlexColom base='40%'>
						<HomeLoanAddressDetails
							jsonData={map.fields['address-details'].data}
							register={register}
							formState={formState}
							size='100%'
							preData={preData?.address}
							isViewLoan={isViewLoan}
						/>
					</FlexColom>
				)}
			</FormWrapper>

			{map.fields[id].message && (
				<Caption>{map.fields['loan-details'].message}</Caption>
			)}

			{map.fields[id]?.loanTable && (
				<HomeLoanDetailsTable tableContent={map.fields[id]?.loanTable} />
			)}
			<ButtonWrap>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					onClick={handleSubmit(onProceed)}
				/>
			</ButtonWrap>

			{uploadAgreementModal && (
				<UploadAgreementModal
					onClose={() => setUploadAgreementModal(false)}
					onDone={onDone}
					name={uploadAgreementName}
				/>
			)}
		</Div>
	);
}
