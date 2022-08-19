/* EMI details page */

import { useContext, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import EMIDetails from '../../../shared/components/EMIDetails/EMIDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { UserContext } from '../../../reducer/userReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';

import { useToasts } from '../../../components/Toast/ToastProvider';
import { BANK_LIST_FETCH } from '../../../_config/app.config';
import useFetch from '../../../hooks/useFetch';

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
	@media (max-width: 700px) {
		height: auto;
		width: 2.25rem;
	}
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
		return null;
	});
	return m;
};

const formatLoanEmiData = (formData, fields) => {
	return fields
		.map(f => ({
			emiAmount: formData[f.name],
			bank_name:
				formData[`${f.name}_bank_id`]?.name ||
				formData[`${f.name}_bank_id`] ||
				'',
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
		actions: { setUsertypeEmiData, setFlowData },
	} = useContext(FormContext);

	const {
		state: { userToken },
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const { response } = useFetch({
		url: BANK_LIST_FETCH,
		headers: { Authorization: `Bearer ${userToken || companyDetail?.token}` },
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
		if (map.main === 'cub-document-upload') {
			map.main = 'document-upload';
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
		// console.log('onSave-', emiData);
		setUsertypeEmiData(emiData);
		setFlowData(formatLoanEmiData(data, map.fields[id].data), id);
		// setFlowData(emiData, id);
		// setLoanData(formatLoanEmiData(data, map.fields[id].data), id);

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
	if (state?.user?.emi) {
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
			return null;
		});
	} else {
		const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
		if (editLoanData && editLoanData?.emi_details[0]?.emi_details.length > 0) {
			const emaiDetails = JSON.parse(editLoanData?.emi_details[0]?.emi_details);
			if (emaiDetails.length > 0) {
				emaiDetails.map((ele, i) => {
					if (i === 0) {
						existing_auto_loan = ele?.emiAmount;
						existing_auto_loan_bank_name = ele?.bank_name;
						existing_auto_loan_bank_id = ele?.bank_name;
					}
					if (i === 1) {
						existing_personal_loan = ele?.emiAmount;
						existing_personal_loan_bank_name = ele?.bank_name;
						existing_personal_loan_bank_id = ele?.bank_name;
					}
					if (i === 2) {
						existing_lap_loan = ele?.emiAmount;
						existing_lap_loan_bank_name = ele?.bank_name;
						existing_lap_loan_bank_id = ele?.bank_name;
					}
					return null;
				});
			}
		}
	}

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
