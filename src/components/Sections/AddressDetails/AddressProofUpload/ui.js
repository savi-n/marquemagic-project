import styled from 'styled-components';

export const Wrapper = styled.div``;

export const DropZoneOtpFieldWrapper = styled.div`
	display: grid;
	grid-gap: 25px 50px;
	grid-template-columns: repeat(2, 1fr);
	grid-auto-flow: dense;
	position: relative;
	@media (max-width: 700px) {
		grid-template-columns: repeat(1, 1fr);
	}
`;
export const GreenTickImage = styled.img`
	height: 20px;
	z-index: 100;
	position: absolute;
	right: 200px;
	@media (max-width: 768px) {
		right: 50px;
		margin-top: 15px;
	}
`;
export const HintWrapper = styled.div`
	margin-bottom: 10px;
	margin-top: -25px;
`;
export const AadhaarNumberOtpFieldWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
	@media (max-width: 700px) {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 20px;
		margin-top: 20px;
		button {
			width: 100% !important;
		}
	}
`;

export const OR = styled.div`
	/* border: 1px solid red; */
	z-index: 0;
	position: absolute;
	width: 100%;
	text-align: center;
	height: 50px;
	line-height: 50px;
	@media (max-width: 700px) {
		margin-top: 50px;
	}
`;

export const Dropzone = styled.div`
z-index: 1;
height: 50px;
position: relative;
display: flex;
align-items: center;
background: ${({ theme, bg }) => bg ?? theme.upload_background_color};
gap: 15px;
border: dashed #0000ff80;
border-radius: 10px;
border-width: 2px;
overflow: hidden;
@media (max-width: 700px) {
  width: 100%;
}

${({ isInActive }) =>
	isInActive &&
	`border: dashed grey 2px;
      background-color: #EEEEEE;
      cursor: not-allowed;`}

${({ dragging }) =>
	dragging &&
	`border: dashed grey 2px;
      background-color: rgba(255,255,255,.8);`}
${({ uploading }) =>
	uploading &&
	`
    pointer-events: none;
  `}

&::after {
  ${({ uploading }) =>
		uploading &&
		`
      content:'Uploading...';
			font-size: 14px;
    `}
  inset: 0 0 0 0;
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  font-weight: 500;
  color: white;
  z-index: 999;
  pointer-events: none;
}
@media (max-width: 700px) {
  min-width: 72vw;
  overflow: visible;
}
`;

export const Caption = styled.p`
	font-size: 15px;
	font-weight: 400;
	margin-left: 20px;
`;

export const AcceptFilesTypes = styled.span`
	font-size: 12px;
	color: red;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const UploadButton = styled.input`
	display: none;
	width: 100px;
	text-align: center;
	border-radius: 10px;
`;

export const Label = styled.label`
	padding: 10px 15px;
	color: #323232;
	font-size: 15px;
	cursor: pointer;
	background: transparent;
	border-radius: 5px;
	border: ${({ theme, bg }) => bg ?? theme.upload_button_color} solid 1px;
	width: 100px;
	text-align: center;
	border-radius: 10px;
`;

export const Droping = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255);
	font-size: 20px;
	z-index: 9999;
`;

export const UnTaggedFileListWrap = styled.div`
	display: flex;
	flex-direction: column;
	align-items: start;
	gap: 20px;
	flex-wrap: wrap;
	margin: 10px;
	display: -webkit-box;
	@media (max-width: 700px) {
		width: 72vw;
	}
`;

export const WarningMessage = styled.div`
	background: #e6ffef;
	border-radius: 10px;
	border: 2px solid #4cc97f;
	display: flex;
	margin: 20px 5px 5px 5px;
	width: fit-content;
	padding: 5px 10px 5px 10px;
	font-size: 14px;
	@media (max-width: 700px) {
		width: 72vw;
	}
`;

export const AddressProofErrorMessage = styled.div`
	margin-top: 40px;
	color: #de524c;
	display: flex;
	gap: 10px;
	align-items: center;
	${({ addressProofErrorColorCode }) =>
		addressProofErrorColorCode && `color: ${addressProofErrorColorCode};`}
`;

export const ImgErrorIcon = styled.img`
	height: 20px;
`;

export const File = styled.div`
	width: 32%;
	position: relative;
	background: transparent;
	border-radius: 5px;
	height: 40px;
	line-height: 40px;
	margin: 10px -5px;
	display: flex;
	border: dashed 2px rgba(76, 201, 127, 0.6);
	${({ addressProofErrorColorCode }) =>
		addressProofErrorColorCode &&
		`border: dashed ${addressProofErrorColorCode} 2px;
      background-color: rgba(255,255,255,.8);`}

	border-radius: 10px;
	border-width: 2px;
	align-items: center;
	justify-content: space-between;
	transition: 0.2s;
	@media (max-width: 700px) {
		width: 100%;
	}
	&::after {
		content: '';
		bottom: 0;
		left: 0;
		position: absolute;
		width: ${({ progress }) => `${progress >= 100 ? 0 : progress}%`};
		height: 2px;
		background: ${({ theme, status }) => {
			if (['error', 'cancelled'].includes(status)) return '#ff0000';
			return theme.buttonColor2 || 'blue';
		}};
	}
`;

export const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: 10px;
`;

export const PasswordWrapper = styled.div`
	position: relative;
	margin-left: auto;
	/* margin-right: 10px; */
`;

