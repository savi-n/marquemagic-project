import { useContext, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import EMIDetails from '../../../shared/components/EMIDetails/EMIDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { LoanFormContext } from '../../../reducer/loanFormDataReducer';
import { UserContext } from '../../../reducer/userReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';

import { useToasts } from '../../../components/Toast/ToastProvider';
import { APP_CLIENT, BANK_LIST_FETCH } from '../../../_config/app.config';
import useFetch from '../../../hooks/useFetch';

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

// const formatEmiData = (formData, fields) => {
// 	return fields
// 		.map(f => ({
// 			type: f.name,
// 			amount: formData[f.name],
// 			bank: formData[`${f.name}_bank_name`]?.name,
// 		}))
// 		.filter(f => f.bank);
// };

const formatEmiData = (formData, fields, r) => {
	const m = [];
	fields.map(f => {
		const emi = {
			id:
				typeof formData[`${f.name}_bank_id`] === 'string'
					? formData[`${f.name}_bank_id`]
					: formData[`${f.name}_bank_id`].name,
			type: f.name,
			amount: formData[f.name],
			bank:
				typeof formData[`${f.name}_bank_id`] === 'string'
					? formData[`${f.name}_bank_id`]
					: formData[`${f.name}_bank_id`].name,
		};
		m.push(emi);
	});
	return m;
};

const formatLoanEmiData = (formData, fields) => {
	return fields
		.map(f => ({
			emiAmount: formData[f.name],
			bank_name: formData[`${f.name}_bank_name`],
		}))
		.filter(f => f.emiAmount);
};

EMIDetailsPage.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};

export default function EMIDetailsPage({ id, onFlowChange, map }) {
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const {
		state,
		actions: { setUsertypeEmiData },
	} = useContext(FormContext);

	const {
		actions: { setLoanData },
	} = useContext(LoanFormContext);
	const {
		state: { bankId, userToken },
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const { response } = useFetch({
		url: BANK_LIST_FETCH,
		headers: { authorization: `Bearer ${userToken || companyDetail?.token}` },
	});
	const onProceed = data => {
		if (
			(data?.existing_auto_loan && Number(data?.existing_auto_loan) === 0) ||
			(data?.existing_lap_loan && Number(data?.existing_lap_loan) === 0) ||
			(data?.existing_personal_loan &&
				Number(data?.existing_personal_loan) === 0)
		) {
			return addToast({
				message: 'EMI cannot be zero',
				type: 'error',
			});
		}
		// preData?.[`${field.name}_bank_name`]
		onSave(data);
		setCompleted(id);
		if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
			if (map.main === 'cub-document-upload') {
				map.main = 'document-upload';
			}
		}
		onFlowChange(map.main);
	};

	const onSkip = () => {
		setCompleted(id);
		onFlowChange(map.main);
	};

	const onSave = data => {
		const emiData = formatEmiData(
			data,
			[...map.fields[id].data, ...additionalField],
			response
		);
		setUsertypeEmiData(emiData);
		setLoanData(formatLoanEmiData(data, map.fields[id].data), id);

		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const [additionalField, setAdditionalField] = useState([]);

	const onAdd = () => {
		const newField = {
			...map.fields[id].data[0],
			name: `addDed_${additionalField.length + 1}`,
			placeholder: 'Additional Deductions/repayment',
		};
		setAdditionalField([...additionalField, newField]);
	};

	const skipButton = map.fields[id].data.some(f => f?.rules?.required);
	let existing_auto_loan = '';
	let existing_auto_loan_bank_name = '';
	let existing_auto_loan_bank_id = '';

	let existing_lap_loan = '';
	let existing_lap_loan_bank_name = '';
	let existing_lap_loan_bank_id = '';

	let existing_personal_loan = '';
	let existing_personal_loan_bank_name = '';
	let existing_personal_loan_bank_id = '';
	state?.user?.emi?.map(r => {
		if (r.type === 'existing_auto_loan') {
			existing_auto_loan = r?.amount;
			existing_auto_loan_bank_name = r?.bank;
			existing_auto_loan_bank_id = r?.id;
		}
		if (r.type === 'existing_lap_loan') {
			existing_lap_loan = r?.amount;
			existing_lap_loan_bank_name = r?.bank;
			existing_lap_loan_bank_id = r?.id;
		}
		if (r.type === 'existing_personal_loan') {
			existing_personal_loan = r?.amount;
			existing_personal_loan_bank_name = r?.bank;
			existing_personal_loan_bank_id = r?.id;
		}
	});

	const preData = {
		existing_auto_loan,
		existing_auto_loan_bank_name,
		existing_auto_loan_bank_id,
		existing_lap_loan,
		existing_lap_loan_bank_name,
		existing_lap_loan_bank_id,
		existing_personal_loan,
		existing_personal_loan_bank_name,
		existing_personal_loan_bank_id,
	};
	return (
		<Div>
			<EMIDetails
				register={register}
				formState={formState}
				jsonData={[...map.fields[id].data, ...additionalField]}
				label={map.fields[id].label}
				preData={preData}
			/>

			<Wrapper>
				<RoundButton onClick={onAdd}>+</RoundButton> click to add additional
				deductions/repayment obligations
			</Wrapper>
			<ButtonWrap>
				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
				{!skipButton && <Button name='Skip' onClick={onSkip} />}
			</ButtonWrap>
		</Div>
	);
}
