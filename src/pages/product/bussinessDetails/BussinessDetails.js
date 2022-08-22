/* Business Details section  */

import { useContext } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from 'hooks/useForm';
import PersonalDetails from 'shared/components/PersonalDetails/PersonalDetails';
import Button from 'components/Button';
import { FormContext } from 'reducer/formReducer';
import { UserContext } from 'reducer/userReducer';
import { useToasts } from 'components/Toast/ToastProvider';

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

export default function BussinessDetailsPage({
	id,
	map,
	onFlowChange,
	fieldConfig,
}) {
	const {
		actions: { setUsertypeApplicantData },
	} = useContext(FormContext);

	const {
		state: { userBankDetails },
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	const onSave = data => {
		setUsertypeApplicantData({ ...data, isApplicant: '1' });
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	return (
		<Div>
			<PersonalDetails
				register={register}
				formState={formState}
				preData={{
					firstName: userBankDetails.firstName,
					lastName: userBankDetails.lastName,
					dob: userBankDetails.dob,
					email: userBankDetails.email,
					mobileNo: userBankDetails.mobileNum,
					panNumber: userBankDetails.pan,
				}}
				jsonData={fieldConfig.bussiness_details.data}
			/>
			<ButtonWrap>
				<Button fill name={`${isViewLoan ? 'Next' : 'Proceed'}`} />
			</ButtonWrap>
		</Div>
	);
}

BussinessDetailsPage.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
	fieldConfig: object,
};
