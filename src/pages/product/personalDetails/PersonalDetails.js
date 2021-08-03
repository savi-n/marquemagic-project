import { useContext } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import useFetch from '../../../hooks/useFetch';
import PersonalDetails from '../../../shared/components/PersonalDetails/PersonalDetails';
import SalaryDetails from '../../../shared/components/SalaryDetails/SalaryDetails';
import Button from '../../../components/Button';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { UserContext } from '../../../reducer/userReducer';
import { AppContext } from '../../../reducer/appReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import { LOGIN_CREATEUSER } from '../../../_config/app.config';
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

function formatUserDetails(data, fields) {
	let formatedData = {};
	fields.forEach(f => {
		formatedData[f.name] = data[f.name] || '0';
	});
	return formatedData;
}

export default function PersonalDetailsPage({ id, map, onFlowChange }) {
	const {
		state: { whiteLabelId }
	} = useContext(AppContext);
	const {
		actions: { setCompleted }
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeApplicantData, setUsertypeBankData }
	} = useContext(FormContext);

	const {
		state: { userBankDetails, userToken },
		actions: { setUserDetails, setUserId }
	} = useContext(UserContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();
	const { newRequest } = useFetch();

	const onSave = async data => {
		if (!userToken) {
			const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
				method: 'POST',
				data: {
					email: data.email,
					white_label_id: whiteLabelId,
					source: APP_CLIENT,
					name: data.firstName,
					mobileNo: data.mobileNo,
					addrr1: '',
					addrr2: ''
				}
			});

			const userDataRes = userDetailsReq.data;

			const userData = {
				// userAccountToken: userDetailsReq.accToken,
				// userDetails: userDetailsReq.userDetails,
				// userBankDetails: userDetailsReq.cubDetails,
				bankId: userDataRes.bankId,
				branchId: userDataRes.branchId,
				userToken: userDataRes.token
			};
			setUserId(userDataRes.userId);
			setUserDetails(userData);
			setUsertypeBankData({
				bankId: userDataRes.bankId,
				branchId: userDataRes.branchId
			});
		}

		setUsertypeApplicantData({
			...data,
			isApplicant: '1',
			...formatUserDetails(data, map.fields['salary-details'].data)
		});
		addToast({
			message: 'Saved Succesfully',
			type: 'success'
		});
	};

	const onProceed = data => {
		onSave(data);
		setCompleted(id);
		onFlowChange(map.main);
	};

	const r = () => {
		if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
			var formStat = JSON.parse(localStorage.getItem('formstate'));
			console.log(formStat, "console" );
			return formStat.values;
		} else {
			return userBankDetails;
		}


	};


	return (
		<Div>
			<PersonalDetails
				register={register}
				formState={formState}
				preData={{
					firstName: r()?.firstName || '',
					lastName: r()?.lastName || '',
					dob: r()?.dob || '',
					email: r()?.email || '',
					mobileNo: r()?.mobileNum || '',
					panNumber: r()?.panNumber || '',
					residenceStatus: r()?.residentTypess || '',
					// countryResidence: "india",
					aadhaar: r()?.aadharNum || ''
				}}
				jsonData={map.fields[id].data}
			/>
			<SalaryDetails
				jsonData={map.fields['salary-details'].data}
				register={register}
				formState={formState}
				incomeType={formState?.values?.incomeType || null}
			/>
			<ButtonWrap>
				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
			</ButtonWrap>
		</Div>
	);
}

PersonalDetailsPage.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string
};
