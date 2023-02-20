import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import locationPinIcon from 'assets/icons/Geo_icon_2.png';
import LoadingIcon from 'components/Loading/LoadingIcon';
import { getGeoLocation } from 'utils/helper';
// import iconCameraBlue from 'assets/icons/camera_blue.png';
import { useToasts } from '../../../Toast/ToastProvider';
import { removeCacheDocument } from 'store/applicationSlice';
import { setProfileGeoLocation } from 'store/applicantCoApplicantsSlice';
import iconCameraGrey from 'assets/icons/camera_grey.png';
import iconDelete from 'assets/icons/delete_blue.png';
import imageBgProfile from 'assets/images/bg/profile_image_upload.png';
import { UPLOAD_PROFILE_IMAGE } from '_config/app.config';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';
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
	} = props;
	const { app, application } = useSelector(state => state);
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const { whiteLabelId } = app;
	const { loanId, businessUserId, businessId, userId } = application;

	const [picAddress, setPicAddress] = useState({});
	// const {
	// 	isApplicant,
	// 	applicant,
	// 	coApplicants,
	// 	selectedApplicantCoApplicantId,
	// } = applicantCoApplicants;
	// const selectedApplicant = isApplicant
	// 	? applicant
	// 	: coApplicants[selectedApplicantCoApplicantId] || {};
	// const { cacheDocuments } = selectedApplicant;
	// const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showImageInfo, setShowImageInfo] = useState(false);
	// const profileUploadedFile =
	// 	cacheDocumentsTemp?.filter(doc => doc?.field?.name === field.name)?.[0] ||
	// 	cacheDocuments?.filter(doc => doc?.field?.name === field.name)?.[0] ||
	// 	null;

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
			if (!file?.document_id) return removeCacheDocumentTemp(field.name);
			setLoading(true);
			const reqBody = {
				loan_doc_id: file?.document_id || '',
				business_id: businessId,
				loan_id: loanId,
				userid: userId,
			};
			// console.log('reqBody-', reqBody);
			// return;
			await axios.post(API.DELETE_DOCUMENT, reqBody);
			removeCacheDocumentTemp(field.name);
			dispatch(removeCacheDocument(file));
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
				const formData = new FormData();
				setLoading(true);
				// profilePicUpload API needs Lat and long, hence call geoLocation API from helper
				getGeoLocation().then(res => {
					formData.append('white_label_id', whiteLabelId);
					formData.append('lat', res?.latitude || null);
					formData.append('long', res?.longitude || null);
					formData.append('document', acceptedFiles[0]);
					if (acceptedFiles.length > 0) {
						axios.post(UPLOAD_PROFILE_IMAGE, formData).then(resp => {
							const newFile = {
								field,
								...resp?.data,
								preview: resp?.data?.presignedUrl,
							};
							setPicAddress(resp?.data?.file);
							dispatch(setProfileGeoLocation(resp?.data?.file));
							addCacheDocumentTemp(newFile);
						});
					} else {
						addToast({
							message:
								'File format is not supported. Please upload jpg, jpeg or png',
							type: 'error',
						});
					}
				});

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
					src={uploadedFile?.preview || uploadedFile?.presignedUrl || value}
					alt='profile'
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						if (value) {
							window.open(value, '_blank');
							return;
						}
						if (!uploadedFile?.document_id && uploadedFile?.preview) {
							window.open(uploadedFile?.preview, '_blank');
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
