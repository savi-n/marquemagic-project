import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import AddressDetails from '../../../shared/components/AddressDetails/AddressDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { UserContext } from '../../../reducer/userReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import useCaseCreation from '../../../components/CaseCreation';
import Loading from '../../../components/Loading';
import Modal from '../../../components/Modal';
import { APP_CLIENT } from '../../../_config/app.config';

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
	gap: 20px;
	align-items: start;
`;

const DivWrap = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
	justify-content: space-between;
	/* margin-bottom: 10px; */
`;

const Question = styled.div`
	font-weight: 500;
	color: blue;
`;

const UserAddButton = styled.div`
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 20px;
`;

const formatData = (type, data, fields) => {
	const formatedData = {};
	for (const f of fields) {
		formatedData[f.name] = data[`${type}_${f.name}`];
	}
	return {
		addressType: type,
		aid: type === 'present' ? 1 : 2,
		...formatedData,
	};
};

AddressDetailsPage.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};

export default function AddressDetailsPage({
	id,
	onFlowChange,
	map,
	productId,
}) {
	const {
		actions: { setCompleted, activateSubFlow },
	} = useContext(FlowContext);

	const {
		state,
		actions: { setUsertypeAddressData },
	} = useContext(FormContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();

	const { processing, caseCreationUser } = useCaseCreation(
		'User',
		productId[state.user.applicantData.incomeType],
		'User'
	);

	const [saved, setSaved] = useState(false);
	const [match, setMatch] = useState(false);

	const saveData = formData => {
		let formatedData = [formatData('permanent', formData, map.fields[id].data)];

		!match &&
			formatedData.push(formatData('present', formData, map.fields[id].data));

		setUsertypeAddressData(formatedData);
		setSaved(true);
	};

	const onSave = formData => {
		saveData(formData);
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const [proceed, setProceed] = useState(null);

	useEffect(() => {
		async function request() {
			setCompleted(id);
			onFlowChange(proceed?.flow);
			if (proceed?.subType) {
				activateSubFlow(id);
			}
			setProceed(null);
		}

		if (proceed) {
			request();
		}
	}, [proceed]);

	const onProceed = (flow, subType = false) => {
		return formData => {
			saveData(formData);
			setProceed({ flow, subType });
		};
	};

	// const subFlowActivate = async () => {
	//   const res = await caseCreationUser();
	//   if (res) {
	//     activateSubFlow(id);
	//     onFlowChange(map.sub);
	//   }
	// };

	// const subHiddenActivate = async () => {
	//   console.log(formState);
	//   const res = await caseCreationUser();
	//   if (res) {
	//     activateSubFlow(id);
	//     onFlowChange(map.hidden);
	//   }
	// };

	const prefilledValues = () => {
		try {
			const formStat = JSON.parse(localStorage.getItem('formstate'));
			return formStat.values;
		} catch (error) {
			console.log('error-AddressDetails-prefilledValues-', error);
			return {};
		}
	};

	return (
		<Div>
			<AddressDetails
				register={register}
				formState={formState}
				match={match}
				setMatch={setMatch}
				jsonData={map.fields[id].data}
				disablePermenanet={true}
				preData={{
					address1: prefilledValues()?.address1 || '',
					address2: prefilledValues()?.address2 || '',
					address3: prefilledValues()?.address3 || '',
					address4: prefilledValues()?.address4 || '',
					city: prefilledValues()?.city || '',
					state: prefilledValues()?.state || '',
					pinCode: prefilledValues()?.pin || '',
				}}
			/>
			<ButtonWrap>
				<Button
					fill
					name='Proceed'
					onClick={handleSubmit(onProceed(map.main))}
					disabled={processing}
				/>
				{/* <Button
          name="Save"
          onClick={handleSubmit(onSave)}
          disabled={processing}
        /> */}

				<UserAddButton>
					{map.sub && (
						<DivWrap>
							<Question>Co-Applicants?</Question>
							<Button
								width='auto'
								fill
								name='Add'
								onClick={handleSubmit(onProceed(map.sub, true))}
							/>
						</DivWrap>
					)}
					{map.hidden && (
						<DivWrap>
							<Question>Guarantor?</Question>
							<Button
								width='auto'
								fill
								name='Add'
								onClick={handleSubmit(onProceed(map.hidden, true))}
							/>
						</DivWrap>
					)}
				</UserAddButton>
			</ButtonWrap>
			{processing && (
				<Modal show={true} onClose={() => {}} width='50%'>
					<Loading />
				</Modal>
			)}
		</Div>
	);
}
