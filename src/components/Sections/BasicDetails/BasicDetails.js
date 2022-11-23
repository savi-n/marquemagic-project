import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import { setLoginCreateUserRes } from 'store/appSlice';
import { setLoanIds } from 'store/applicationSlice';
import {
	updateApplicantSection,
	updateCoApplicantSection,
	setSelectedApplicantCoApplicantId,
	setPanExtractionRes,
} from 'store/applicantCoApplicantsSlice';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import ProfileUpload from 'components/ProfileUpload';
import PanUpload from 'components/PanUpload';
import Modal from 'components/Modal';
import CompanySelectModal from 'components/CompanySelectModal';
import InputField from 'components/inputs/InputField';

import * as SectionUI from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import * as CONST_ADDRESS_PROOF_UPLOAD from 'components/AddressProofUpload/const';
import * as CONST from './const';
// import * as CONST_PAN_UPLOAD from 'components/PanUpload/const';
import { EXTRACTION_KEY_PAN } from 'components/AddressProofUpload/const';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { setSelectedSectionId } from 'store/appSlice';
import { formatCompanyData, formatSectionReqBody } from 'utils/formatData';
import {
	API_END_POINT,
	LOGIN_CREATEUSER,
	APP_CLIENT,
	SEARCH_COMPANY_NAME,
	ROC_DATA_FETCH,
} from '_config/app.config';
import { verifyKycDataUiUx } from 'utils/request';
import { useToasts } from 'components/Toast/ToastProvider';
import { isInvalidPan } from 'utils/validation';

const BasicDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		isTestMode,
		selectedSection,
		whiteLabelId,
		clientToken,
		userToken,
	} = app;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
		profileImageRes,
		setCompanyRocData,
		panExtractionRes,
	} = applicantCoApplicants;
	const { isViewLoan } = application;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [isPanConfirmModalOpen, setIsPanConfirmModalOpen] = useState(false);
	const [isCompanyListModalOpen, setIsCompanyListModalOpen] = useState(false);
	const [companyList, setCompanyList] = useState([]);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
		setErrorFormStateField,
	} = useForm();
	const { addToast } = useToasts();

	const onProceed = async () => {
		try {
			setLoading(true);
			// console.log('nextSectionId-', {
			// 	nextSectionId,
			// 	selectedApplicantCoApplicantId,
			// 	newDirectorId,
			// });

			// call login api only once
			if (!userToken) {
				const loginCreateUserReqBody = {
					email: formState?.values?.email || '',
					white_label_id: whiteLabelId,
					source: APP_CLIENT,
					name: formState?.values?.first_name,
					mobileNo: formState?.values?.mobile_no,
					addrr1: '',
					addrr2: '',
				};
				const newLoginCreateUserRes = await axios.post(
					`${LOGIN_CREATEUSER}`,
					loginCreateUserReqBody
				);
				dispatch(setLoginCreateUserRes(newLoginCreateUserRes?.data));
				axios.defaults.headers.Authorization = `Bearer ${
					newLoginCreateUserRes?.data?.token
				}`;
			} else {
				axios.defaults.headers.Authorization = `Bearer ${app.userToken}`;
			}

			// console.log('onProceed-loginCreateUserReqRes-', {
			// 	loginCreateUserReqBody,
			// 	loginCreateUserRes,
			// });
			// return;
			const basicDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
					profile_image_url: profileImageRes?.file,
				},
				app,
				applicantCoApplicants,
				application,
			});

			// TEST MODE
			// return dispatch(setSelectedSectionId(nextSectionId));
			// -- TEST MODE

			const basicDetailsRes = await axios.post(
				`${API_END_POINT}/basic_details`,
				basicDetailsReqBody
			);
			const newLoanRefId = basicDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = basicDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId = basicDetailsRes?.data?.data?.business_data?.id;
			const newDirectorId = basicDetailsRes?.data?.data?.director_details?.id;
			dispatch(
				setLoanIds({
					loanRefId: newLoanRefId,
					loanId: newLoanId,
					businessId: newBusinessId,
				})
			);
			// console.log('onProceed-basicDetailsReqBody-', {
			// 	basicDetailsReqBody,
			// 	basicDetailsRes,
			// });
			const newBasicDetails = {
				id: selectedSectionId,
				values: {
					...formState.values,
					profile_image_url: profileImageRes?.presignedUrl,
				},
			};
			// console.log('onProceed-', {
			// 	newBasicDetails,
			// });
			newBasicDetails.cin = applicantCoApplicants?.companyRocData?.CIN || '';
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				newBasicDetails.applicantId = newDirectorId;
				dispatch(updateApplicantSection(newBasicDetails));
			} else if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.CO_APPLICANT
			) {
				newBasicDetails.directorId = newDirectorId;
				dispatch(updateCoApplicantSection(newBasicDetails));
				dispatch(setSelectedApplicantCoApplicantId(newDirectorId));
			} else {
				newBasicDetails.directorId = selectedApplicantCoApplicantId;
				dispatch(updateCoApplicantSection(newBasicDetails));
			}
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-BasicDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	const verifyKycPan = async (selectedAddressProof, extractionData) => {
		try {
			// console.log('verifyKycPan-', {
			// 	selectedAddressProof,
			// 	isVerifyKycData,
			// 	extractionData,
			// });
			const verifyKycPanReqBody = {
				doc_ref_id: extractionData?.doc_ref_id,
				doc_type: selectedAddressProof,
				number: extractionData.panNumber || '',
				name: extractionData.companyName || '',
			};
			const verifiedRes = await verifyKycDataUiUx(
				verifyKycPanReqBody,
				clientToken
			);
			return verifiedRes;
		} catch (error) {
			console.error('error-verifyKycPan-', error);
			addToast({
				message: error.message || 'Something Went Wrong. Try Again!',
				type: 'error',
			});
			return {};
		}
	};

	const companyNameSearch = async companyName => {
		try {
			setLoading(true);
			const companyNameReqBody = {
				search: companyName.trim(),
			};
			const companyNameSearchRes = await axios.post(
				SEARCH_COMPANY_NAME,
				companyNameReqBody
			);
			const newCompanyList = companyNameSearchRes?.data?.data || [];
			setCompanyList(newCompanyList);
			return newCompanyList;
		} catch (error) {
			console.error('error-companyNameSearch-', error);
			addToast({
				message: error.message || 'Company search failed, try again',
				type: 'error',
			});
			return [];
		} finally {
			setLoading(false);
		}
	};

	const onProceedPanConfirm = async () => {
		try {
			const panErrorMessage = isInvalidPan(panExtractionRes?.panNumber);
			if (panErrorMessage) {
				return addToast({
					message: panErrorMessage,
					type: 'error',
				});
			}
			setLoading(true);
			// call verifykyc api
			const verifiedRes = await verifyKycPan(
				EXTRACTION_KEY_PAN,
				panExtractionRes
			);
			// console.log(
			// 	'pan-verification-handlePanConfirm-verifiedRes-',
			// 	verifiedRes
			// );
			// business product + business pan card

			onChangeFormStateField({
				name: 'pan_number',
				value: panExtractionRes?.panNumber,
			});
			if (
				selectedProduct.isSelectedProductTypeBusiness &&
				panExtractionRes.isBusinessPan
			) {
				await companyNameSearch(
					verifiedRes?.data?.message?.upstreamName ||
						panExtractionRes.companyName
				);
				// console.log('company information from pancardfile', newCompanyList);
				// console.log(
				// 	'information related to pancardextraction',
				// 	panExtractionData
				// );
				setIsPanConfirmModalOpen(false);
				setIsCompanyListModalOpen(true);
				setLoading(false);
				return;
			}
			// business product + personal pan card
			if (selectedProduct.isSelectedProductTypeBusiness) {
				setIsPanConfirmModalOpen(false);
				setLoading(false);
			}
			// salaried product + personal pan card
			if (selectedProduct.isSelectedProductTypeSalaried) {
				setIsPanConfirmModalOpen(false);
				setLoading(false);
			}
			setLoading(false);
			setIsPanConfirmModalOpen(false);
			clearErrorFormState();
		} catch (error) {
			console.error('error-handlePanConfirm-', error);
		}
	};

	const cinNumberFetch = async cinNumber => {
		try {
			setLoading(true);
			const cinFetchReqBody = {
				cin_number: cinNumber,
			};
			const cinNumberResponse = await axios.post(
				ROC_DATA_FETCH,
				cinFetchReqBody,
				{ authorization: clientToken }
			);
			const companyData = cinNumberResponse?.data?.data;
			const formattedCompanyData = formatCompanyData(
				companyData,
				panExtractionRes.panNumber
			);
			setCompanyRocData(formattedCompanyData);
		} catch (error) {
			setLoading(false);
			addToast({
				message:
					'Unable to fetch the data from ROC. Please continue to fill the details.',
				// || error?.message ||
				// 'ROC search failed, try again',
				type: 'error',
			});
			console.error('error-cinnumberfetch-', error);
		} finally {
			setLoading(false);
		}
	};

	const onCompanySelect = async cinNumber => {
		setIsCompanyListModalOpen(false);
		setLoading(true);
		await cinNumberFetch(cinNumber);
	};

	const prefilledValues = field => {
		try {
			if (formState?.values?.[field.name] !== undefined) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				return (
					applicant?.[selectedSectionId]?.[field?.name] || field.value || ''
				);
			}
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.CO_APPLICANT
			) {
				return formState?.values?.[field.name] || field.value || '';
			}
			if (selectedApplicantCoApplicantId) {
				return (
					coApplicants?.[selectedApplicantCoApplicantId]?.[selectedSectionId]?.[
						field?.name
					] ||
					field.value ||
					''
				);
			}
			return '';
		} catch (error) {
			return {};
		}
	};

	let selectedProfileImageUrl = '';
	if (selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT) {
		selectedProfileImageUrl = applicant?.[selectedSectionId]?.profile_image_url;
	} else if (
		selectedApplicantCoApplicantId !== CONST_APP_CO_APP_HEADER.CO_APPLICANT
	) {
		selectedProfileImageUrl =
			coApplicants?.[selectedApplicantCoApplicantId]?.[selectedSectionId]
				?.profile_image_url;
	}

	// console.log('BasicDetails-', {
	// 	panExtractionRes,
	// 	formState,
	// 	app,
	// 	applicantCoApplicants,
	// 	application,
	// });

	const isPanNumberExist = !!formState.values.pan_number;

	return (
		<SectionUI.Wrapper>
			<CompanySelectModal
				companyNameSearch={companyNameSearch}
				searchingCompanyName={loading}
				show={isCompanyListModalOpen}
				companyName={formState?.values?.companyName}
				companyList={companyList}
				panExtractionData={panExtractionRes}
				onClose={() => {
					setIsCompanyListModalOpen(false);
				}}
				onCompanySelect={onCompanySelect}
				formState={formState}
				proceedToNextSection={() => {
					setIsCompanyListModalOpen(false);
				}}
			/>
			<Modal
				show={isPanConfirmModalOpen}
				onClose={() => {
					setIsPanConfirmModalOpen(false);
				}}
				width='30%'
			>
				<section className='p-4 flex flex-col gap-y-8'>
					<UI.ImgClose
						onClick={() => {
							setIsPanConfirmModalOpen(false);
						}}
						src={imgClose}
						alt='close'
					/>
					<UI.ConfirmPanWrapper>
						<h1 style={{ fontSize: '22px', fontWeight: '600Px' }}>
							Confirm PAN Number and Proceed
						</h1>
						<UI.FieldWrapperPanVerify>
							<InputField
								name='panNumber'
								value={panExtractionRes?.panNumber || ''}
								onChange={e => {
									const newPanExtractionData = _.cloneDeep(panExtractionRes);
									newPanExtractionData.panNumber = e.target.value;
									dispatch(setPanExtractionRes(newPanExtractionData));
								}}
								style={{ textAlign: 'center' }}
							/>
						</UI.FieldWrapperPanVerify>
						<Button
							name='Proceed'
							fill
							isLoader={loading}
							onClick={onProceedPanConfirm}
							disabled={loading}
							style={{ alignText: 'center' }}
						/>
					</UI.ConfirmPanWrapper>
				</section>
			</Modal>
			{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<SectionUI.SubSectionHeader>
								{sub_section.name}
							</SectionUI.SubSectionHeader>
						) : null}
						<SectionUI.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								if (field.type === 'file' && field.label.includes('Profile')) {
									return (
										<SectionUI.FieldWrapGrid
											style={{ gridRow: 'span 3', height: '100%' }}
											key={`field-${fieldIndex}-${field.name}`}
										>
											<UI.ProfilePicWrapper>
												<ProfileUpload
													selectedProfileImageUrl={selectedProfileImageUrl}
												/>
											</UI.ProfilePicWrapper>
										</SectionUI.FieldWrapGrid>
									);
								}

								if (field.type === 'file' && field.name === 'pan_upload') {
									let panErrorMessage =
										((formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name]) ||
										'';

									// console.log('pancard-error-msg-', {
									// 	panErrorMessage,
									// });
									const panErrorColorCode = CONST_ADDRESS_PROOF_UPLOAD.getExtractionFlagColorCode(
										panErrorMessage
									);
									panErrorMessage = panErrorMessage.replace(
										CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_FLAG_ERROR,
										''
									);
									panErrorMessage = panErrorMessage.replace(
										CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_FLAG_WARNING,
										''
									);
									panErrorMessage = panErrorMessage.includes(
										CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_FLAG_SUCCESS
									)
										? ''
										: panErrorMessage;
									// console.log('pancard-error-msg-', {
									// 	panErrorColorCode,
									// 	panErrorMessage,
									// });
									return (
										<SectionUI.FieldWrapGrid
											key={`field-${fieldIndex}-${field.name}`}
										>
											<UI.ProfilePicWrapper>
												<PanUpload
													field={field}
													setIsPanConfirmModalOpen={setIsPanConfirmModalOpen}
													setErrorFormStateField={setErrorFormStateField}
													panErrorColorCode={panErrorColorCode}
												/>
												{panErrorMessage && (
													<SectionUI.ErrorMessage colorCode={panErrorColorCode}>
														{panErrorMessage}
													</SectionUI.ErrorMessage>
												)}
											</UI.ProfilePicWrapper>
										</SectionUI.FieldWrapGrid>
									);
								}
								if (!field.visibility || !field.name || !field.type)
									return null;
								const newValue = prefilledValues(field);
								const customFieldProps = {};
								if (!isPanNumberExist) customFieldProps.disabled = true;
								// customFieldProps.disabled = false;
								return (
									<SectionUI.FieldWrapGrid
										key={`field-${fieldIndex}-${field.name}`}
									>
										{register({
											...field,
											value: newValue,
											visibility: 'visible',
											...customFieldProps,
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name] && (
												<SectionUI.ErrorMessage>
													{formState?.error?.[field.name]}
												</SectionUI.ErrorMessage>
											)}
									</SectionUI.FieldWrapGrid>
								);
							})}
						</SectionUI.FormWrapGrid>
					</Fragment>
				);
			})}
			<SectionUI.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading || !isPanNumberExist}
					onClick={handleSubmit(onProceed)}
					// onClick={onProceed}
				/>
			</SectionUI.Footer>
		</SectionUI.Wrapper>
	);
};

export default BasicDetails;
