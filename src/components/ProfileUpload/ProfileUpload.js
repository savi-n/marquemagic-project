import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

import iconCameraBlue from 'assets/icons/camera_blue.png';
import iconCameraGrey from 'assets/icons/camera_grey.png';
import iconDelete from 'assets/icons/delete_blue.png';
import imageBgProfile from 'assets/images/bg/profile_image_upload.png';

const getColor = props => {
	if (props.isDragAccept) {
		return '#00e676';
	}
	if (props.isDragReject) {
		return '#ff1744';
	}
	if (props.isFocused) {
		return '#2196f3';
	}
	return '#eeeeee';
};

const ContainerPreview = styled.div`
	position: relative;
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	/* padding: 20px; */
	border-width: 2px;
	border-radius: 2px;
	border-color: ${props => getColor(props)};
	border-style: dashed;
	/* background: rgba(0, 0, 0, 0.7);
	background-color: rgba(255, 255, 255, 0.8);
	background-color: #eeeeee; */
	background-color: #dce2f7;
	border: 2px dashed rgba(0, 0, 255, 0.5);
	/* border: 2px dashed black; */
	/* border: dashed #0000ff80; */
	color: #bdbdbd;
	outline: none;
	transition: border 0.24s ease-in-out;
	height: 100%;
`;

const Container = styled.div`
	position: relative;
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	/* padding: 20px; */
	border-width: 2px;
	border-radius: 2px;
	border-color: ${props => getColor(props)};
	border-style: dashed;
	background: '#f5f5f5';
	border: 2px dashed lightgrey;
	color: #bdbdbd;
	outline: none;
	transition: border 0.24s ease-in-out;
	height: 100%;
`;

const IconDelete = styled.img`
	height: 40px;
	width: 40px;
	position: absolute;
	right: 0;
	bottom: 0;
	margin-right: 20px;
	margin-bottom: 70px;
	cursor: pointer;
`;

const IconCamera = styled.img`
	height: 40px;
	width: 40px;
	position: absolute;
	right: 0;
	bottom: 0;
	margin-right: 20px;
	margin-bottom: 20px;
	cursor: pointer;
`;

const ImgProfilePreview = styled.img`
	/* border: 1px solid red; */
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200px;
	width: 200px;
`;

const ImageBgProfile = styled.img`
	height: 200px;
`;

const ProfileUpload = props => {
	const [files, setFiles] = useState([]);
	const { getRootProps } = useDropzone({
		accept: {
			'image/*': [],
		},
		onDrop: acceptedFiles => {
			setFiles(
				acceptedFiles.map(file =>
					Object.assign(file, {
						preview: URL.createObjectURL(file),
					})
				)
			);
		},
	});

	useEffect(() => {
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => files.forEach(file => URL.revokeObjectURL(file.preview));
		// eslint-disable-next-line
	}, []);

	// Disable click and keydown behavior on the <Dropzone>

	const isPreview = files.length > 0;

	if (isPreview) {
		return (
			<ContainerPreview isPrevie={isPreview}>
				<ImgProfilePreview src={files?.[0]?.preview} alt='profile' />
				<IconDelete
					src={iconDelete}
					alt='delete'
					onClick={() => {
						setFiles([]);
					}}
				/>
				<IconCamera
					src={iconCameraBlue}
					alt='camera'
					{...getRootProps({ className: 'dropzone' })}
				/>
			</ContainerPreview>
		);
	}

	return (
		<Container isPrevie={isPreview}>
			<ImageBgProfile src={imageBgProfile} alt='upload your profile' />
			<IconCamera
				src={iconCameraGrey}
				alt='camera'
				{...getRootProps({ className: 'dropzone' })}
			/>
		</Container>
	);
};

export default ProfileUpload;