export const RoundButton = styled.div`
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;

	${({ showTooltip, isViewLoan, password }) =>
		showTooltip &&
		`&:hover {
    &::before {
      content: "${
				isViewLoan && password
					? password
					: 'If the document is password protected, please help us with the Password.'
			}";
      font-size: 13px;
      line-height: 20px;
      position: absolute;
      color: white;
      padding: 10px;
      bottom: 105%;
      width: 200px;
      background: black;
      z-index: 999;
      margin-bottom: 10px;
      border-radius: 10px;
      text-align: center;
      /* clip-path: path("M 0 200 L 0,75 A 5,5 0,0,1 150,75 L 200 200 z"); */
    }

    &::after {
      content: "";
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid black;
      position: absolute;
      bottom: 105%;
    }
}`}
`;

export const FileName = styled.span`
	font-size: 14px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	padding-left: 15px;
	&:hover {
		color: ${({ link }) => (link ? '#2a2add' : 'black')};
	}
`;
export const IconWrapper = styled.div`
	display: flex;
	margin-left: auto;
	margin-right: 15px;
	gap: 10px;
`;
export const IconUpload = styled.label`
	cursor: pointer;
`;
export const IconCollapse = styled.img`
	cursor: pointer;
	transform: ${({ isDocumentTaggingOpen }) =>
		isDocumentTaggingOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

export const FileType = styled.div`
	position: absolute;
	right: 0;
	margin-right: -2px;
	background: #e6ffef;
	height: inherit;
	width: 50px;
	border-radius: 0 10px 10px 0;
	border: 2px solid #4cc97f;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
`;

export const FileTypeIconOutsidePopover = styled.img`
	height: 25px;
`;

export const FileTypeIconInsidePopover = styled.img`
	height: 25px;
	background-color: white;
`;

export const FileTypeSmallIcon = styled.img`
	height: 20px;
	align-self: center;
	padding-left: 2px;
	padding-right: 2px;
`;

export const FileTypeBox = styled.ul`
	width: 400px;
	display: flex;
	padding: 0 15px;
	background: white;
	border: #f8f8f8;
	border-radius: 10px;
	border: 1px solid #4cc97f;
	max-height: 300px;
	overflow: auto;
	box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
		rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
	img {
		position: absolute;
		right: 0;
		margin-right: 20px;
		margin-top: 15px;
		transform: rotate(90deg);
		cursor: pointer;
	}
	@media (max-width: 700px) {
		max-width: 270px;
	}
`;

export const FileTypeUL = styled.ul`
	margin: 0 20px;
	padding: 10px 0px;
	li:last-of-type {
		border-bottom: none;
	}
	@media (max-width: 700px) {
		padding: 40px 0;
	}
`;

export const FileTypeList = styled.li`
	padding: 10px 0;
	font-size: 14px;
	min-width: 280px;
	border-bottom: 1px solid lightgrey;
	:hover {
		cursor: pointer;
		color: #4cc97f;
	}
`;

export const DocumentUploadListWrapper = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	margin: 30px 0;
	gap: 10px;
	@media (max-width: 700px) {
		padding: 0px;
		gap: 0px;
		margin: 0px;
		width: 72vw;
	}
`;

export const DocumentUploadList = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: left;
	flex-direction: column;
	width: 32%;
	margin: 10px 0;
	align-items: center;
	@media (max-width: 700px) {
		width: 100%;
	}
`;

export const DocumentUploadListRow1 = styled.div`
	display: flex;
	justify-content: left;
	width: 100%;
	align-items: center;
`;

export const DocumentUploadCheck = styled.img`
	height: 28px;
`;

export const DocumentUploadListRow2 = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	text-align: left;
	padding: 10px 0;
	flex-wrap: wrap;
	gap: 10px;
`;

export const DocumentUploadName = styled.div`
	width: 100%;
	font-size: 14px;
	color: ${({ isSelected }) => (isSelected ? 'black' : 'grey')};
	padding: 0 20px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	@media (max-width: 700px) {
		overflow: visible;
		white-space: normal;
		text-overflow: unset;
	}
`;
export const DocumentUploadNameToolTip = styled.div`
	position: absolute;
	font-size: 12px;
	margin-top: -50px;
	margin-left: 30px;
	background: black;
	color: white;
	padding: 5px;
`;

export const CTAWrapper = styled.div`
	margin: 30px 0 0 0;
	@media (max-width: 768px) {
		margin: 82px 0 0 0;
	}
`;

export const DocumentTaggingSectionWrapper = styled.div`
	overflow: hidden;
	transition: all 0.3s ease-in-out;
	height: ${({ isDocumentTaggingOpen, isFetchAddressButton }) =>
		isDocumentTaggingOpen && isFetchAddressButton
			? '238px'
			: isDocumentTaggingOpen && !isFetchAddressButton
			? '250px'
			: '0'};
	@media (max-width: 768px) {
		height: ${({ isDocumentTaggingOpen }) =>
			isDocumentTaggingOpen ? '400px' : '0'};
	}
`;

export const DocTypeChangeModalBody = styled.div`
	text-align: center;
	padding: 20px;
`;

export const DocTypeChangeModalHeader = styled.div`
	/* text-align: left; */
`;
export const DocTypeChangeModalFooter = styled.div`
	margin-top: 30px;
	display: flex;
	justify-content: center;
	gap: 20px;
`;
