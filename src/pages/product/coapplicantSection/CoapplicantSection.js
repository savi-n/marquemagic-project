/* Co-applicant details section */
// TODO: test all features of co-applicant and remove all commented codes
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import useFetch from 'hooks/useFetch';
import useForm from 'hooks/useForm';
import Button from 'components/Button';
import { UserContext } from 'reducer/userReducer';
import AddressDetails from 'shared/components/AddressDetails/AddressDetails';
import PersonalDetails from 'shared/components/PersonalDetails/PersonalDetails';
import SalaryDetails from 'shared/components/SalaryDetails/SalaryDetails';
import { FormContext } from 'reducer/formReducer';
import { FlowContext } from 'reducer/flowReducer';
import useCaseCreation from 'components/CaseCreation';
import downArray from 'assets/icons/down_arrow_grey_icon.png';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	COAPPLICANT_DETAILS,
	CO_APP_CREATE_REQ_BODY,
	CO_APP_CREATE_RESPONSE,
	CO_APP_DETAILS,
	HOSTNAME,
} from '_config/app.config';
// import { getFlowData } from 'utils/localStore';

const Section = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	border-bottom: 1px solid #ddd;
	/* border: 1px solid #ddd; */
	height: 60px;
	${({ hideBorderBottom }) =>
		hideBorderBottom &&
		`
		height: 0;
		border-bottom: 0;
  `}
`;

const H = styled.h1`
	font-size: 1.5em;
	margin-bottom: 20px;
	font-weight: 500;
	span {
		color: black;
	}
`;
const ButtonWrap = styled.div`
	display: flex;
	align-items: flex-end;
	gap: 20px;
	margin-top: 30px;
