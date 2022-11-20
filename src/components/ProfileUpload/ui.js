import styled from 'styled-components';

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

export const ContainerPreview = styled.div`
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

export const Container = styled.div`
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

export const IconDelete = styled.img`
	height: 40px;
	width: 40px;
	position: absolute;
	right: 0;
	bottom: 0;
	margin-right: 0;
	margin-bottom: 50px;
	cursor: pointer;
`;

export const CameraIconWrapper = styled.div`
	/* border: 1px solid red; */
	position: absolute;
	right: 0;
	bottom: 0;
	margin-right: 20px;
	margin-bottom: 20px;
	cursor: pointer;
`;

export const IconCamera = styled.img`
	height: 40px;
	width: 40px;
`;

export const ImgProfilePreview = styled.img`
	/* border: 1px solid red; */
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200px;
	width: 200px;
`;

export const ImageBgProfile = styled.img`
	height: 200px;
`;
