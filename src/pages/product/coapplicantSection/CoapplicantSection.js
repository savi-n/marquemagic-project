/* Co-applicant details section */

import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import useFetch from '../../../hooks/useFetch';
import useForm from '../../../hooks/useForm';
import Button from '../../../components/Button';
import { UserContext } from '../../../reducer/userReducer';
import AddressDetails from '../../../shared/components/AddressDetails/AddressDetails';
import PersonalDetails from '../../../shared/components/PersonalDetails/PersonalDetails';
import SalaryDetails from '../../../shared/components/SalaryDetails/SalaryDetails';
import { FormContext } from '../../../reducer/formReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import useCaseCreation from '../../../components/CaseCreation';
import Loading from '../../../components/Loading';
import Modal from '../../../components/Modal';
import downArray from '../../../assets/icons/down_arrow_grey_icon.png';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { useToasts } from '../../../components/Toast/ToastProvider';
import { COAPPLICANT_DETAILS } from '../../../_config/app.config';

const Section = styled.div`
	display: flex;
	align-items: center;
	cursor: row-resize;
`;

const H = styled.h1`
	font-size: 1.5em;
	margin-bottom: 20px;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
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
const Caption = styled.h3`
	width: 20%;
	font-weight: 500;
	display: flex;
	justify-content: space-between;
`;
const AddressWrapper = styled.div`
	display: flex;
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
const NewCheckbox = styled.input`
	margin-right: 10px;
	width: 15px;
	@media (max-width: 700px) {
		margin: 0 10px 0 20px;
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

const DeleteIcon = styled.div`
	cursor: pointer;
