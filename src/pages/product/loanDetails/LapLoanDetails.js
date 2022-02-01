import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import HomeLoanAddressDetails from '../../../shared/components/AddressDetails/HomeLoanAddress';
import EMIDetails from '../../../shared/components/EMIDetails/EMIDetails';
import UploadAgreementModal from '../../../components/UploadAgreementModal';
import LoanDetails from '../../../shared/components/LoanDetails/LoanDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { UserContext } from '../../../reducer/userReducer';
import { formatLoanData } from '../../../utils/formatData';
import { useToasts } from '../../../components/Toast/ToastProvider';

const Div = styled.div`
	flex: 1;
	padding: 50px;
	background: #ffffff;
	@media (max-width:700px){
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
	width: 100%;
`;

const FlexColom = styled.div`
	flex-basis: ${({ base }) => (base ? base : '100%')};
`;

const RoundButton = styled.button`
	border-radius: 50%;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 17px;
	/* font-weight: 700; */
	background: ${({ theme }) => theme.buttonColor2};
	margin-right: 10px;
`;

const Wrapper = styled.div`
	display: flex;
	margin: 20px 0;
	align-items: center;
`;

const formatEmiData = (formData, fields) => {
	return fields
		.map(f => ({
			type: f.name,
			amount: formData[f.name],
			bank: formData[`${f.name}_bank_name`]?.name
		}))
		.filter(f => f.bank);
};

HomeLoanDetailsPage.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string
};

export default function HomeLoanDetailsPage({ id, map, onFlowChange }) {
	const {
		actions: { setCompleted }
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeLoanData, setUsertypeEmiData, setUsertypeBankData, setUsertypeAgreementData }
	} = useContext(FormContext);

	const {
		state: { bankId }
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();

	const [uploadAgreementModal, setUploadAgreementModal] = useState(false);
	const [uploadAgreementName, setUploadAgreementName] = useState(null);
	const [uploadAgreementDocs, setUploadAgreementDocs] = useState({});

	const onProceed = data => {
		onSave(data);
		setCompleted(id);
		onFlowChange(map.main);
	};

	const onSave = data => {
		const emiData = formatEmiData(data, [...(map.fields['emi-details']?.data || []), ...additionalField]);

		const loanData = formatLoanData(data, map.fields[id].data);

		const url = window.location.hostname;

		let userToken = localStorage.getItem(url);

		let form = JSON.parse(userToken);

		form = {
			...form,
			formReducer: {
				...form.formReducer,
				user: {
					...form.formReducer.user,
					loanData: {
						...form.formReducer.user.loanData,
						...formatLoanData(data, map.fields[id].data)
					}
				}
			}
		};

		localStorage.setItem(url, JSON.stringify(form));

		setUsertypeEmiData(emiData);
		setUsertypeBankData({
			bankId: bankId,
			branchId: data.branchId.value || data.branchId
		});
		setUsertypeLoanData({
			...loanData,
			summary: data.purposeoftheLoan || 'summary',
			assetsValue: data.valueoftheProperty || 0
		});

		// setUsertypeAgreementData(uploadAgreementDocs[uploadAgreementName]);

		addToast({
			message: 'Saved Succesfully',
			type: 'success'
		});
	};

	const onUploadAgreement = name => {
		setUploadAgreementName(name);
		setUploadAgreementModal(true);
	};

	const onDone = (files, name) => {
		setUploadAgreementDocs(p => ({
			...p,
			[name]: files
		}));
		setUploadAgreementModal(false);
	};

	const [additionalField, setAdditionalField] = useState([]);

	const onAdd = () => {
		const newField = {
			...map.fields[id].data[0],
			name: `addDed_${additionalField.length + 1}`,
			placeholder: 'Additional Deductions/repayment'
		};
		setAdditionalField([...additionalField, newField]);
	};

	useEffect(() => {
		localStorage.removeItem('pan');
	}, []);

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
					/>
				</FlexColom>
				<FlexColom base='40%'>
					<HomeLoanAddressDetails
						jsonData={map.fields['address-details'].data}
						register={register}
						formState={formState}
						size='100%'
					/>
				</FlexColom>
			</FormWrapper>

			{map.fields[id]?.message && <Caption>{map.fields['loan-details'].message}</Caption>}

			{map.fields['emi-details']?.data && (
				<>
					<EMIDetails
						register={register}
						formState={formState}
						jsonData={[...(map.fields['emi-details']?.data || []), ...additionalField]}
						label={map.fields['emi-details']?.label}
					/>
					<Wrapper>
						<RoundButton onClick={onAdd}>+</RoundButton> click to add additional deductions/repayment
						obligations
					</Wrapper>
				</>
			)}

			<ButtonWrap>
				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
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
