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
	removeProfilePicCacheDocument,
	// addOrUpdateCacheDocument,
} from 'store/applicationSlice';
import { setProfileGeoLocation } from 'store/directorsSlice';
import iconCameraGrey from 'assets/icons/camera_grey.png';
import iconDelete from 'assets/icons/delete_blue.png';
import imageBgProfile from 'assets/images/bg/profile_image_upload.png';
import {
	UPLOAD_PROFILE_IMAGE,
	// UPLOAD_SELFIE_APPLICANT_COAPPLICANT,
} from '_config/app.config';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import AddressDetailsCard from 'components/AddressDetailsCard/AddressDetailsCard';
import * as CONST from './const';
import { validateFileUpload } from 'utils/helperFunctions';

const ProfileUpload = props => {
	const {
		field,
		value,
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
		// section = 'basicDetails',
		// selectedApplicant,
		setFetchedProfilePic,
		// cacheDocumentsTemp,
		setImageLoading = () => {},
	} = props;
	// console.log('🚀 ~ file: ProfileUpload.js:50 ~ uploadedFile:', uploadedFile);

	const { app, application } = useSelector(state => state);
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const { whiteLabelId, isGeoTaggingEnabled, selectedProduct } = app;
	const {
		loanId,
		// loanRefId,
		businessUserId,
		businessId,
	} = application;
	const [picAddress, setPicAddress] = useState({});
	const [loading, setLoading] = useState(false);
	const [showImageInfo, setShowImageInfo] = useState(false);
	const [selfiePreview, setSelfiePreview] = useState({});
	const [fetchedValue, setFetchedValue] = useState('');

	// if is_file_from_storage_allowed is present in product_details, then take the value which is there(either true or false) or else always set is_file_from_storage_allowed to true
	const isFileFromDeviceStorageAllowed =
		selectedProduct?.product_details?.is_file_from_storage_allowed;

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
	// const deleteDocument = async file => {
	// 	try {
	// 		if (!file?.document_id) return removeCacheDocumentTemp(field.name);
	// 		let endPoint = API.DELETE_DOCUMENT;
	// 		if (section === 'documentUpload') {
	// 			endPoint = API.DELETE_LENDER_DOCUMENT;
	// 		}
	// 		setLoading(true);
	// 		const reqBody = {
	// 			//for profileupload
	// 			loan_doc_id: file?.document_id || '',
	// 			business_id: businessId,

	// 			//for doc upload
	// 			lender_doc_id: file?.document_id || '',
	// 			loan_bank_mapping_id:
	// 				file?.loan_bank_mapping_id || editLoanData?.loan_bank_mapping_id || 1,
	// 			loan_id: loanId,
	// 			user_id: businessUserId,
	// 		};
	// 		await axios.post(endPoint, reqBody);

	// 		removeCacheDocumentTemp(field.name);
	// 		dispatch(removeCacheDocument(file));
	// 		if (isGeoTaggingEnabled) {
	// 			dispatch(removeDocumentSelfieGeoLocation());
	// 		}
	// 	} catch (error) {
	// 		console.error('error-deleteDocument-', error);
	// 		addToast({
	// 			message:
	// 				error?.response?.data?.message ||
	// 				error.message ||
	// 				'Unable to delete file, try after sometime',
	// 			type: 'error',
	// 		});
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// deleting profile pic(basic details)
	const deleteProfilePic = async file => {
		// if the selfie is not saved and proceed, it's not tagged to any document_id, so to remove the profile image from cacheDocuments
		if (!file?.doc_id) return removeCacheDocumentTemp(field?.name);
		try {
			const endPoint = API.DELETE_DOCUMENT;
			setLoading(true);
			const reqBody = {
				loan_doc_id: file?.document_id || file?.doc_id || '',
				business_id: businessId,
				loan_id: loanId,
				userid: businessUserId,
			};
			await axios.post(endPoint, reqBody);
			removeCacheDocumentTemp(field?.name);
			dispatch(removeCacheDocument(file));
			dispatch(removeProfilePicCacheDocument(file));
			// if (isGeoTaggingEnabled && field?.geo_tagging) {
			// 	geoLocationAddress = {};
			// }
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
		// accept: {
		// 	'image/png': ['.png'],
		// 	'image/jpeg': ['.jpeg'],
		// 	'image/jpg': ['.jpg'],
		// },
		accept: {
			'image/jpeg': [],
			'image/png': [],
			'image/jpg': [],
		},

		onDrop: async acceptedFiles => {
			let coordinates = {};
			setLoading(true);
			if (!uploadedFile || !selfiePreview) {
				if (isGeoTaggingEnabled && field?.geo_tagging) {
					try {
						coordinates = await getGeoLocation();
						// coordinates.latitude = 27.71472634829246;
						// coordinates.longitude = 85.28918392103155;
					} catch (err) {
						dispatch(
							setProfileGeoLocation({
								err: 'Geo Location Not Captured',
								hint: CONST.PROFILE_PIC_GEO_ERROR_HINT,
							})
						);
						// }
					}
				}
				try {
					const formData = new FormData();
					// const newFile = {};

					const validatedResp = validateFileUpload(acceptedFiles);
					const finalFilesToUpload = validatedResp
						?.filter(item => item.status !== 'fail')
						.map(fileItem => fileItem.file);

					if (finalFilesToUpload && finalFilesToUpload.length === 0) {
						addToast({
							message: validatedResp[0].error,
							type: 'error',
						});
						return;
					}

					// Basic details Profile Pic Upload section
					setImageLoading(true);
					formData.append('white_label_id', whiteLabelId);
					if (
						isGeoTaggingEnabled &&
						field?.geo_tagging === true &&
						Object.keys(coordinates)?.length > 0
					) {
						formData.append('lat', coordinates?.latitude || null);
						formData.append('long', coordinates?.longitude || null);
					}
					formData.append('document', finalFilesToUpload[0]);

					if (finalFilesToUpload?.length > 0) {
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
						if (isGeoTaggingEnabled && field?.geo_tagging && coordinates) {
							setPicAddress(resp?.data?.file);
						}
						addCacheDocumentTemp(newFile);
					} else {
						addToast({
							message:
								'File format is not supported. Please upload jpg, jpeg or png',
							type: 'error',
						});
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
			}
		},
	});

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				// WHEN ONLY FD KEY IS RECEIVED, NEED TO CALL VIEWDOCUMENT API
				// AND DECRYPT THE RESPONSE TO FETCH PRESIGNED URL
				if (
					// section === 'documentUpload' &&
					uploadedFile &&
					!uploadedFile?.preview &&
					uploadedFile?.filename &&
					Object.keys(uploadedFile)?.length > 0
				) {
					const reqBody = {
						filename:
							uploadedFile?.doc_name ||
							uploadedFile?.document_key ||
							uploadedFile?.fd ||
							uploadedFile?.filename ||
							'',
						loan_id: loanId,
						userid: businessUserId,
					};

					const docRes = await axios.post(API.VIEW_DOCUMENT, reqBody);
					if (docRes?.data?.status === 'ok') {
						const previewFile = decryptViewDocumentUrl(docRes?.data?.signedurl);
						// console.log({ docRes, previewFile });
						setSelfiePreview({
							...uploadedFile,
							preview: previewFile,
							presignedUrl: previewFile,
						});
						setFetchedValue(previewFile);
					}
				}
			} catch (err) {
				console.error(err);
				addToast({
					message: err?.message || 'Network Error',
					type: 'error',
				});
			} finally {
				setLoading(false);
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
	const inputProps = { ...getInputProps() };
	if (
		isFileFromDeviceStorageAllowed !== undefined &&
		!isFileFromDeviceStorageAllowed
	) {
		inputProps.capture = 'camera';
	}

	if (isPreview) {
		return (
			<UI.ContainerPreview isPrevie={isPreview}>
				<UI.ImgProfilePreview
					src={
						loading
							? imageBgProfile
							: // : section === 'documentUpload'
							  // ?
							  uploadedFile?.preview ||
							  uploadedFile?.presignedUrl ||
							  selfiePreview?.preview ||
							  selfiePreview?.presignedUrl ||
							  value ||
							  fetchedValue
						// uploadedFile?.preview || uploadedFile?.presignedUrl || value
					}
					alt='Loading File...'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						if (value) {
							window.open(value, '_blank');
							return;
						}
						if (
							uploadedFile?.preview ||
							selfiePreview?.preview ||
							uploadedFile?.presignedUrl
						) {
							window.open(
								uploadedFile?.preview ||
									selfiePreview?.preview ||
									uploadedFile?.presignedUrl,
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
										dispatch(removeProfilePicCacheDocument(uploadedFile));
										// for profile pic upload in basic details section
										if (value || fetchedValue) {
											setFetchedValue('');
											setFetchedProfilePic();

											onChangeFormStateField({
												name: CONST_BASIC_DETAILS.PROFILE_UPLOAD_FIELD_NAME,
												value: '',
											});
											deleteProfilePic(uploadedFile);
											return;
										}
										// deleteDocument(uploadedFile)
										deleteProfilePic(uploadedFile);
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
								hint={
									picAddress?.hint ||
									uploadedFile?.hint ||
									geoLocationAddress?.hint
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
					{/* <input {...getInputProps()} capture='camera' /> */}
					<input {...inputProps} />
					{!isDisabled && <UI.IconCamera src={iconCameraGrey} alt='camera' />}
				</UI.CameraIconWrapper>
			)}
		</UI.Container>
	);
};

export default ProfileUpload;
