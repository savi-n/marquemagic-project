import { useContext, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOfType, string } from 'prop-types';

import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import AddressDetails from '../../../shared/components/AddressDetails/AddressDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { UserContext } from '../../../reducer/userReducer';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { useToasts } from '../../../components/Toast/ToastProvider';
import { APP_CLIENT } from '../../../_config/app.config';
import { useEffect } from 'react';

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

const DivWrap = styled.div`
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 20px;
`;

const Question = styled.div`
	font-weight: 500;
	color: blue;
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
	fieldConfig: object,
};
const getPinCode = add => {
	const digits = '1234567890';
	let str = '';
	for (const char of add) {
		if (digits.includes(char)) {
			str += char;
		}
	}
	str = str.trim();
	str = str.replace(' ', '');
	if (str.length < 6) return '';
	return str.substr(str.length - 6);
};
export default function AddressDetailsPage({
	id,
	onFlowChange,
	map,
	fieldConfig,
	productDetails,
}) {
	// console.log('productId', productDetails);
	const isBusiness =
		productDetails.loanType.includes('Business') ||
		productDetails.loanType.includes('LAP') ||
		productDetails.loanType.includes('Working')
			? true
			: false;
	const {
		actions: { setCompleted, activateSubFlow },
	} = useContext(FlowContext);

	const {
		actions: { setUsertypeAddressData },
	} = useContext(FormContext);

	const {
		state: { userBankDetails },
	} = useContext(UserContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const { handleSubmit, register, formState } = useForm();
	const { addToast } = useToasts();

	const [saved, setSaved] = useState(false);
	const [match, setMatch] = useState(false);

	const onSave = formData => {
		let formatedData = [formatData('permanent', formData, map.fields[id].data)];

		!match &&
			formatedData.push(formatData('present', formData, map.fields[id].data));

		setUsertypeAddressData(formatedData);
		setSaved(true);
		addToast({
			message: 'Saved Succesfully',
			type: 'success',
		});
	};

	const onProceed = formData => {
		let formatedData = [formatData('permanent', formData, map.fields[id].data)];

		!match &&
			formatedData.push(formatData('present', formData, map.fields[id].data));

		setUsertypeAddressData(formatedData);
		onSave(formData);
		setCompleted(id);
		onFlowChange(map.main);
	};

	//   const subFlowActivate = () => {
	//     activateSubFlow(id);
	//     onFlowChange(map.sub);
	//   };

	const r = () => {
		if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
			var formStat = JSON.parse(localStorage.getItem('formstate'));
			return formStat?.values;
		} else {
			return userBankDetails;
		}
	};

	return (
		<Div>
			<AddressDetails
				isBusiness={isBusiness}
				register={register}
				formState={formState}
				match={match}
				setMatch={setMatch}
				jsonData={map.fields[id].data}
				preData={{
					address1: companyDetail?.Address || r()?.address1 || '',
					address2: r()?.address2 || '',
					address3: r()?.address3 || '',
					address4: r()?.address4 || '',
					city: r()?.city || '',
					state: r()?.state || '',
					pinCode: companyDetail?.Address
						? getPinCode(companyDetail?.Address)
						: r()?.pin || '',
				}}
			/>
			<ButtonWrap>
				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name='Save' onClick={handleSubmit(onSave)} /> */}
			</ButtonWrap>
		</Div>
	);
}
