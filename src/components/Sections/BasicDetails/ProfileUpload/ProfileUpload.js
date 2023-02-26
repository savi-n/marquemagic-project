import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import locationPinIcon from 'assets/icons/Geo_icon_2.png';
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
} from 'store/applicantCoApplicantsSlice';
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
		section = 'basicDetails',
		selectedApplicant,
	} = props;
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const { whiteLabelId } = app;
	const {
		loanId,
		loanRefId,
		businessUserId,
		businessId,
		cacheDocuments,
	} = application;

	const [picAddress, setPicAddress] = useState({});
	const {
		isApplicant,
		// applicant,
		// coApplicants,
		// selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	// const selectedApplicant = isApplicant
	// 	? applicant
	// 	: coApplicants[selectedApplicantCoApplicantId] || {};
	// const { cacheDocuments } = selectedApplicant;
	// const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showImageInfo, setShowImageInfo] = useState(false);
	const [selfiePreview, setSelfiePreview] = useState({});
	// const profileUploadedFile =
	// 	cacheDocumentsTemp?.filter(doc => doc?.field?.name === field.name)?.[0] ||
	// 	cacheDocuments?.filter(doc => doc?.field?.name === field.name)?.[0] ||
	// 	null;

	// console.log(uploadedFile, 'uploadedFile');
	const openDocument = async file => {
		try {
			setLoading(true);
			// console.log('open-doc-', { file, loanId, businessUserId });
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
		} finally {
			setLoading(false);
		}
	};

	const deleteDocument = async file => {
		try {
			// console.log('delete file ', file);

			if (!file?.document_id) return removeCacheDocumentTemp(field.name);
			setLoading(true);
			const reqBody = {
				loan_doc_id: file?.document_id || '',
				business_id: businessId,
				loan_id: loanId,
				userid: businessUserId,
			};
			// console.log('reqBody-', reqBody);
			// return;
			await axios.post(API.DELETE_DOCUMENT, reqBody);
			removeCacheDocumentTemp(field.name);
			dispatch(removeCacheDocument(file));
			dispatch(removeDocumentSelfieGeoLocation());
		} catch (error) {
			console.error('error-deleteDocument-', error);
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
			try {
				console.log(props, 'profileUpload Props');
				const formData = new FormData();
				// const newFile = {};
				setLoading(true);

				// const res = await getGeoLocation();
				// formData.append('white_label_id', whiteLabelId);
				// formData.append('lat', res?.latitude || null);
				// formData.append('long', res?.longitude || null);
				// formData.append('document', acceptedFiles[0]);
				// if (acceptedFiles.length > 0) {
				// 	const resp = await axios.post(UPLOAD_PROFILE_IMAGE, formData);
				// 	const newFile = {
				// 		field,
				// 		...resp?.data,
				// 		preview: resp?.data?.presignedUrl,
				// 	};
				// 	setPicAddress(resp?.data?.file);
				// 	dispatch(setProfileGeoLocation(resp?.data?.file));
				// 	addCacheDocumentTemp(newFile);
				// } else {
				// 	addToast({
				// 		message:
				// 			'File format is not supported. Please upload jpg, jpeg or png',
				// 		type: 'error',
				// 	});
				// }

				// profilePicUpload and selfie upload API needs Lat and long, hence call geoLocation API from helper
				const coordinates = await getGeoLocation();

				// Document Upload Selfie Upload section

				if (coordinates && section === 'documentUpload') {
					const selectedIncomeType =
						selectedApplicant?.basic_details?.[
							CONST_BASIC_DETAILS.INCOME_TYPE_FIELD_NAME
						] || selectedApplicant?.income_type;

					formData.append('white_label_id', whiteLabelId);
					formData.append('lat', coordinates?.latitude || null);
					formData.append('long', coordinates?.longitude || null);
					formData.append('timestamp', coordinates?.timestamp || null);
					formData.append('loan_ref_id', loanRefId || null);
					formData.append('loan_id', loanId || null);
					formData.append('director_id', selectedApplicant.directorId);
					formData.append('user_id', businessUserId || null);
					formData.append(
						'doc_type_id',
						field?.doc_type?.[selectedIncomeType] || null
					);
					formData.append('document', acceptedFiles[0]);
					if (acceptedFiles.length > 0) {
						const resp = await axios.post(
							UPLOAD_SELFIE_APPLICANT_COAPPLICANT,
							formData
						);
						const newFile = {
							id: resp?.data?.document_details_data?.doc_id,
							document_id: resp?.data?.document_details_data?.doc_id,
							fileId: resp?.data?.document_details_data?.doc_id,
							doc_type_id: field?.doc_type?.[selectedIncomeType],
							directorId: selectedApplicant.directorId,
							field,
							...coordinates,
							preview: resp?.data?.presignedUrl,
							...resp?.data?.uploaded_data,
						};
						setPicAddress(newFile);
						console.log('--profile upload after ondrop', cacheDocuments);

						dispatch(setDocumentSelfieGeoLocation(resp?.data?.uploaded_data));

						dispatch(
							addOrUpdateCacheDocument({
								file: {
									...newFile,
									directorId: selectedApplicant.directorId,
									doc_type_id: field?.doc_type?.[selectedIncomeType],
								},
							})
						);
						addCacheDocumentTemp(newFile);
					} else {
						addToast({
							message:
								'File format is not supported. Please upload jpg, jpeg or png',
							type: 'error',
						});
					}
				} else {
					// Basic details Profile Pic Upload section
					formData.append('white_label_id', whiteLabelId);
					formData.append('lat', coordinates?.latitude || null);
					formData.append('long', coordinates?.longitude || null);
					formData.append('document', acceptedFiles[0]);
					if (acceptedFiles.length > 0) {
						axios.post(UPLOAD_PROFILE_IMAGE, formData).then(resp => {
							const newFile = {
								field,
								...resp?.data,
								preview: resp?.data?.presignedUrl,
							};
							setPicAddress(resp?.data?.file);
							if (isApplicant) {
								dispatch(setProfileGeoLocation(resp?.data?.file));
							}
							addCacheDocumentTemp(newFile);
						});
					} else {
						addToast({
							message:
								'File format is not supported. Please upload jpg, jpeg or png',
							type: 'error',
						});
					}
				}
				// setProfileImageResTemp(profileRes?.data);
				// setFiles(
				// 	acceptedFiles.map(file =>
				// 		Object.assign(file, {
				// 			preview: URL.createObjectURL(file),
				// 		})
				// 	)
				// );
			} catch (error) {
				console.error('error-ProfileFileUpload-onDrop-', error);
				addToast({
					message: error?.message || 'File format is not supported.',
					type: 'error',
				});
			} finally {
				setLoading(false);
			}
		},
	});

	useEffect(() => {
		(async () => {
			try {
				// console.log(uploadedFile, 'useEffect');
				if (
					section === 'documentUpload' &&
					uploadedFile &&
					!uploadedFile?.preview &&
					Object.keys(uploadedFile).length > 0
				) {
					//
					// console.log(selectedApplicant, '--selecetdapp');
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
					let previewFile = decryptViewDocumentUrl(docRes?.data?.signedurl);
					setSelfiePreview({
						...uploadedFile,
						preview: previewFile,
						presignedUrl: previewFile,
					});
				}
			} catch (err) {
				console.log(err);
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
		// console.log(isPreview);

		// console.log(selfiePreview);
		// console.log(uploadedFile);
		return (
			<UI.ContainerPreview isPrevie={isPreview}>
				<UI.ImgProfilePreview
					src={
						section === 'documentUpload'
							? selfiePreview?.preview ||
							  selfiePreview?.presignedUrl ||
							  uploadedFile?.preview ||
							  uploadedFile?.presignedUrl
							: uploadedFile?.preview || uploadedFile?.presignedUrl || value
					}
					alt='profile'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						if (value) {
							window.open(value, '_blank');
							return;
						}
						if (
							!uploadedFile?.document_id &&
							(uploadedFile?.preview || selfiePreview?.preview)
						) {
							window.open(
								uploadedFile?.preview || selfiePreview?.preview,
								'_blank'
							);
							return;
						}
						openDocument(uploadedFile);
						// window.open('https://www.google.com', '_blank');
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
							{/* TODO: verify requirement and push back re-upload before delete */}
							{/* <UI.IconDelete
							src={iconDelete}
							alt='delete'
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								removeCacheDocumentTemp(field.name);
								// setProfileImageResTemp(null);
							}}
						/>
						<input {...getInputProps()} />
						<UI.IconCamera
							src={iconCameraBlue}
							alt='camera'
							{...getRootProps({ className: 'dropzone' })}
						/> */}
						</UI.CameraIconWrapper>
						{isTag && (
							<UI.PinIconWrapper>
								<UI.IconCamera
									onClick={() => {
										setShowImageInfo(!showImageInfo);
									}}
									src={locationPinIcon}
									alt='pin-location'
								/>
							</UI.PinIconWrapper>
						)}

						{showImageInfo && (
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
