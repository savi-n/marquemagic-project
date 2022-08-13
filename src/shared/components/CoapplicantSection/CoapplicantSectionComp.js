/* Co-applicant details section */

import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { func, object, oneOf, oneOfType, string } from 'prop-types';
import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import AddressDetails from '../AddressDetails/AddressDetails';
import PersonalDetails from '../PersonalDetails/PersonalDetails';
import SalaryDetails from '../SalaryDetails/SalaryDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { USER_ROLES } from '../../../_config/app.config';
import useCaseCreation from '../../../components/CaseCreation';
import Loading from '../../../components/Loading';
import Modal from '../../../components/Modal';
import downArray from '../../../assets/icons/down_arrow_grey_icon.png';
const Section = styled.div`
	display: flex;
	align-items: center;
	cursor: row-resize;
`;
const ButtonWrap = styled.div`
	display: flex;
	align-items: flex-end;
	gap: 20px;
`;
const AddCoapplicant = styled.button`
	color: white;
	border: 2px solid #2a2add;
	border-radius: 5px;
	padding: 10px 20px;
	background: #1414ad;
	-webkit-align-items: flex-start;
	-webkit-box-align: flex-start;
	-ms-flex-align: flex-start;
	align-items: flex-start;
	width: 200px;
	font-size: 0.9em;
	font-weight: 500;
	text-align: center;
	-webkit-transition: 0.2s;
	transition: 0.2s;
	-webkit-box-pack: center;
	-webkit-justify-content: center;
	-ms-flex-pack: center;
	justify-content: center;
	border-radius: 40px;
`;
const Hr = styled.hr`
	padding: 0;
`;
const CollapseIcon = styled.img`
	height: 18px;
	width: 18px;
	margin-right: 20px;
	object-fit: contain;
	cursor: pointer;
`;
const Wrapper = styled.div`
	margin: 30px 0;
	position: relative;
	max-width: 100%;
	max-height: ${props => (props.open ? '100%' : '0%')};
	display: ${props => (props.open ? 'block' : 'none')};
`;
const Details = styled.div`
	max-height: ${props => (props.open ? '100%' : '0%')};
	padding: ${props => (props.open ? '10px 0' : '0')};
	transition: all 0.3s ease-out;
	@media (max-width: 700px) {
		max-width: 100%;
		padding: 0px;
	}
`;
const Div = styled.div`
	flex: 1;
	padding: 50px;
	background: #ffffff;
	@media (max-width: 700px) {
		padding: 50px 0px;
	}
`;
const StyledButton = styled.button`
	color: ${({ theme, fill }) => (fill ? '#0068FF' : 'white')};
	border: 2px solid
		${({ theme, fill }) => fill && (typeof fill === 'string' ? fill : 'white')};
	border-radius: 40px;
	padding: 0 20px;
	display: flex;
	align-items: center;
	min-width: ${({ width }) => (width ? width : '200px')};
	justify-content: space-between;
	font-size: 1.5rem;
	font-weight: 800;
	text-align: center;
	transition: 0.2s;
	display: flex;
	justify-content: center;
	@media (max-width: 768px) {
		width: 14rem;
		padding: 0 10px;
	}
`;

const EligibiltiyWrapper = styled.div`
	flex-basis: 45%;
	margin-left: auto;
	display: flex;
	flex-direction: column;
`;

const Text = styled.span`
	margin-bottom: 10px;
	color: ${({ theme }) => theme.main_theme_color};
`;

