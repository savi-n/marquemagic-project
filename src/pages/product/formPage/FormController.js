import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import PersonalDetails from '../../../shared/components/PersonalDetails/PersonalDetails';
import Button from '../../../components/Button';
import ROCBusinessDetailsModal from '../../../components/ROCBusinessDetailsModal';
import { LoanFormContext } from '../../../reducer/loanFormDataReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import { AppContext } from '../../../reducer/appReducer';
import {
	LOGIN_CREATEUSER,
	WHITELABEL_ENCRYPTION_API,
	APP_CLIENT,
	NC_STATUS_CODE,
} from '../../../_config/app.config';
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

export default function FormController({
	id,
	map,
	onFlowChange,
	productDetails,
}) {
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setLoanData },
	} = useContext(LoanFormContext);

	const { state } = useContext(BussinesContext);

	const { handleSubmit, register, formState } = useForm();
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);

	const {
		state: { companyDetail },
		actions: { setCompanyDetails },
	} = useContext(BussinesContext);

	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	useEffect(() => {
		return () => {
			console.log('unmount form');
		};
	}, []);

	const onSave = data => {
		setLoanData({ ...data }, id);
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const onProceed = async data => {
		if (id === 'business-details') {
			const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
				method: 'POST',
				data: {
					email: formState?.values?.email,
					white_label_id: whiteLabelId,
					source: APP_CLIENT,
					name: formState?.values?.BusinessName,
					mobileNo: formState?.values?.mobileNo,
					addrr1: '',
					addrr2: '',
				},
			});

			const userDetailsRes = userDetailsReq.data;

			const url = window.location.hostname;

			let userToken = localStorage.getItem(url);

			userToken = JSON.parse(userToken);

			userToken = {
				...userToken,
				userReducer: {
					...userToken.userReducer,
					userToken: userDetailsRes.token,
				},
			};

			localStorage.setItem('userToken', userDetailsRes.token);
			localStorage.setItem(url, JSON.stringify(userToken));

			if (userDetailsRes.statusCode === NC_STATUS_CODE.NC200) {
				const encryptWhiteLabelReq = await newRequest(
					WHITELABEL_ENCRYPTION_API,
					{
						method: 'GET',
					},
					{ Authorization: `Bearer ${userDetailsRes.token}` }
				);

				const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

				localStorage.setItem(
					'encryptWhiteLabel',
					encryptWhiteLabelRes.encrypted_whitelabel[0]
				);

				if (encryptWhiteLabelRes.status === NC_STATUS_CODE.OK)
					setCompanyDetails({
						...companyDetail,
						token: userDetailsRes.token,
						userId: userDetailsRes.userId,
						branchId: userDetailsRes.branchId,
						encryptedWhitelabel: encryptWhiteLabelRes.encrypted_whitelabel[0],
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
	const skipButton = map?.fields[id]?.data?.some(f => f?.rules?.required);

	const url = window.location.hostname;

	let userToken = localStorage.getItem(url);

	let loan = JSON.parse(userToken)?.formReducer?.user?.loanData;

	let form = JSON.parse(userToken)?.formReducer?.user?.applicantData;

	return (
		<>
			<Div>
				<PersonalDetails
					register={register}
					formState={formState}
					companyDetail={companyDetail}
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
					<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
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
