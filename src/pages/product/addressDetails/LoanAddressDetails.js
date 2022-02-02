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
	@media (max-width: 700px) {
		padding: 50px 0;
	}
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
	// console.log('getPinCode-add-', add);
	if (add && add?.pncd) return add.pncd;
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

const getAddress = add => {
	// flno: "MEZZANINE FLOOR - NORTH SIDE"
	// bno: "NO  5"
	// bnm: "CRIMSON COURT - 1"
	// loc: "HAL III STAGE, BANGALORE"
	// st: "JEEVANBHIMA NAGAR MAIN ROAD"
	// city: ""
	// dst: "Bengaluru (Bangalore) Urban"
	// stcd: "Karnataka"
	// pncd: "560075"
	// lg: ""
	// lt: ""
	if (add && add?.pncd) {
		const addressLine1 = [];
		if (add.flno) addressLine1.push(add.flno);
		if (add.bno) addressLine1.push(add.bno);
		if (add.bnm) addressLine1.push(add.bnm);
		if (add.loc) addressLine1.push(add.loc);
		if (add.st) addressLine1.push(add.st);
		return addressLine1.join(', ');
	} else return add;
};

export default function AddressDetailsPage({
	id,
	onFlowChange,
	map,
	fieldConfig,
	productDetails,
}) {
	const url = window.location.hostname;

	let userTokensss = localStorage.getItem(url);

	let form = JSON.parse(userTokensss).formReducer?.user?.applicantData;
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
	useEffect(() => {
		!isBusiness &&
			form &&
			form.address &&
			form.address.length === 1 &&
			setMatch(true);
		if (form && form.address && form.address[0]) {
			// if formdata have address that allready saved details
		} else {
			let lengthAddress =
				editLoanData && formatAddressData(editLoanData.business_address);
			if (lengthAddress?.length === 1) {
				setMatch(true);
			}
		}
	}, []);

	const r = () => {
		if (APP_CLIENT.includes('clix') || APP_CLIENT.includes('nctestnew')) {
			var formStat = JSON.parse(localStorage.getItem('formstate'));
			return formStat?.values;
		} else {
			return userBankDetails;
		}
	};
	const formatAddressData = address => {
		const BAddress = address.map((ele, i) => {
			return {
				address1: ele.line1,
				address2: ele.line2,
				address3: ele.locality,
				aid: ele.aid,
				city: ele.city,
				state: ele.state,
				pinCode: ele.pincode,
				addressType: i === 0 ? 'permanent' : 'present',
			};
		});
		return BAddress;
	};
	const editLoanData = JSON.parse(localStorage.getItem('editLoan'));

	const Address =
		(form && form.address && form.address[0]) ||
		(editLoanData && formatAddressData(editLoanData.business_address)[0]);

	return (
		<Div>
			<AddressDetails
				isBusiness={isBusiness}
				register={register}
				formState={formState}
				match={match}
				setMatch={setMatch}
				jsonData={map.fields[id].data}
				preDataFilled={
					form?.address ||
					(editLoanData && formatAddressData(editLoanData.business_address))
				}
				preData={{
					address1:
						Address && Address.address1
							? Address && Address.address1
							: companyDetail?.Address
							? getAddress(companyDetail?.Address)
							: r()?.address1 || '',
					address2: (Address && Address.address2) || r()?.address2 || '',
					address3: (Address && Address.address3) || r()?.address3 || '',
					address4: (Address && Address.address4) || r()?.address4 || '',
					city: (Address && Address.city) || r()?.city || '',
					state: (Address && Address.state) || r()?.state || '',
					pinCode:
						Address && Address.pinCode
							? Address.pinCode
							: companyDetail?.Address
							? companyDetail?.Address
								? getPinCode(companyDetail?.Address)
								: ''
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
