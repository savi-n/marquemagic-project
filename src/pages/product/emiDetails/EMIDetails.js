import { useContext, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import EMIDetails from '../../../shared/components/EMIDetails/EMIDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { LoanFormContext } from '../../../reducer/loanFormDataReducer';

import { useToasts } from '../../../components/Toast/ToastProvider';
import { APP_CLIENT } from '../../../_config/app.config';

const Div = styled.div`
	flex: 1;
	padding: 50px;
	background: #ffffff;
`;

const ButtonWrap = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
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

const formatLoanEmiData = (formData, fields) => {
	return fields
		.map(f => ({
			emiAmount: formData[f.name],
			bank_name: formData[`${f.name}_bank_name`]
		}))
		.filter(f => f.emiAmount);
};

EMIDetailsPage.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string
};

export default function EMIDetailsPage({ id, onFlowChange, map }) {
	const {
		actions: { setCompleted }
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeEmiData }
	} = useContext(FormContext);

	const {
		actions: { setLoanData }
	} = useContext(LoanFormContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();

	const onProceed = data => {
		onSave(data);
		setCompleted(id);
		// if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
		// 	map.main = 'document-upload';
		// }
		onFlowChange(map.main);
	};

	const onSkip = () => {
		setCompleted(id);
		onFlowChange(map.main);
	};

	const onSave = data => {
		const emiData = formatEmiData(data, [...map.fields[id].data, ...additionalField]);

		setUsertypeEmiData(emiData);
		setLoanData(formatLoanEmiData(data, map.fields[id].data), id);

		addToast({
			message: 'Saved Succesfully',
			type: 'success'
		});
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

	const skipButton = map.fields[id].data.some(f => f?.rules?.required);

	return (
		<Div>
			<EMIDetails
				register={register}
				formState={formState}
				jsonData={[...map.fields[id].data, ...additionalField]}
				label={map.fields[id].label}
			/>

			<Wrapper>
				<RoundButton onClick={onAdd}>+</RoundButton> click to add additional deductions/repayment obligations
			</Wrapper>
			<ButtonWrap>
				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
				{!skipButton && <Button name='Skip' onClick={onSkip} />}
			</ButtonWrap>
		</Div>
	);
}