`;
// const AddCoapplicant = styled.button`
// 	color: white;
// 	border: 2px solid #2a2add;
// 	border-radius: 5px;
// 	padding: 10px 20px;
// 	background: #1414ad;
// 	-webkit-align-items: flex-start;
// 	-webkit-box-align: flex-start;
// 	-ms-flex-align: flex-start;
// 	align-items: flex-start;
// 	width: 200px;
// 	font-size: 0.9em;
// 	font-weight: 500;
// 	text-align: center;
// 	-webkit-transition: 0.2s;
// 	transition: 0.2s;
// 	-webkit-box-pack: center;
// 	-webkit-justify-content: center;
// 	-ms-flex-pack: center;
// 	justify-content: center;
// 	border-radius: 40px;
// `;
const Caption = styled.h3`
	width: 20%;
	font-weight: 500;
	display: flex;
	justify-content: space-between;
`;
const PresentAddressCheckBoxWrapper = styled.div`
	display: flex;
	input,
	label {
		cursor: pointer;
	}
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
	${({ disabled }) =>
		disabled &&
		`
		background: #fafafa;
		background-color: #fafafa;
		cursor: not-allowed;
	`}
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
	color: ${({ theme, fillColor }) => (fillColor ? '#0068FF' : 'white')};
	border: 2px solid
		${({ theme, fillColor }) =>
			fillColor && (typeof fillColor === 'string' ? fillColor : 'white')};
	border-radius: 40px;
	display: flex;
	align-items: center;
	min-width: ${({ width }) => (width ? width : '200px')};
	justify-content: space-between;
	font-size: 1.2rem;
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
	// CONSTANTS
	const { userType, id, onFlowChange, map, productId } = props;

	const {
		state,
		actions: { setFlowData },
	} = useContext(FormContext);

	const {
		state: { userToken },
	} = useContext(UserContext);

	const {
		handleSubmit,
		register,
		formState,
		clearError,
		onUseFormFieldChange,
	} = useForm();
	const formReducer = JSON.parse(sessionStorage.getItem(HOSTNAME))?.formReducer;
	const applicantData = formReducer?.user?.applicantData;
	const applicantPresentAddress =
		applicantData?.address?.filter(a => a.addressType === 'present')?.[0] || {};
	// let personalDetailsJsonValue = map?.fields['personal-details'].data;
	// let salaryDetailsJsonValue = map?.fields['salary-details'].data;
	// let addressDetailsJsonValue = map?.fields['address-details'].data;
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const userTokensss = sessionStorage.getItem(HOSTNAME);
	const sessionCoApplicantRes =
		JSON.parse(userTokensss).formReducer?.user?.[CO_APP_CREATE_RESPONSE] || [];

	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	const isEditLoan = !editLoanData ? false : editLoanData?.isEditLoan;
	const editLoanCoApplicants = editLoanData?.director_details?.filter(
		d => d?.type_name?.toLowerCase() === 'co-applicant'
	);
	let editCoApplicantData = {};
	if (editLoanData && editLoanCoApplicants.length > 0) {
		editLoanCoApplicants?.map((coApplicant, index) => {
			for (const key in coApplicant) {
				// console.log('key-', { key, coApplicant });
				// console.log('key-', { value: coApplicant[key] });
				if (
					coApplicant[key] &&
					(coApplicant[key] === 'null' || coApplicant[key] === 'NULL')
				) {
					coApplicant[key] = '';
				}
			}
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
				[`incomeType${currentIndex}`]:
					coApplicant?.income_type === 0 ? '0' : coApplicant?.income_type || '',
				[`panNumber${currentIndex}`]: coApplicant?.dpancard || '',
				[`aadhaar${currentIndex}`]: coApplicant?.daadhaar || '',
				[`residenceStatus${currentIndex}`]: coApplicant?.residence_status || '',
				[`maritalStatus${currentIndex}`]: coApplicant?.marital_status || '',
				[`countryResidence${currentIndex}`]:
					coApplicant?.country_residence || '',
				[`netMonthlyIncome${currentIndex}`]:
					coApplicant?.incomeData?.net_monthly_income?.toString() || '',
				[`grossIncome${currentIndex}`]:
					coApplicant?.incomeData?.gross_income?.toString() || '',
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
	// -- CONSTANTS

	// LOCAL STATES
	const [loading, setLoading] = useState(false);
	const [openDrawer, setOpenDrawer] = useState(-1);
	const resData = formReducer?.user?.[CO_APP_CREATE_RESPONSE] || [];
	const {
		actions: { setCompleted },
	} = useContext(FlowContext);
	const [prePopulateCoApplicants, setPrePopulateCoApplicants] = useState(
		formReducer?.user?.[CO_APP_DETAILS] || editCoApplicantData || {}
	);

	const [totalCoapplicantCount, setTotalCoapplicantCount] = useState(1);
	const [match, setMatch] = useState(false);
	const { caseCreationUserType } = useCaseCreation(
		userType,
		productId[(state[userType]?.applicantData?.incomeType)] || '',
		userType
	);
	const [presentAddressCheck, setPresentAddressCheck] = useState([]);
	const { addToast } = useToasts();
	const [proceed, setProceed] = useState(false);
	const { newRequest } = useFetch();
	// --LOCAL STATES
	// useEffect(() => {
	// console.log(submitCoAppRes, '000');
	// }, [submitCoAppRes]);
	const openCloseCollaps = index => {
		if (totalCoapplicantCount === 1) return;
		setOpenDrawer(openDrawer === index ? -1 : index);
	};

	const addCoapplicant = () => {
		setTotalCoapplicantCount(totalCoapplicantCount + 1);
		setOpenDrawer(totalCoapplicantCount);
		clearError();
	};

	const deleteSection = index => {
		// console.log('deleteSection-', {
		// 	totalCoapplicantCount,
		// 	index,
		// 	formState,
		// });
		const newFormState = {};
		// return;
		for (const key in formState.values) {
			if (+key.slice(-1) !== index + 1) {
				newFormState[key] = formState.values[key];
			}
		}
		// personalDetailsJsonValue.map(d => {
		// 	delete newFormState.values[`${d.name}${index + 1}`];
		// 	return null;
		// });
		// salaryDetailsJsonValue.map(d => {
		// 	delete newFormState.values[`${d.name}${index + 1}`];
		// 	return null;
		// });
		// addressDetailsJsonValue.map(d => {
		// 	delete newFormState.values[`permanent_${d.name}${index + 1}`];
		// 	return null;
		// });
		formState.values = newFormState;
		// return;
		const storeData = JSON.stringify(newFormState);
		const tempObject = storeData.replaceAll('permanent_', '');
		const changedData = JSON.parse(tempObject);
		// console.log('deleteSection-after', {
		// 	totalCoapplicantCount,
		// 	index,
		// 	newFormState,
		// 	formState,
		// 	id,
		// 	storeData,
		// 	tempObject,
		// 	changedData,
		// });
		setFlowData(changedData, id);
		setPrePopulateCoApplicants(changedData);
		setTotalCoapplicantCount(totalCoapplicantCount - 1);
	};

	const errorOnSubmit = () => {
		addToast({
			message:
				'Please check all the manadatory fields in all the Co-Applicant Sections',
			type: 'error',
		});
	};

	const onProceed = async data => {
		try {
			if (isViewLoan) {
				setCompleted(id);
				onFlowChange(map.main);
				return;
			}
			setLoading(true);
			const userTokensss = sessionStorage.getItem(HOSTNAME);
			// refetch latest response form storage dynamically as this requires latest data
			const sessionCoApplicantRes =
				JSON.parse(userTokensss).formReducer?.user?.[CO_APP_CREATE_RESPONSE] ||
				[];
			const reqBody = {
				co_applicant_director_partner_data: [],
				origin: 'nconboarding',
			};
			Array(totalCoapplicantCount)
				.fill(0)
				.map((coApplicant, index) => {
					const indexValue = index + 1;
					const formatedData = {
						dfirstname: formState.values[`firstName${indexValue}`],
						dlastname: formState.values[`lastName${indexValue}`],
						ddob: formState.values[`dob${indexValue}`],
						dcontact: formState.values[`mobileNo${indexValue}`],
						demail: formState.values[`email${indexValue}`],
						applicant_relationship:
							formState.values[`relationship_with_applicant${indexValue}`],
						income_type: formState.values[`incomeType${indexValue}`],
						dpancard: formState.values[`panNumber${indexValue}`],
						daadhaar: formState.values[`aadhaar${indexValue}`],
						residence_status: formState.values[`residenceStatus${indexValue}`],
						marital_status: formState.values[`maritalStatus${indexValue}`],
						country_residence:
							formState.values[`countryResidence${indexValue}`],
						netMonthlyIncome: formState.values[`netMonthlyIncome${indexValue}`],
						grossIncome: formState.values[`grossIncome${indexValue}`],
						address1: formState.values[`permanent_address1${indexValue}`],
						address2: formState.values[`permanent_address2${indexValue}`],
						address3: formState.values[`permanent_address3${indexValue}`],
						address4: formState.values[`permanent_address4${indexValue}`],
						locality: formState.values[`permanent_address3${indexValue}`],
						pincode: formState.values[`permanent_pinCode${indexValue}`],
						city: formState.values[`permanent_city${indexValue}`],
						state: formState.values[`permanent_state${indexValue}`],
						type_name: 'Co-applicant', // don't remove this
						business_id: +sessionStorage.getItem('business_id') || '',
					};
					if (isEditLoan) {
						if (editLoanCoApplicants?.[index]?.id) {
							// this check is to make sure only pass id for existing directors
							formatedData.id = editLoanCoApplicants?.[index]?.id;
							formatedData.business_id =
								editLoanCoApplicants?.[index]?.business;
						}
						if (!formatedData.business_id) {
							formatedData.business_id = editLoanData?.business_id?.id;
						}
					}
					if (
						sessionCoApplicantRes &&
						sessionCoApplicantRes.length > 0 &&
						sessionCoApplicantRes?.[index]?.id
					) {
						formatedData.id = sessionCoApplicantRes?.[index]?.id;
					}
					reqBody.co_applicant_director_partner_data.push(formatedData);
					return null;
				});
			// console.log('coapplicantsection-before-submitting-', {
			// 	formState,
			// 	reqBody,
			// 	sessionCoApplicantRes,
			// });
			// return;
			// const oldPrePopulateCoApplicants = getFlowData(CO_APP_DETAILS) || [];
			const newCoApplicantValues = {};
			for (const key in formState?.values || {}) {
				let newKey = key;
				if (key.includes('permanent_')) {
					newKey = key.slice(10);
				}
				newCoApplicantValues[newKey] = formState.values[key];
			}
			// console.log('coapplicantsection-onproceed-', {
			// 	oldPrePopulateCoApplicants,
			// 	newCoApplicantValues,
			// });
			// if (!_.isEqual(oldPrePopulateCoApplicants, newCoApplicantValues)) {
			try {
				const submitCoapplicantsReq = await newRequest(COAPPLICANT_DETAILS, {
					method: 'POST',
					data: reqBody,
					headers: {
						Authorization: `Bearer ${userToken ||
							sessionStorage.getItem('userToken')}`,
					},
				});
				let submitCoAppRes = submitCoapplicantsReq?.data?.data;
				setFlowData(
					reqBody.co_applicant_director_partner_data,
					CO_APP_CREATE_REQ_BODY
				);
				setFlowData(
					submitCoAppRes.sort((a, b) => a.id - b.id),
					CO_APP_CREATE_RESPONSE
				);
				addToast({
					message: 'Saved Succesfully',
					type: 'success',
				});
			} catch (er) {
				console.error(er);
				setLoading(false);
				addToast({
					message: 'Server down, try after sometime',
					type: 'error',
				});
				return;
			}
			// }
			const storeData = JSON.stringify(data);
			const tempObject = storeData.replaceAll('permanent_', '');
			const changedData = JSON.parse(tempObject);
			// used for prefilling values on reload
			setFlowData(changedData, CO_APP_DETAILS);
			setCompleted(id);
			onFlowChange(map.main);
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.error('error-coapplicantsection-onproceed-', error);
		}
	};

	useEffect(() => {
		try {
			// console.log('coapplicantsection-useeffect-');
			const userTokensss = sessionStorage.getItem(HOSTNAME);
			let newPrePopulateCoApplicants = {};
			const sessionCoApplicantData =
				JSON.parse(userTokensss).formReducer?.user?.[CO_APP_DETAILS] || {};
			if (Object.keys(sessionCoApplicantData).length > 0) {
				newPrePopulateCoApplicants = sessionCoApplicantData;
			} else if (Object.keys(editCoApplicantData).length > 0) {
				newPrePopulateCoApplicants = editCoApplicantData;
			}
			setPrePopulateCoApplicants(newPrePopulateCoApplicants);
			const lastKey = Object.keys(newPrePopulateCoApplicants).pop();
			setTotalCoapplicantCount(+lastKey?.slice(-1) || 1);
			setOpenDrawer(0);
		} catch (error) {
			console.error('error-coapplicantsection-prepopulate-', error);
		}
		// eslint-disable-next-line
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

	useEffect(() => {
		if (totalCoapplicantCount === 1) setOpenDrawer(0);
	}, [totalCoapplicantCount]);

	// console.log('coapplicantsectino-allstates-', {
	// 	applicantPresentAddress,
	// 	editLoanCoApplicants,
	// 	editCoApplicantData,
	// 	prePopulateCoApplicants,
	// 	openDrawer,
	// 	totalCoapplicantCount,
	// 	presentAddressCheck,
	// });

	const prepopulateApplicantAddressValue = index => {
		const newPresentAddressCheck = _.cloneDeep(presentAddressCheck);
		newPresentAddressCheck[index] = !newPresentAddressCheck[index];
		setPresentAddressCheck(newPresentAddressCheck);
		if (newPresentAddressCheck[index]) {
			onUseFormFieldChange({
				name: [`permanent_address1${index + 1}`],
				value: applicantPresentAddress?.address1 || '',
			});
			onUseFormFieldChange({
				name: [`permanent_address2${index + 1}`],
				value: applicantPresentAddress?.address2 || '',
			});
			onUseFormFieldChange({
				name: [`permanent_address3${index + 1}`],
				value: applicantPresentAddress?.address3 || '',
			});
			onUseFormFieldChange({
				name: [`permanent_address4${index + 1}`],
				value: applicantPresentAddress?.address4 || '',
			});
			onUseFormFieldChange({
				name: [`permanent_pinCode${index + 1}`],
				value: applicantPresentAddress?.pinCode || '',
			});
			onUseFormFieldChange({
				name: [`permanent_city${index + 1}`],
				value: applicantPresentAddress?.city || '',
			});
			onUseFormFieldChange({
				name: [`permanent_state${index + 1}`],
				value: applicantPresentAddress?.state || '',
			});
		}
	};

	// useEffect(() => {
	// 	presentAddressCheck.map((isCheck, index) => {
	// 		if (isCheck) {
	// 			onUseFormFieldChange({
	// 				name: [`permanent_address1${index + 1}`],
	// 				value: applicantPresentAddress?.address1 || '',
	// 			});
	// 			onUseFormFieldChange({
	// 				name: [`permanent_address2${index + 1}`],
	// 				value: applicantPresentAddress?.address1 || '',
	// 			});
	// 			onUseFormFieldChange({
	// 				name: [`permanent_address3${index + 1}`],
	// 				value: applicantPresentAddress?.address1 || '',
	// 			});
	// 			onUseFormFieldChange({
	// 				name: [`permanent_address4${index + 1}`],
	// 				value: applicantPresentAddress?.address1 || '',
	// 			});
	// 			onUseFormFieldChange({
	// 				name: [`permanent_pinCode${index + 1}`],
	// 				value: applicantPresentAddress?.address1 || '',
	// 			});
	// 			onUseFormFieldChange({
	// 				name: [`permanent_city${index + 1}`],
	// 				value: applicantPresentAddress?.address1 || '',
	// 			});
	// 			onUseFormFieldChange({
	// 				name: [`permanent_state${index + 1}`],
	// 				value: applicantPresentAddress?.address1 || '',
	// 			});
	// 		}
	// 		return null;
	// 	});
	// 	// eslint-disable-next-line
	// }, [presentAddressCheck]);

	return (
		<Div>
			{Array(totalCoapplicantCount)
				.fill(0)
				.map((item, index) => {
					// /llogicfor index read data froms essionstarte
					// prepopulobj = assing value shere

					let personalDetailsJson = map?.fields['personal-details'].data;
					let salaryDetailsJson = map?.fields['salary-details'].data;
					let addressDetailsJson = map?.fields['address-details'].data;
					// let {
					// 	address1,
					// 	address2,
					// 	address3,
					// 	address4,
					// 	city,
					// 	addState,
					// 	pinCode,
					// } = {};
					// state?.[(userType === 'Co-applicant' ? 'coapplicant' : userType)]
					// 	?.applicantData?.address[0] || {};

					personalDetailsJson = personalDetailsJson.map(d => {
						return {
							..._.cloneDeep(d),
							name: `${d.name}${index + 1}`,
						};
					});
					salaryDetailsJson = salaryDetailsJson.map(d => {
						return {
							..._.cloneDeep(d),
							name: `${d.name}${index + 1}`,
						};
					});
					addressDetailsJson = addressDetailsJson.map(d => {
						if (d.name.includes('pinCode')) {
							return {
								..._.cloneDeep(d),
								name: `${d.name}${index + 1}`,
								valueForFields: [
									[`city${index + 1}`, `district`],
									[`state${index + 1}`, `state`],
								],
							};
						} else {
							return {
								..._.cloneDeep(d),
								name: `${d.name}${index + 1}`,
							};
						}
					});
					// console.log('coapplicantsection-map-sections-', {
					// 	personalDetailsJson,
					// 	salaryDetailsJson,
					// 	addressDetailsJson,
					// 	prePopulateCoApplicants,
					// });
					// const preDataAddress = { ...prePopulateCoApplicants };
					// if (!!presentAddressCheck[index]) {
					// formState.values = {
					// 	...formState.values,
					// 	[`permanent_address1${index + 1}`]:
					// 		applicantPresentAddress?.address1 || '',
					// 	[`permanent_address2${index + 1}`]:
					// 		applicantPresentAddress?.address2 || '',
					// 	[`permanent_address3${index + 1}`]:
					// 		applicantPresentAddress?.address3 || '',
					// 	[`permanent_address4${index + 1}`]:
					// 		applicantPresentAddress?.address4 || '',
					// 	[`permanent_city${index + 1}`]:
					// 		applicantPresentAddress?.city || '',
					// 	[`permanent_pinCode${index + 1}`]:
					// 		applicantPresentAddress?.pinCode || '',
					// 	[`permanent_state${index + 1}`]:
					// 		applicantPresentAddress?.addState || '',
					// };
					// preDataAddress[`address1${index + 1}`] =
					// 	applicantPresentAddress?.address1;
					// preDataAddress[`address2${index + 1}`] =
					// 	applicantPresentAddress?.address2;
					// preDataAddress[`address3${index + 1}`] =
					// 	applicantPresentAddress?.address3;
					// preDataAddress[`address4${index + 1}`] =
					// 	applicantPresentAddress?.address4;
					// preDataAddress[`pinCode${index + 1}`] =
					// 	applicantPresentAddress?.pinCode;
					// preDataAddress[`city${index + 1}`] = applicantPresentAddress?.city;
					// preDataAddress[`state${index + 1}`] =
					// 	applicantPresentAddress?.state;
					// address1 = applicantPresentAddress?.address1;
					// address2 = applicantPresentAddress?.address2;
					// address3 = applicantPresentAddress?.address3;
					// address4 = applicantPresentAddress?.address4;
					// pinCode = applicantPresentAddress?.pinCode;
					// city = applicantPresentAddress?.city;
					// addState = applicantPresentAddress?.state;
					// }
					// console.log('preDataAddress-', preDataAddress);
					return (
						<div key={`coapp-${index}`}>
							<Section
								hideBorderBottom={totalCoapplicantCount === 1}
								onClick={() => openCloseCollaps(index)}
							>
								<div
									style={{
										alignItems: 'center',
										display: 'flex',
									}}
								>
									{totalCoapplicantCount > 1 ? (
										<StyledButton width={'auto'} fillColor>
											Co-Applicant {index + 1}
										</StyledButton>
									) : (
										<StyledButton width={'auto'} fillColor>
											Co-Applicant
										</StyledButton>
									)}
								</div>
								{totalCoapplicantCount > 1 ? (
									<CollapseIcon
										src={downArray}
										style={{
											transform:
												openDrawer === index ? `rotate(180deg)` : `none`,
											marginLeft: 'auto',
										}}
										alt='arrow'
									/>
								) : null}

								{(!sessionCoApplicantRes?.[index]?.id &&
									totalCoapplicantCount > 1 &&
									!editLoanData &&
									(resData.length === 0 ||
										totalCoapplicantCount > resData.length)) ||
								(isEditLoan &&
									index + 1 > editLoanCoApplicants?.length &&
									(resData.length === 0 ||
										totalCoapplicantCount > resData.length)) ? (
									<div>
										{totalCoapplicantCount === index + 1 ? (
											<DeleteIcon onClick={() => deleteSection(index)}>
												<FontAwesomeIcon icon={faTrash} />
											</DeleteIcon>
										) : null}
									</div>
								) : null}
							</Section>

							<Details open={openDrawer === index}>
								<Wrapper open={openDrawer === index}>
									<PersonalDetails
										headingNameStyle={{ color: 'black' }}
										id={'co-applicant'}
										userType={userType}
										register={register}
										formState={formState}
										jsonData={personalDetailsJson}
										editLoanCoApplicants={editLoanCoApplicants}
										indexCoappplicant={index + 1}
										preData={{
											...prePopulateCoApplicants,
										}}
									/>
									{/* eslint-disable-next-line */}
									{formState?.values?.[`incomeType${index + 1}`] === 0 ||
									formState?.values?.[`incomeType${index + 1}`] ===
										'0' ? null : (
										<SalaryDetails
											headingNameStyle={{ color: 'black' }}
											jsonData={salaryDetailsJson}
											jsonLable={map?.fields?.['salary-details'].label}
											register={register}
											formState={formState}
											incomeType={
												formState?.values?.[`incomeType${index + 1}`] ||
												prePopulateCoApplicants?.[`incomeType${index + 1}`] ||
												''
											}
											preData={{ ...prePopulateCoApplicants }}
										/>
									)}

									<H>
										{isViewLoan ? '' : 'Help us with '}
										<span>Address Details</span>
									</H>
									<PresentAddressCheckBoxWrapper>
										<Caption>Present Address</Caption>
										<NewCheckbox
											id={`sameAsApplicant${index}`}
											type='checkbox'
											name={`sameAsApplicant${index}`}
											checked={!!presentAddressCheck[index]}
											disabled={isViewLoan}
											onChange={() => {
												prepopulateApplicantAddressValue(index);
											}}
										/>
										<label htmlFor={`sameAsApplicant${index}`}>
											Same as applicant's Present Address
										</label>
									</PresentAddressCheckBoxWrapper>
									<AddressDetails
										id={'co-applicant'}
										hideHeader
										userType={userType}
										register={register}
										formState={formState}
										match={match}
										setMatch={setMatch}
										isBusiness={true}
										jsonData={addressDetailsJson}
										presentAddressCheck={!!presentAddressCheck[index]}
										preData={{ ...prePopulateCoApplicants }}
										// preDataPresent={
										// 	{
										// 		// [`address1${index + 1}`]: address1 || '',
										// 		// [`address2${index + 1}`]: address2 || '',
										// 		// [`address3${index + 1}`]: address3 || '',
										// 		// [`address4${index + 1}`]: address4 || '',
										// 		// [`city${index + 1}`]: city || '',
										// 		// [`pinCode${index + 1}`]: pinCode || '',
										// 		// [`state${index + 1}`]: addState || '',
										// 		// ...preDataAddress,
										// 	}
										// }
										// preData={
										// 	{
										// 		// [`address1${index + 1}`]: address1 || '',
										// 		// [`address2${index + 1}`]: address2 || '',
										// 		// [`address3${index + 1}`]: address3 || '',
										// 		// [`address4${index + 1}`]: address4 || '',
										// 		// [`city${index + 1}`]: city || '',
										// 		// [`pinCode${index + 1}`]: pinCode || '',
										// 		// [`state${index + 1}`]: addState || '',
										// 		// ...preDataAddress,
										// 	}
										// }
									/>
								</Wrapper>
							</Details>
						</div>
					);
				})}

			<ButtonWrap>
				{!isViewLoan && totalCoapplicantCount <= 9 && (
					<Button fill onClick={handleSubmit(addCoapplicant, errorOnSubmit)}>
						Add Co-applicant
					</Button>
				)}
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed, errorOnSubmit)}
				/>
			</ButtonWrap>
		</Div>
	);
};

export default CoapplicantDetailsSection;
