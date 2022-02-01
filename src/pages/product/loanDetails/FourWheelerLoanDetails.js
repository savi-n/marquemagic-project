import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import EMIDetails from '../../../shared/components/EMIDetails/EMIDetails';
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

const FormWrapper = styled.div`
	display: flex;
	width: 100%;
`;

const Caption = styled.div`
	background: #e6e7e9;
	padding: 15px 20px;
	font-size: 16px;
	border-radius: 10px;
	margin-bottom: 30px;
	font-weight: 500;
`;

const FlexColom = styled.div`
	flex-basis: ${({ base }) => (base ? base : '100%')};
`;

const additionalLoanData = formData => {
	const formatData = {
		modelName: formData.vehicle.value,
		exShowroomPrice: formData.exShowroomPrice,
		accessories: formData.Accessories,
		insurance: formData.insurance,
		roadTax: formData.roadTaxRegistration
	};

	return formatData;
};

const formatEmiData = (formData, fields) => {
	return fields
		.map(f => ({
			type: f.name,
			amount: formData[f.name],
			bank: formData[`${f.name}_bank_name`]?.name
		}))
		.filter(f => f.bank);
};

FourWheelerLoanDetailsPage.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
	productDetails: object
};

export default function FourWheelerLoanDetailsPage({ id, map, onFlowChange, productDetails }) {
	const {
		actions: { setCompleted }
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeLoanData, setUsertypeEmiData, setUsertypeBankData }
	} = useContext(FormContext);

	const {
		state: { bankId }
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();

	const onProceed = data => {
		onSave(data);
		setCompleted(id);
		onFlowChange(map.main);
	};

	const onSave = data => {
		const emiData = formatEmiData(data, map.fields['emi-details'].data);
		const loanData = formatLoanData(data, map.fields['loan-details'].data);

		setUsertypeEmiData(emiData);
		setUsertypeBankData({
			bankId: bankId,
			branchId: data.branchId?.value || data.branchId
		});
		setUsertypeLoanData({
			...loanData,
			summary: 'summary',
			automobileType: productDetails.loanType,
			...(map.fields['loan-details-additional']?.data &&
				additionalLoanData(data, map.fields['loan-details-additional']?.data))
		});
		addToast({
			message: 'Saved Succesfully',
			type: 'success'
		});
	};

	useEffect(() => {
		localStorage.removeItem('pan');
	}, []);

	return (
		<Div>
			<FormWrapper>
				<FlexColom base='50%'>
					<LoanDetails
						register={register}
						formState={formState}
						jsonData={map.fields['loan-details'].data}
						label={map.fields['loan-details'].label}
						loanType={productDetails.loanType}
						size='80%'
					/>
				</FlexColom>
				<FlexColom base='50%'>
					<LoanDetails
						register={register}
						formState={formState}
						jsonData={map.fields['loan-details-additional']?.data}
						label={map.fields['loan-details-additional']?.label}
						size='80%'
					/>
				</FlexColom>
			</FormWrapper>
			{map.fields['loan-details'].message && <Caption>{map.fields['loan-details'].message}</Caption>}
			<EMIDetails
				register={register}
				formState={formState}
				jsonData={map.fields['emi-details'].data}
				label={map.fields['emi-details'].label}
			/>
			<ButtonWrap>
				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
			</ButtonWrap>
		</Div>
	);
}
