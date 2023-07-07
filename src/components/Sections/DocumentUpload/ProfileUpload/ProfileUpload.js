import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import locationPinIcon from 'assets/icons/Geo_icon_2.png';
import locationPinWhite from 'assets/icons/Geo_icon_1.png';

import LoadingIcon from 'components/Loading/LoadingIcon';
import { getGeoLocation } from 'utils/helper';
import { useToasts } from '../../../Toast/ToastProvider';
import {
	removeCacheDocument,
	addOrUpdateCacheDocument,
} from 'store/applicationSlice';
import {
	setProfileGeoLocation,
	setDocumentSelfieGeoLocation,
	removeDocumentSelfieGeoLocation,
} from 'store/directorsSlice';
import iconCameraGrey from 'assets/icons/camera_grey.png';
import iconDelete from 'assets/icons/delete_blue.png';
import imageBgProfile from 'assets/images/bg/profile_image_upload.png';
import {
	UPLOAD_PROFILE_IMAGE,
	UPLOAD_SELFIE_APPLICANT_COAPPLICANT,
} from '_config/app.config';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import AddressDetailsCard from 'components/AddressDetailsCard/AddressDetailsCard';

const ProfileUpload = props => {
	const {
		field,
		value = '',
		isPanMandatory,
		isPanNumberExist,
		isFormSubmited,
		isProfileMandatory,
		uploadedFile,
		addCacheDocumentTemp,
		removeCacheDocumentTemp,
		onChangeFormStateField,
		isDisabled,
		isTag = false,
		geoLocationAddress = {},
		section = 'basicDetails',
		selectedDirector,
		// selectectedProduct,
		setImageLoading = () => {},
	} = props;
	const { app, application } = useSelector(state => state);
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const {
		editLoanData,
		whiteLabelId,
		isGeoTaggingEnabled,
		selectedProduct,
	} = app;
	const {
		loanId,
		loanRefId,
		businessUserId,
		businessId,
		businessType,
	} = application;
	const [picAddress, setPicAddress] = useState({});
	const [loading, setLoading] = useState(false);
	const [showImageInfo, setShowImageInfo] = useState(false);
	const [selfiePreview, setSelfiePreview] = useState({});
	const isSelectedProductTypeBusiness =
		selectedProduct.isSelectedProductTypeBusiness;
	const openDocument = async file => {
		try {
			setLoading(true);
			const reqBody = {
				filename: file?.doc_name || file?.document_key || file?.fd || '',
			};
			reqBody.loan_id = loanId;
			reqBody.userid = businessUserId;
			// console.log('openDocument-reqBody-', { reqBody, file });
			const docRes = await axios.post(API.VIEW_DOCUMENT, reqBody);
			// console.log('openDocument-res-', docRes);
			window.open(decryptViewDocumentUrl(docRes?.data?.signedurl), '_blank');
		} catch (error) {
			console.error('Unable to open file, try after sometime', error);
			addToast({
				message:
					error?.response?.data?.message ||
					error?.message ||
					'Unable to open file, try after sometime',
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	// CALLED FOR SELFIE DOC UPLOAD
	const deleteDocument = async file => {
		try {
			if (!file?.document_id) return removeCacheDocumentTemp(field.name);
			let endPoint = API.DELETE_DOCUMENT;
			if (section === 'documentUpload') {
				endPoint = API.DELETE_LENDER_DOCUMENT;
			}
			setLoading(true);
			const reqBody = {
				//for profileupload
				loan_doc_id: file?.document_id || '',
				business_id: businessId,

				//for doc upload
				lender_doc_id: file?.document_id || '',
				loan_bank_mapping_id:
					file?.loan_bank_mapping_id || editLoanData?.loan_bank_mapping_id || 1,
				loan_id: loanId,
				user_id: businessUserId,
			};
			await axios.post(endPoint, reqBody);

			removeCacheDocumentTemp(field.name);
			dispatch(removeCacheDocument(file));
			if (isGeoTaggingEnabled) {
				dispatch(removeDocumentSelfieGeoLocation());
			}
		} catch (error) {
			console.error('error-deleteDocument-', error);
			addToast({
				message:
					error?.response?.data?.message ||
					error.message ||
					'Unable to delete file, try after sometime',
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'image/png': ['.png'],
			'image/jpeg': ['.jpeg'],
			'image/jpg': ['.jpg'],
		},
		onDrop: async acceptedFiles => {
			let coordinates = {};
			if (isGeoTaggingEnabled) {
				try {
					coordinates = await getGeoLocation();
				} catch (err) {
					if (section === 'documentUpload') {
						dispatch(
							setDocumentSelfieGeoLocation({ err: 'Geo Location Not Captured' })
						);
					} else {
						dispatch(
							setProfileGeoLocation({ err: 'Geo Location Not Captured' })
						);
					}
				}
			}
			try {
				const formData = new FormData();
				// const newFile = {};
				setLoading(true);

				// profilePicUpload and selfie upload API needs Lat and long, hence call geoLocation API from helper

				// SELFIE DOC UPLOAD SECTION
				if (section === 'documentUpload') {
																						// console.log(isSelectedProductTypeBusiness);
																						// let director = isSelectedProductTypeBusiness?direc:selectedDirector
																						const selectedIncomeType =
																							selectedDirector?.income_type ===
																							0
																								? '0'
																								: selectedDirector?.income_type ||
																								  '';
																						formData.append(
																							'white_label_id',
																							whiteLabelId
																						);
																						if (
																							Object.keys(
																								coordinates
																							)
																								.length >
																								0 &&
																							field?.geo_tagging ===
																								true
																						) {
																							formData.append(
																								'lat',
																								coordinates?.latitude ||
																									null
																							);
																							formData.append(
																								'long',
																								coordinates?.longitude ||
																									null
																							);
																						}
																						formData.append(
																							'timestamp',
																							coordinates?.timestamp ||
																								null
																						);
																						formData.append(
																							'loan_ref_id',
																							loanRefId ||
																								null
																						);
																						formData.append(
																							'loan_id',
																							loanId ||
																								null
																						);
																						formData.append(
																							'user_id',
																							businessUserId ||
																								null
																						);
																						if (
																							isSelectedProductTypeBusiness
																						) {
																							formData.append(
																								'director_id',
																								selectedDirector?.directorId ||
																									'0'
																							);
																							formData.append(
																								'doc_type_id',
																								field
																									?.doc_type?.[
																									businessType
																								] ||
																									null
																							);
																						} else {
																							formData.append(
																								'director_id',
																								selectedDirector?.directorId ||
																									null
																							);
																							formData.append(
																								'doc_type_id',
																								field
																									?.doc_type?.[
																									selectedIncomeType
																								] ||
																									null
																							);
																						}
																						formData.append(
																							'document',
																							acceptedFiles[0]
																						);
																						if (
																							acceptedFiles.length >
																							0
																						) {
																							const resp = await axios.post(
																								UPLOAD_SELFIE_APPLICANT_COAPPLICANT,
																								formData
																							);
																							const newFile = {
																								id:
																									resp
																										?.data
																										?.document_details_data
																										?.doc_id,
																								document_id:
																									resp
																										?.data
																										?.document_details_data
																										?.doc_id,
																								fileId:
																									resp
																										?.data
																										?.document_details_data
																										?.doc_id,
																								doc_type_id:
																									field
																										?.doc_type?.[
																										selectedIncomeType
																									],
																								directorId:
																									selectedDirector.directorId,
																								doc_name:
																									resp
																										?.data
																										?.lender_document_data
																										?.doc_name,
																								document_key:
																									resp
																										?.data
																										?.lender_document_data
																										?.doc_name,
																								loan_bank_mapping_id:
																									resp
																										?.data
																										?.lender_document_data
																										?.loan_bank_mapping ||
																									1,
																								field,
																								...coordinates,
																								preview:
																									field?.geo_tagging ===
																									true
																										? resp
																												?.data
																												?.presignedUrl
																										: resp
																												?.data
																												?.preview,
																								...resp
																									?.data
																									?.uploaded_data,
																							};
																							if (
																								isGeoTaggingEnabled &&
																								coordinates
																							) {
																								setPicAddress(
																									newFile
																								);
																								dispatch(
																									setDocumentSelfieGeoLocation(
																										resp
																											?.data
																											?.uploaded_data
																									)
																								);
																							}
																							// console.log('newfile-', { newFile });
																							dispatch(
																								addOrUpdateCacheDocument(
																									{
																										file: {
																											...newFile,
																										},
																									}
																								)
																							);
																							addCacheDocumentTemp(
																								newFile
																							);
																						} else {
																							addToast(
																								{
																									message:
																										'File format is not supported. Please upload jpg, jpeg or png',
																									type:
																										'error',
																								}
																							);
																						}
																					} else {
					// Basic details Profile Pic Upload section
					setImageLoading(true);
					formData.append('white_label_id', whiteLabelId);
					if (
						Object.keys(coordinates).length > 0 &&
						field?.geo_tagging === true
					) {
						formData.append('lat', coordinates?.latitude || null);
						formData.append('long', coordinates?.longitude || null);
					}
					formData.append('document', acceptedFiles[0]);
					if (acceptedFiles.length > 0) {
						const resp = await axios.post(UPLOAD_PROFILE_IMAGE, formData);
						const newFile = {
							field,
							...resp?.data,
							type: 'profilePic',
							preview:
								field?.geo_tagging === true
									? resp?.data?.presignedUrl
									: resp?.data?.preview,
						};
						if (isGeoTaggingEnabled && coordinates) {
							setPicAddress(resp?.data?.file);
							dispatch(setProfileGeoLocation(resp?.data?.file));
						}
						addCacheDocumentTemp(newFile);
					} else {
						addToast({
							message:
								'File format is not supported. Please upload jpg, jpeg or png',
							type: 'error',
						});
					}
				}
			} catch (error) {
				console.error('error-ProfileFileUpload-onDrop-', error);
				addToast({
					message:
						error?.response?.data?.message ||
						error?.message ||
						'File format is not supported.',
					type: 'error',
				});
			} finally {
				setLoading(false);
				if (setImageLoading) {
					setImageLoading(false);
				}
			}
		},
	});

	useEffect(() => {
		(async () => {
			try {
				// WHEN ONLY FD KEY IS RECEIVED, NEED TO CALL VIEWDOCUMENT API
				// AND DECRYPT THE RESPONSE TO FETCH PRESIGNED URL
				if (
					section === 'documentUpload' &&
					uploadedFile &&
					!uploadedFile?.preview &&
					Object.keys(uploadedFile).length > 0
				) {
					setLoading(true);
					const reqBody = {
						filename:
							uploadedFile.doc_name ||
							uploadedFile?.document_key ||
							uploadedFile?.fd ||
							'',
						loan_id: loanId,
						userid: businessUserId,
					};

					const docRes = await axios.post(API.VIEW_DOCUMENT, reqBody);
					const previewFile = decryptViewDocumentUrl(docRes?.data?.signedurl);

					setSelfiePreview({
						...uploadedFile,
						preview: previewFile,
						presignedUrl: previewFile,
					});
					setLoading(false);
				}
			} catch (err) {
				console.error(err);
				addToast({
					message: err?.message || 'Network Error',
					type: 'error',
				});
			}
		})();

		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () =>
			uploadedFile?.preview && URL.revokeObjectURL(uploadedFile.preview);
		// eslint-disable-next-line
	}, []);

	// Disable click and keydown behavior on the <Dropzone>

	// const isPreview = files.length > 0;
	const isPreview = !!uploadedFile || !!value;

	// console.log('ProfileUpload-', {
	// 	props,
	// 	isPreview,
	// 	uploadedFile,
	// });

	if (isPreview) {
		return (
			<UI.ContainerPreview isPrevie={isPreview}>
				<UI.ImgProfilePreview
					src={
						loading
							? imageBgProfile
							: section === 'documentUpload'
							? uploadedFile?.preview ||
							  uploadedFile?.presignedUrl ||
							  selfiePreview?.preview ||
							  selfiePreview?.presignedUrl
							: uploadedFile?.preview || uploadedFile?.presignedUrl || value
					}
					alt='Loading File...'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						if (value) {
							window.open(value, '_blank');
							return;
						}
						if (uploadedFile?.preview || selfiePreview?.preview) {
							window.open(
								uploadedFile?.preview || selfiePreview?.preview,
								'_blank'
							);
							return;
						}
						openDocument(uploadedFile);
					}}
				/>
				{loading ? (
					<UI.CameraIconWrapper>
						<LoadingIcon />
					</UI.CameraIconWrapper>
				) : (
					<>
						<UI.CameraIconWrapper {...getRootProps({ className: 'dropzone' })}>
							{!isDisabled && (
								<UI.IconCamera
									src={iconDelete}
									alt='delete'
									onClick={e => {
										e.preventDefault();
										e.stopPropagation();
										setShowImageInfo(false);
										// for profile pic upload in basic details section
										if (value) {
											onChangeFormStateField({
												name: CONST_BASIC_DETAILS.PROFILE_UPLOAD_FIELD_NAME,
												value: '',
											});
											return;
										}
										deleteDocument(uploadedFile);
										// setProfileImageResTemp(null);
									}}
								/>
							)}
						</UI.CameraIconWrapper>
						{isGeoTaggingEnabled && isTag && field?.geo_tagging === true && (
							<UI.PinIconWrapper>
								<UI.IconCamera
									onClick={() => {
										setShowImageInfo(!showImageInfo);
									}}
									src={showImageInfo ? locationPinWhite : locationPinIcon}
									alt='pin-location'
								/>
							</UI.PinIconWrapper>
						)}

						{isGeoTaggingEnabled && showImageInfo && (
							<AddressDetailsCard
								imageSrc={locationPinIcon} //change and assign these props once the proper data is obtained
								setShowImageInfo={setShowImageInfo}
								latitude={
									picAddress?.lat ||
									uploadedFile?.lat ||
									geoLocationAddress?.lat
								} //change and assign these props once the proper data is obtained
								longitude={
									picAddress?.long ||
									uploadedFile?.long ||
									geoLocationAddress?.long
								}
								timestamp={
									picAddress?.timestamp ||
									uploadedFile?.timestamp ||
									geoLocationAddress?.timestamp
								}
								embedInImageUpload={true}
								address={
									picAddress?.address ||
									uploadedFile?.address ||
									geoLocationAddress?.address
								}
								err={
									picAddress?.err ||
									uploadedFile?.err ||
									geoLocationAddress?.err
								}
							/>
						)}
					</>
				)}
			</UI.ContainerPreview>
		);
	}

	return (
		<UI.Container isError={isProfileMandatory && isFormSubmited && !isPreview}>
			<UI.ImageBgProfile src={imageBgProfile} alt='upload your profile' />
			{isPanMandatory && !isPanNumberExist ? null : loading ? (
				<UI.CameraIconWrapper>
					<LoadingIcon />
				</UI.CameraIconWrapper>
			) : (
				<UI.CameraIconWrapper {...getRootProps({ className: 'dropzone' })}>
					<input {...getInputProps()} />
					{!isDisabled && <UI.IconCamera src={iconCameraGrey} alt='camera' />}
				</UI.CameraIconWrapper>
			)}
		</UI.Container>
	);
};

export default ProfileUpload;
