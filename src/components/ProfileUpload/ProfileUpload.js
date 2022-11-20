import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import LoadingIcon from 'components/Loading/LoadingIcon';

import { setProfileImageRes } from 'store/applicantCoApplicantsSlice';

import iconCameraBlue from 'assets/icons/camera_blue.png';
import iconCameraGrey from 'assets/icons/camera_grey.png';
import iconDelete from 'assets/icons/delete_blue.png';
import imageBgProfile from 'assets/images/bg/profile_image_upload.png';
import { API_END_POINT } from '_config/app.config';
import * as UI from './ui';

const ProfileUpload = props => {
	const { whiteLabelId } = useSelector(state => state.app);
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedProfileImageUrl, setSelectedProfileImageUrl] = useState(
		props.selectedProfileImageUrl
	);
	const dispatch = useDispatch();

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'image/*': [],
		},
		onDrop: async acceptedFiles => {
			try {
				setLoading(true);
				const formData = new FormData();
				formData.append('white_label_id', whiteLabelId);
				formData.append('document', acceptedFiles[0]);
				const profileRes = await axios.post(
					`${API_END_POINT}/profilePicUpload`,
					formData
				);
				dispatch(setProfileImageRes(profileRes?.data));
				setFiles(
					acceptedFiles.map(file =>
						Object.assign(file, {
							preview: URL.createObjectURL(file),
						})
					)
				);
			} catch (error) {
				console.error('error-ProfileFileUpload-onDrop-', error);
			} finally {
				setLoading(false);
			}
		},
	});

	useEffect(() => {
		setSelectedProfileImageUrl(props.selectedProfileImageUrl);
	}, [props.selectedProfileImageUrl]);

	useEffect(() => {
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => files.forEach(file => URL.revokeObjectURL(file.preview));
		// eslint-disable-next-line
	}, []);

	// Disable click and keydown behavior on the <Dropzone>

	const isPreview = files.length > 0;

	if (isPreview || selectedProfileImageUrl) {
		return (
			<UI.ContainerPreview isPrevie={isPreview}>
				<UI.ImgProfilePreview
					src={files?.[0]?.preview || selectedProfileImageUrl}
					alt='profile'
				/>
				{loading ? (
					<UI.CameraIconWrapper {...getRootProps({ className: 'dropzone' })}>
						<LoadingIcon />
					</UI.CameraIconWrapper>
				) : (
					<UI.CameraIconWrapper {...getRootProps({ className: 'dropzone' })}>
						<UI.IconDelete
							src={iconDelete}
							alt='delete'
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								setFiles([]);
								setSelectedProfileImageUrl('');
							}}
						/>
						<input {...getInputProps()} />
						<UI.IconCamera
							src={iconCameraBlue}
							alt='camera'
							{...getRootProps({ className: 'dropzone' })}
						/>
					</UI.CameraIconWrapper>
				)}
			</UI.ContainerPreview>
		);
	}

	return (
		<UI.Container>
			<UI.ImageBgProfile src={imageBgProfile} alt='upload your profile' />
			{loading ? (
				<UI.CameraIconWrapper {...getRootProps({ className: 'dropzone' })}>
					<LoadingIcon />
				</UI.CameraIconWrapper>
			) : (
				<UI.CameraIconWrapper {...getRootProps({ className: 'dropzone' })}>
					<input {...getInputProps()} />
					<UI.IconCamera src={iconCameraGrey} alt='camera' />
				</UI.CameraIconWrapper>
			)}
		</UI.Container>
	);
};

export default ProfileUpload;