`;

const CoapplicantDetailsSection = props => {
	const { userType, id, onFlowChange, map, productId } = props;
	const [loading, setLoading] = useState(false);
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		state,
		actions: { setFlowData },
	} = useContext(FormContext);

	const { handleSubmit, register, formState } = useForm();
	const addCoApplicantData = {
		dfirstName: '',
		dlastName: '',
		ddob: '',
		dcontact: '',
		demail: '',
		applicant_relationship: '',
		income_type: '',
		dpancard: '',
		daadhaar: '',
		residence_status: '',
		country_residence: '',
		marital_status: '',
		grossIncome: '',
		netMonthlyIncome: '',
		address1: '',
		address2: '',
		address3: '',
		address4: '',
		city: '',
		state: '',
		pincode: '',
		showFields: true,
		presentAddressCheck: false,
		isPresentAddress: false,
	};
	const url = window.location.hostname;
	let formReducer = JSON.parse(sessionStorage.getItem(url))?.formReducer;
	let applicantData = formReducer?.user?.applicantData;
	const applicantPresentAddress =
		applicantData?.address?.filter(a => a.addressType === 'present')?.[0] || {};
	let userTokensss = sessionStorage.getItem(url);
	let personalDetailsJsonValue = map?.fields['personal-details'].data;
	let salaryDetailsJsonValue = map?.fields['salary-details'].data;
	let addressDetailsJsonValue = map?.fields['address-details'].data;
	const coApplicantData =
		JSON.parse(userTokensss).formReducer?.user?.['co-applicant-details'] || {};

	const editLoan = JSON.parse(sessionStorage.getItem('editLoan'));
	const editLoanCoApplicants = editLoan?.director_details?.filter(
		d => d?.type_name?.toLowerCase() === 'co-applicant'
	);

	let editCoApplicantData = {};
	if (editLoan && editLoanCoApplicants.length > 0) {
		editLoanCoApplicants?.map((coApplicant, index) => {
			const currentIndex = index + 1;
			editCoApplicantData = {
				...editCoApplicantData,
				[`firstName${currentIndex}`]: coApplicant?.dfirstname || '',
				[`lastName${currentIndex}`]: coApplicant?.dlastname || '',
				[`dob${currentIndex}`]: coApplicant?.ddob || '',
				[`mobileNo${currentIndex}`]: coApplicant?.dcontact || '',
				[`email${currentIndex}`]: coApplicant?.demail || '',
				[`relationship_with_applicant${currentIndex}`]:
					coApplicant?.applicant_relationship || '',
				[`incomeType${currentIndex}`]: coApplicant?.income_type || '',
				[`panNumber${currentIndex}`]: coApplicant?.dpancard || '',
				[`aadhaar${currentIndex}`]: coApplicant?.daadhaar || '',
				[`residenceStatus${currentIndex}`]: coApplicant?.residence_status || '',
				[`maritalStatus${currentIndex}`]: coApplicant?.marital_status || '',
				[`countryResidence${currentIndex}`]:
					coApplicant?.country_residence || '',
				// [`netMonthlyIncome${currentIndex}`]: coApplicant?.net_monthly_income || '',
				// [`grossIncome${currentIndex}`]: coApplicant?.gross_income || '',
				[`address1${currentIndex}`]: coApplicant?.address1 || '',
				[`address2${currentIndex}`]: coApplicant?.address2 || '',
				[`address3${currentIndex}`]: coApplicant?.locality || '',
				[`address4${currentIndex}`]: coApplicant?.address4 || '',
				[`pinCode${currentIndex}`]: coApplicant?.pincode || '',
				[`city${currentIndex}`]: coApplicant?.city || '',
				[`state${currentIndex}`]: coApplicant?.state || '',
			};
			return null;
		});
	}

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

	const prePopulateCoApplicant =
		Object.keys(editCoApplicantData).length > 0
			? editCoApplicantData
			: coApplicantData;

	const [showCoapplicant, setShowCoapplicant] = useState([addCoApplicantData]);
	const [match, setMatch] = useState(false);
	const { caseCreationUserType } = useCaseCreation(
		userType,
		productId[(state[userType]?.applicantData?.incomeType)] || '',
		userType
	);
	const [presentAddressCheck, setPresentAddressCheck] = useState(false);
	const { addToast } = useToasts();
	const [proceed, setProceed] = useState(false);
	const { newRequest } = useFetch();
	const {
		state: { userToken },
	} = useContext(UserContext);

	const openCloseCollaps = index => {
		if (showCoapplicant.length > 1) {
			showCoapplicant[index].showFields = !showCoapplicant[index].showFields;
			setShowCoapplicant([...showCoapplicant]);
		} else {
		}
	};

	const addCoapplicant = () => {
		for (let i in showCoapplicant) {
			showCoapplicant[i].showFields = false;
		}
		setShowCoapplicant([...showCoapplicant, addCoApplicantData]);
	};

	const deleteSection = index => {
		personalDetailsJsonValue = personalDetailsJsonValue.map(d => {
			delete formState.values[`${d.name}${index + 1}`];
			return null;
		});
		salaryDetailsJsonValue = salaryDetailsJsonValue.map(d => {
			delete formState.values[`${d.name}${index + 1}`];
			return null;
		});
		addressDetailsJsonValue = addressDetailsJsonValue.map(d => {
			delete formState.values[`permanent_${d.name}${index + 1}`];
			return null;
		});
		let data = JSON.parse(JSON.stringify(formState.values));
		let storeData = JSON.stringify(data);
		let tempObject = storeData.replaceAll('permanent_', '');
		let changedData = JSON.parse(tempObject);
		setFlowData(changedData, id);

		if (showCoapplicant.length > 1) {
			showCoapplicant.splice(index, 1);
			setShowCoapplicant([...showCoapplicant]);
		}
		if (showCoapplicant.length === 1) {
			showCoapplicant[0].showFields = true;
			setShowCoapplicant([...showCoapplicant]);
		}
	};

	const errorOnSubmit = () => {
		addToast({
			message:
				'Please check all the manadatory fields in all the Co-Applicant Sections',
			type: 'error',
		});
	};

	useEffect(() => {
		let a = JSON.parse(sessionStorage.getItem('coapplicant_data')) || [
			{ showFields: true },
		];
		setShowCoapplicant(a);
	}, []);

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
		try {
			setLoading(true);
			let storeData = JSON.stringify(data);

			let tempObject = storeData.replaceAll('permanent_', '');
			let changedData = JSON.parse(tempObject);
			let reqBody = { co_applicant_director_partner_data: [] };

			for (let i in showCoapplicant) {
				let apiData = {
					dfirstname: '',
					dlastname: '',
					ddob: '',
					dcontact: '',
					demail: '',
					applicant_relationship: '',
					income_type: '',
					dpancard: '',
					daadhaar: '',
					residence_status: '',
					country_residence: '',
					marital_status: '',
					grossIncome: '',
					netMonthlyIncome: '',
					address: '',
					locality: '',
					city: '',
					state: '',
					pincode: '',
					business_id: sessionStorage.getItem('business_id') || '',
				};
				let indexValue = Number(i) + 1;
				apiData.dfirstname = data[`firstName${indexValue}`];
				apiData.dlastname = data[`lastName${indexValue}`];
				apiData.ddob = data[`dob${indexValue}`];
				apiData.dcontact = data[`mobileNo${indexValue}`];
				apiData.demail = data[`email${indexValue}`];
				apiData.applicant_relationship =
					data[`relationship_with_applicant${indexValue}`];
				apiData.income_type = data[`incomeType${indexValue}`];
				apiData.dpancard = data[`panNumber${indexValue}`];
				apiData.daadhaar = data[`aadhaar${indexValue}`];
				apiData.residence_status = data[`residenceStatus${indexValue}`];
				apiData.marital_status = data[`maritalStatus${indexValue}`];
				apiData.country_residence = data[`countryResidence${indexValue}`];
				apiData.netMonthlyIncome = data[`netMonthlyIncome${indexValue}`];
				apiData.grossIncome = data[`grossIncome${indexValue}`];

				apiData.address =
					data[`permanent_address1${indexValue}`] +
					' ' +
					data[`permanent_address2${indexValue}`] +
					' ' +
					data[`permanent_address3${indexValue}`];
				apiData.locality = data[`permanent_address4${indexValue}`];
				apiData.pincode = data[`permanent_pinCode${indexValue}`];
				apiData.city = data[`permanent_city${indexValue}`];
				apiData.state = data[`permanent_state${indexValue}`];

				reqBody.co_applicant_director_partner_data.push(apiData);
			}
			sessionStorage.setItem(
				'number_of_coapplicants',
				reqBody.co_applicant_director_partner_data.length
			);
			sessionStorage.setItem(
				'coapplicant_data',
				JSON.stringify(showCoapplicant)
			);
			setFlowData(changedData, id);
			try {
				const submitCoapplicantsReq = await newRequest(COAPPLICANT_DETAILS, {
					method: 'POST',
					data: reqBody,
					headers: {
						Authorization: `Bearer ${userToken ||
							sessionStorage.getItem('userToken')}`,
					},
				});

				const res = submitCoapplicantsReq.data.data;
				sessionStorage.setItem('coapplicant_response', JSON.stringify(res));

				addToast({
					message: 'Saved Succesfully',
					type: 'success',
				});
			} catch (er) {
				console.error(er);
				addToast({
					message: er.message || 'Business Profile is failed',
					type: 'error',
				});
			}
			setCompleted(id);
			onFlowChange(map.main);
			setLoading(false);
		} catch (error) {
			console.error('error-coapplicantsection-onproceed-', error);
		}
	};

	// console.log('coapplicantsectino-allstates-', {
	// 	coApplicantData,
	// 	editCoApplicantData,
	// 	prePopulateCoApplicant,
	// });

	return (
		<Div>
			{showCoapplicant?.map((item, index) => {
				// /llogicfor index read data froms essionstarte
				// prepopulobj = assing value shere

				let personalDetailsJson = map?.fields['personal-details'].data;
				let salaryDetailsJson = map?.fields['salary-details'].data;
				let addressDetailsJson = map?.fields['address-details'].data;

				// if (index > 0) {
				personalDetailsJson = personalDetailsJson.map(d => {
					return {
						..._.cloneDeep(d),
						name: `${d.name}${index + 1}`,
						// TODO: remove below line,
					};
				});
				salaryDetailsJson = salaryDetailsJson.map(d => {
					return {
						..._.cloneDeep(d),
						name: `${d.name}${index + 1}`,
						// TODO: remove below line
					};
				});
				addressDetailsJson = addressDetailsJson.map(d => {
					return {
						..._.cloneDeep(d),
						name: `${d.name}${index + 1}`,
						// TODO: remove below line,
					};
				});

				if (presentAddressCheck) {
					address1 = applicantPresentAddress?.address1;
					address2 = applicantPresentAddress?.address2;
					address3 = applicantPresentAddress?.address3;
					address4 = applicantPresentAddress?.address4;
					pinCode = applicantPresentAddress?.pinCode;
					city = applicantPresentAddress?.city;
					addState = applicantPresentAddress?.state;
				}
				return (
					<div key={`coapp-${index}`}>
						{/* style={{
							display: section ? 'None' : '',
						}}> */}
						<Section>
							<div
								onClick={() => openCloseCollaps(index)}
								style={{
									alignItems: 'center',
									display: 'flex',
								}}>
								{showCoapplicant.length > 1 ? (
									<StyledButton width={'auto'} fill>
										Co-Applicant {index + 1}
									</StyledButton>
								) : (
									<StyledButton width={'auto'} fill>
										Co-Applicant
									</StyledButton>
								)}
							</div>
							{showCoapplicant.length > 1 ? (
								<CollapseIcon
									onClick={() => openCloseCollaps(index)}
									src={downArray}
									style={{
										transform: item.showFields ? `rotate(180deg)` : `none`,
										marginLeft: 'auto',
									}}
									alt='arrow'
								/>
							) : null}
							{showCoapplicant.length > 1 ? (
								<div>
									{showCoapplicant.length === index + 1 ? (
										<DeleteIcon onClick={() => deleteSection(index)}>
											<FontAwesomeIcon icon={faTrash} />
										</DeleteIcon>
									) : (
										<DeleteIcon onClick={() => {}}>
											&nbsp;&nbsp;&nbsp;
										</DeleteIcon>
									)}
								</div>
							) : null}
						</Section>

						<Details open={!item.showFields}>
							{showCoapplicant.length > 1 ? <Hr /> : null}
						</Details>
						{/* <Coapplicant /> */}
						<Details open={item.showFields}>
							<Wrapper open={item.showFields}>
								<PersonalDetails
									id={'co-applicant'}
									userType={userType}
									register={register}
									formState={formState}
									jsonData={personalDetailsJson}
									preData={{
										...prePopulateCoApplicant,
										// aadhaar: aadhaar || '',
										// countryResidence: countryResidence || '',
										// dob: dob || '',
										// email: email || '',
										// firstName: firstName || '',
										// incomeType: incomeType || '',
										// lastName: lastName || '',
										// mobileNo: mobileNo || '',
										// panNumber: panNumber || '',
										// residenceStatus: residenceStatus || '',
									}}
								/>
								{/* eslint-disable-next-line */}
								{formState?.values?.[`incomeType${index + 1}`] != 0 ? (
									<SalaryDetails
										jsonData={salaryDetailsJson}
										jsonLable={map?.fields?.['salary-details'].label}
										register={register}
										formState={formState}
										incomeType={
											formState?.values?.[`incomeType${index + 1}`] || null
										}
										preData={{ ...prePopulateCoApplicant }}
									/>
								) : null}

								<H>
									Help us with your <span>Address Details</span>
								</H>
								<AddressWrapper>
									<Caption>Present Address</Caption>
									<NewCheckbox
										id='sameAsApplicant'
										type='checkbox'
										name='sameAsApplicant'
										checked={presentAddressCheck}
										onChange={() => {
											setPresentAddressCheck(!presentAddressCheck);
										}}
									/>
									<label htmlFor='sameAsApplicant'>
										Same as applicant's Present Address
									</label>
								</AddressWrapper>
								<AddressDetails
									hideHeader
									userType={userType}
									register={register}
									formState={formState}
									match={match}
									setMatch={setMatch}
									isBusiness={true}
									jsonData={addressDetailsJson}
									presentAddressCheck={presentAddressCheck}
									preData={{
										[`address1${index + 1}`]: address1 || '',
										[`address2${index + 1}`]: address2 || '',
										[`address3${index + 1}`]: address3 || '',
										[`address4${index + 1}`]: address4 || '',
										[`city${index + 1}`]: city || '',
										[`pinCode${index + 1}`]: pinCode || '',
										[`state${index + 1}`]: addState || '',
										...prePopulateCoApplicant,
									}}
								/>
							</Wrapper>
						</Details>
					</div>
				);
			})}

			<ButtonWrap>
				<AddCoapplicant onClick={handleSubmit(addCoapplicant, errorOnSubmit)}>
					Add Co-applicant
				</AddCoapplicant>
				<Button
					fill
					name='Proceed'
					loading={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed, errorOnSubmit)}
				/>
				{/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
			</ButtonWrap>
			{loading && (
				<Modal show={true} onClose={() => {}} width='50%'>
					<Loading />
				</Modal>
			)}
		</Div>
	);
};

export default CoapplicantDetailsSection;