const formatAddressData = (type, data, fields) => {
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

const formatPersonalData = (data, fields) => {
	const formatedData = {};
	for (const f of fields) {
		formatedData[f.name] = data[f.name];
	}

	return { ...formatedData, isApplicant: '0' };
};

CoapplicantDetailsSection.propTypes = {
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
	userType: oneOf(['Co-Applicant', 'Guarantor']),
};

export default function CoapplicantDetailsSection({
	userType,
	id,
	onFlowChange,
	map,
	productId,
	productDetails,
}) {
	const CoapplicantDetails = () => {
		return (
			<>
				<Section onClick={() => openCloseCollaps()}>
					<div
						style={{
							marginLeft: 10,
							alignItems: 'center',
							display: 'flex',
						}}>
						<StyledButton width={'auto'} fill>
							Coapplicant {numberOfCoapplicants}
						</StyledButton>
					</div>
					<CollapseIcon
						src={downArray}
						style={{
							transform: openCoApplicant ? `rotate(180deg)` : `none`,
							marginLeft: 'auto',
						}}
						alt='arrow'
					/>
				</Section>
				<Details open={!openCoApplicant}>
					<Hr />
				</Details>
				<Details open={openCoApplicant}>
					<Wrapper open={openCoApplicant}>
						<PersonalDetails
							userType={userType}
							register={register}
							formState={formState}
							jsonData={map.fields['personal-details'].data}
							preData={{
								aadhaar: aadhaar || '',
								countryResidence: countryResidence || '',
								dob: dob || '',
								email: email || '',
								firstName: firstName || '',
								incomeType: incomeType || '',
								lastName: lastName || '',
								mobileNo: mobileNo || '',
								panNumber: panNumber || '',
								residenceStatus: residenceStatus || '',
							}}
						/>
						<SalaryDetails
							jsonData={map?.fields['salary-details'].data}
							jsonLable={map?.fields['salary-details'].label}
							register={register}
							formState={formState}
							incomeType={formState?.values?.incomeType || null}
						/>
						<AddressDetails
							userType={userType}
							register={register}
							formState={formState}
							match={match}
							setMatch={setMatch}
							jsonData={map.fields['address-details'].data}
							preData={{
								address1: address1 || '',
								address2: address2 || '',
								address3: address3 || '',
								address4: address4 || '',
								city: city || '',
								pinCode: pinCode || '',
								state: addState || '',
							}}
						/>
					</Wrapper>
				</Details>
			</>
		);
	};
	const [openCoApplicant, setOpenCoapplicant] = useState(true);
	const openCloseCollaps = () => {
		setOpenCoapplicant(!openCoApplicant);
	};
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		state,
		actions: { setUsertypeApplicantData, setUsertypeAddressData },
	} = useContext(FormContext);

	const { handleSubmit, register, formState } = useForm();

	const [match, setMatch] = useState(false);
	const { processing, caseCreationUserType } = useCaseCreation(
		userType,
		productId[(state[userType]?.applicantData?.incomeType)] || '',
		userType
	);

	const [isEligibility, setEligibility] = useState(false);
	const [numberOfCoapplicants, setNumberOfCoapplicants] = useState(1);
	const addCoapplicant = () => {
		CoapplicantDetails();
	};
	const saveData = formData => {
		let formatedAddress = [
			formatAddressData(
				'present',
				formData,
				map.fields['address-details'].data
			),
		];

		!match &&
			formatedAddress.push(
				formatAddressData(
					'present',
					formData,
					map.fields['address-details'].data
				)
			);

		const formatApplicantData = {
			...formatPersonalData(formData, map.fields['personal-details'].data),
			typeName: userType,
		};
		setUsertypeApplicantData(
			{ ...formatApplicantData, isEligibility: isEligibility },
			userType === 'Co-applicant' ? 'coapplicant' : USER_ROLES[userType]
		);
		setUsertypeAddressData(
			formatedAddress,
			userType === 'Co-applicant' ? 'coapplicant' : USER_ROLES[userType]
		);
	};

	// const onSave = formData => {
	// 	saveData(formData);
	// 	addToast({
	// 		message: 'Saved Succesfully',
	// 		type: 'success',
	// 	});
	// };

	const [proceed, setProceed] = useState(false);

	useEffect(() => {
		async function request() {
			const res = await caseCreationUserType();
			if (res) {
				setCompleted(id);
				onFlowChange(map.main);
			}
			setProceed(false);
		}

		if (proceed) {
			request();
		}
		// eslint-disable-next-line
	}, [proceed]);

	const onProceed = async data => {
		// console.log('CoapplicantDetails-', data);
		saveData(data);
		setCompleted(id);
		onFlowChange(map.main);
		// if (userType === 'Guarantor') {
		// 	setProceed(true);
		// } else {
		// 	setCompleted(id);
		// 	onFlowChange(map.main);
		// }
	};

	// console.log('coapplicantdetails-guaranter-state', state);
	let {
		aadhaar,
		countryResidence,
		dob,
		email,
		firstName,
		incomeType,
		lastName,
		mobileNo,
		panNumber,
		residenceStatus,
	} =
		state?.[(userType === 'Co-applicant' ? 'coapplicant' : userType)]
			?.applicantData || {};
	let {
		address1,
		address2,
		address3,
		address4,
		city,
		state: addState,
		pinCode,
	} =
		state?.[(userType === 'Co-applicant' ? 'coapplicant' : userType)]
			?.applicantData?.address[0] || {};

	const editLoan = JSON.parse(sessionStorage.getItem('editLoan'));
	if (editLoan && editLoan?.id) {
		const director = editLoan?.director_details.filter(
			d => d.type_name === 'Guarantor'
		);
		// console.log('filtered-director-', director);
		firstName = director[0]?.dfirstname;
		lastName = director[0]?.dlastname;
		incomeType = director[0]?.income_type;
		aadhaar = director[0]?.daadhaar;
		countryResidence = director[0]?.country_residence;
		dob = director[0]?.ddob;
		email = director[0]?.demail;
		mobileNo = director[0]?.dcontact;
		panNumber = director[0]?.dpancard;
		residenceStatus = director[0]?.residence_status;

		address1 = director[0]?.address1;
		address2 = director[0]?.address2;
		address3 = director[0]?.address3;
		address4 = director[0]?.address4;
		city = director[0]?.city;
		addState = director[0]?.state;
		pinCode = director[0]?.pincode;
	}

	return (
		<Div>
			<>
				{' '}
				<Section onClick={() => openCloseCollaps()}>
					<div
						style={{
							marginLeft: 10,
							alignItems: 'center',
							display: 'flex',
						}}>
						<StyledButton width={'auto'} fill>
							Coapplicant {numberOfCoapplicants}
						</StyledButton>
					</div>
					<CollapseIcon
						src={downArray}
						style={{
							transform: openCoApplicant ? `rotate(180deg)` : `none`,
							marginLeft: 'auto',
						}}
						alt='arrow'
					/>
				</Section>
				<Details open={!openCoApplicant}>
					<Hr />
				</Details>
				{/* <Coapplicant /> */}
				<Details open={openCoApplicant}>
					<Wrapper open={openCoApplicant}>
						<PersonalDetails
							userType={userType}
							register={register}
							formState={formState}
							jsonData={map.fields['personal-details'].data}
							preData={{
								aadhaar: aadhaar || '',
								countryResidence: countryResidence || '',
								dob: dob || '',
								email: email || '',
								firstName: firstName || '',
								incomeType: incomeType || '',
								lastName: lastName || '',
								mobileNo: mobileNo || '',
								panNumber: panNumber || '',
								residenceStatus: residenceStatus || '',
							}}
						/>
						<SalaryDetails
							jsonData={map?.fields['salary-details'].data}
							jsonLable={map?.fields['salary-details'].label}
							register={register}
							formState={formState}
							incomeType={formState?.values?.incomeType || null}
						/>
						<AddressDetails
							userType={userType}
							register={register}
							formState={formState}
							match={match}
							setMatch={setMatch}
							jsonData={map.fields['address-details'].data}
							preData={{
								address1: address1 || '',
								address2: address2 || '',
								address3: address3 || '',
								address4: address4 || '',
								city: city || '',
								pinCode: pinCode || '',
								state: addState || '',
							}}
						/>
					</Wrapper>
				</Details>
			</>
			<ButtonWrap>
				<AddCoapplicant onClick={addCoapplicant}>
					Add Co-applicant
				</AddCoapplicant>

				<Button fill name='Proceed' onClick={handleSubmit(onProceed)} />
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
				{userType === 'Co-applicant' && (
					<EligibiltiyWrapper>
						<Text>
							Do you want to include the co-applicant's salary to be included in
							the loan eligibility calculations?
						</Text>
						<ButtonWrap>
							<Button
								{...isEligibility === true && { fill: isEligibility }}
								name='Yes'
								onClick={() => setEligibility(true)}
							/>
							<Button
								{...isEligibility === false && { fill: !isEligibility }}
								name='No'
								onClick={() => setEligibility(false)}
							/>
						</ButtonWrap>
					</EligibiltiyWrapper>
				)}
			</ButtonWrap>
			{processing && (
				<Modal show={true} onClose={() => {}} width='50%'>
					<Loading />
				</Modal>
			)}
		</Div>
	);
}
