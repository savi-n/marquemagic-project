import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faUpload,
	faUnlockAlt,
	faLock,
	faUserLock,
} from '@fortawesome/free-solid-svg-icons';
import { Popover, ArrowContainer } from 'react-tiny-popover';

import useFetch from '../../../hooks/useFetch';
import { useToasts } from 'components/Toast/ToastProvider';
import generateUID from '../../../utils/uid';
import { NC_STATUS_CODE } from '../../../_config/app.config';
import FilePasswordInput from './FilePasswordInput';
import uploadIcon from '../../../assets/icons/upload_icon.png';
import uploadCircleIcon from '../../../assets/icons/upload-icon-with-circle.png';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import imgArrowDownCircle from 'assets/icons/drop_down_green-05.svg';
import downArray from 'assets/icons/down_arrow_grey_icon.png';
import imgGreyCheck from 'assets/icons/grey_tick_icon.png';
import imgGreenCheck from 'assets/icons/green_tick_icon.png';
import imgUpload from 'assets/icons/upload_icon.png';
import lockGrey from 'assets/icons/Lock_icon_grey-05-05.svg';
import lockGreen from 'assets/icons/Lock_icon_green-05.svg';
import _ from 'lodash';
import { asyncForEach, sleep } from 'utils/helper';

const USER_CANCELED = 'user cancelled';

const FINANCIAL_DOC_TYPES = ['Financial', 'Financial Documents'].map(
	fileTypes => fileTypes.toLowerCase()
);

const Dropzone = styled.div`
	width: ${({ width }) => width};
	min-height: 100px;
	position: relative;
	display: flex;
	align-items: center;
	/* justify-content: center; */
	background: ${({ theme, bg }) => bg ?? theme.upload_background_color};
	gap: 15px;
	border: dashed #0000ff80;
	border-radius: 10px;
	border-width: 2px;
	overflow: hidden;
	@media (max-width: 700px) {
		width: 100%;
	}
	/* border-width: medium; */
	/* border-color: 'blue'; */
	/* background-color: '#F0F4FE'; */
	${({ dragging }) =>
		dragging &&
		`border: dashed grey 2px;
        background-color: rgba(255,255,255,.8);
        z-index: 9999;`}

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

const Caption = styled.p`
	font-size: 15px;
	font-weight: 400;
	margin-left: 20px;
`;

const AcceptFilesTypes = styled.span`
	font-size: 12px;
	color: red;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const UploadButton = styled.input`
	display: none;
	width: 100px;
	text-align: center;
	border-radius: 10px;
`;

const Label = styled.label`
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

const LabelFormat = styled.label`
	padding: 10px 15px;
	color: #323232;
	font-size: 12px;
	background: transparent;
	border: dashed #0000ff80;
	border-radius: 10px;
	border-width: 2px;
	/* border-spacing: 1cm 2em; */
`;

const Droping = styled.div`
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

const FileListWrap = styled.div`
	display: flex;
	flex-direction: column;
	align-items: start;
	gap: 20px;
	/* gap: calc(10% / 3); */
	/* justify-content: space-between; */
	flex-wrap: wrap;
	margin: 10px;
	display: -webkit-box;
	@media (max-width: 700px) {
		width: 72vw;
	}
`;

const WarningMessage = styled.div`
	background: #e6ffef;
	height: inherit;
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
const File = styled.div`
	/* flex-basis: 30%; */
	width: 32%;
	position: relative;
	/* overflow: hidden; */
	/* padding: 5px 15px; */
	background: transparent;
	border-radius: 5px;
	height: 40px;
	line-height: 40px;
	margin: 10px -5px;
	display: flex;
	/* border: ${({ theme, bg }) => bg ?? theme.upload_button_color} solid 1px; */
	/* border: dashed #4cc97f; */
	border:  dashed ${({ error }) => (error ? 'red' : `rgba(76, 201, 127, 0.6)`)};
	border-radius: 10px;
	border-width: 2px;
	align-items: center;
	justify-content: space-between;
	transition: 0.2s;
@media (max-width: 700px){
	width:100%;

}
	&::after {
		content: '';
		bottom: 0;
		left: 0;
		position: absolute;
		/* width: ${({ progress }) => `${progress >= 100 ? 0 : progress}%`}; */
		width: ${({ progress }) => `${progress >= 100 ? 0 : progress}%`};
		height: 2px;
		background: ${({ theme, status }) => {
			if (['error', 'cancelled'].includes(status)) return '#ff0000';
			return theme.buttonColor2 || 'blue';
		}};
	}
`;

const ImgClose = styled.img`
	height: 25px;
	cursor: pointer;
	margin-left: auto;
	margin-right: 10px;
`;

const PasswordWrapper = styled.div`
	position: relative;
	margin-left: auto;
	/* margin-right: 10px; */
`;

const RoundButton = styled.div`
	/* padding: 10px; */
	/* background: white; */
	/* border-radius: 50%; */
	cursor: pointer;
	/* width: 30px; */
	/* height: 30px; */
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;

	${({ showTooltip }) =>
		showTooltip &&
		`&:hover {
      &::before {
        content: "If the document is password protected, please help us with the Password.";
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

const SelectDocType = styled.select`
	height: 40px;
	padding: 10px;
	width: 40%;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 6px;
	color: black;
	outline: none;
`;

const FileName = styled.span`
	/* width: 50%; */
	font-size: 14px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	padding-left: 15px;
`;

const CancelBtn = styled.span`
	border: ${({ theme, bg }) => bg ?? theme.upload_button_color} solid 1px;
	color: ${({ theme, bg }) => bg ?? theme.upload_button_color};
	font-weight: 100;
	border-radius: 50%;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
`;

const UploadCircle = styled.label`
	/* align-self: flex-end; */
	cursor: pointer;
	margin-right: 10px;
`;

const FileType = styled.div`
	background: #e6ffef;
	/* height: 100%; */
	height: inherit;
	width: 50px;
	border-radius: 0 10px 10px 0;
	border: 2px solid #4cc97f;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
`;

const FileTypeIcon = styled.img`
	height: 25px;
`;

const FileTypeSmallIcon = styled.img`
	height: 20px;
	align-self: center;
	padding-left: 2px;
	padding-right: 2px;
`;
/* margin-left: ${({ isOutside }) => (isOutside < 0 ? isOutside - 50 : 0)}px; */
// margin-left: ${({ isOutside }) => (isOutside < 0 ? '-300px' : '0')}px;
const FileTypeBox = styled.ul`
	/* position: absolute; */
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
		margin-top: 15px;
		/* transform: rotate(270deg); */
		transform: rotate(90deg);
		cursor: pointer;
	}
	@media (max-width: 700px) {
		max-width: 270px;
	}
`;
const FileTypeUL = styled.ul`
	margin: 0 20px;
`;

const FileTypeList = styled.li`
	padding: 10px 0;
	font-size: 14px;
	border-bottom: 1px solid lightgrey;
	:hover {
		cursor: pointer;
		color: #4cc97f;
	}
`;

const DocumentUploadListWrapper = styled.div`
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

const DocumentUploadList = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: left;
	flex-direction: column;

	/* align-self: flex-start; */
	/* flex: 30%; */
	width: 32%;
	margin: 10px 0;
	/* border: dashed lightblue; */
	/* border-radius: 10px; */
	/* border-width: 2px; */
	align-items: center;
	/* padding: 10px 20px; */
	/* background: white; */
	@media (max-width: 700px) {
		width: 100%;
	}
`;

const DocumentUploadListRow1 = styled.div`
	display: flex;
	justify-content: left;
	width: 100%;
	align-items: center;
	/* padding: 10px 0; */
`;

const DocumentUploadCheck = styled.img`
	height: 28px;
`;

const DocumentUploadIcon = styled.img`
	height: 18px;
	cursor: pointer;
`;

const DocumentUploadListRow2 = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	text-align: left;
	padding: 10px 0;
	flex-wrap: wrap;
	gap: 10px;
`;

const DocumentUploadedBadge = styled.div`
	border: 1px solid green;
	display: flex;
	padding: 5px 10px;
	border-radius: 10px;
	font-size: 12px;
`;

const DocumentUploadedBadge2 = styled.div`
	display: flex;
	margin: 0;
	align-items: center;
	justify-content: space-between;
	font-size: 12px;
	background: #ccc;
	h4 {
		padding: 0 6px;
	}
	div {
		padding: 0 10px;
		height: 100%;
		background: darkgrey;
		display: flex;
		align-items: center;
		text-align: center;
		font-weight: bold;
		cursor: pointer;
		color: white;
	}
`;

const DocumentUploadName = styled.div`
	width: 100%;
	font-size: 14px;
	color: ${({ isSelected }) => (isSelected ? 'black' : 'grey')};
	padding: 0 20px;
	/* width: 300px; */
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	@media (max-width: 700px) {
		overflow: visible;
		white-space: normal;
		text-overflow: unset;
	}
`;
const DocumentUploadNameToolTip = styled.div`
	position: absolute;
	font-size: 12px;
	margin-top: -50px;
	margin-left: 30px;
	background: black;
	color: white;
	padding: 5px;
`;
export default function FileUpload({
	onDrop,
	accept = '',
	caption,
	bg,
	disabled = false,
	upload = null,
	onRemoveFile = id => {
		console.log('REMOVED FILE ' + id);
	},
	docTypeOptions = [],
	documentTypeChangeCallback = (id, value) => {
		console.log('DOCUMENT TYPE CHANGED ' + id);
	},
	changeHandler,
	branch,
	docs,
	setDocs,
	docsPush,
	loan_id,
	directorId,
	pan,
	section = '',
	sectionType = 'others',
	aadharVoterDl = false,
	errorMessage = '',
	prefilledDocs = [],
	startingKYCDoc = [],
}) {
	// console.log('fileupload-props', { accept, disabled, pan, docs, setDocs });
	const ref = useRef(uuidv4());
	const refPopup = useRef(null);
	const { addToast } = useToasts();

	const id = uuidv4();

	const [loading, setLoading] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadingFiles, setUploadingFiles] = useState([]);
	const [passwordForFileId, setPasswordForFileId] = useState(null);

	const [docTypeFileMap, setDocTypeFileMap] = useState({});
	const [isPopoverOpen, setIsPopoverOpen] = useState(-1);
	const [viewMore, setViewMore] = useState([]);
	const [passwordList, setPasswordList] = useState([]);
	const [mappedFiles, setMappedFiles] = useState({});

	const selectedFiles = useRef([]);
	const uploadingProgressFiles = useRef([]);
	const { newRequest } = useFetch();
	const [docSelected, setDocSelected] = useState('');
	const [docTypeNameToolTip, setDocTypeNameToolTip] = useState(-1);

	let refCounter = 0;

	const onCancel = (file, status) => {
		const uploadFiles = uploadingProgressFiles.current.map(uFile => {
			if (uFile.id === file.id) {
				return {
					...uFile,
					status,
				};
			}

			return uFile;
		});
		uploadingProgressFiles.current = uploadFiles;
		setUploadingFiles(uploadFiles);
	};

	const onFileRemove = (file, docType = false) => {
		!aadharVoterDl && setDocs && setDocs([]);
		const uploadFiles = uploadingProgressFiles.current.filter(
			uFile => uFile.id !== file.id
		);
		uploadingProgressFiles.current = uploadFiles;
		if (docType) {
			const newMappedFile = _.cloneDeep(mappedFiles);
			const newObj = [];
			newMappedFile[docType.value]?.map(uFile => {
				if (uFile.id !== file.id) newObj.push(uFile);
			});
			newMappedFile[docType.value] = newObj;
			setMappedFiles(newMappedFile);
		}
		onRemoveFile(file.id);
		setUploadingFiles(uploadFiles);
	};

	const onProgress = (event, file) => {
		if (!uploadingProgressFiles.current.length) {
			return;
		}

		const uploadFiles = uploadingProgressFiles.current.map(uFile => {
			if (uFile.id === file.id) {
				const percentageCompleted = (
					(event.loaded / event.total) *
					100
				).toFixed();

				return {
					...uFile,
					progress: percentageCompleted,
				};
				// status:
				//     Number(percentageCompleted) === 100 ? "completed" : "progress",
			}

			return uFile;
		});
		uploadingProgressFiles.current = uploadFiles;
		setUploadingFiles(_.cloneDeep(uploadFiles));
	};

	const handleUpload = async files => {
		let filesToUpload = [];
		for (let i = 0; i < files.length; i++) {
			const source = axios.CancelToken.source();

			const id = generateUID();

			filesToUpload.push({
				id,
				name: files[i].name,
				file: files[i],
				progress: 0,
				status: 'progress',
				cancelToken: source,
			});
		}

		uploadingProgressFiles.current = [
			..._.cloneDeep(uploadingProgressFiles.current),
			...filesToUpload,
		];

		setUploading(true);
		setUploadingFiles(_.cloneDeep(uploadingProgressFiles.current));

		return await Promise.all(
			filesToUpload.map(file => {
				if (!pan) {
					const formData = new FormData();
					formData.append('document', file.file);

					return newRequest(
						upload.url,
						{
							method: 'POST',
							data: formData,
							onUploadProgress: event => onProgress(event, file),
							cancelToken: file.cancelToken.token,
						},
						upload.header ?? {}
					)
						.then(res => {
							if (res.data.status === NC_STATUS_CODE.OK) {
								const resFile = res.data.files[0];
								const uploadfile = {
									id: file.id,
									upload_doc_name: resFile.filename,
									document_key: resFile.fd,
									size: resFile.size,
								};

								if (docsPush) {
									uploadfile['loan_id'] = loan_id;
									uploadfile['directorId'] = directorId;
									setDocs([...docs, uploadfile]);
								}

								return uploadfile;
							}
							// return res.data.files[0];
							return { ...file, status: 'error' };
						})
						.catch(err => {
							console.log(err);
							if (err.message === USER_CANCELED) {
								onCancel(file, 'cancelled');
							} else {
								onCancel(file, 'error');
							}
							return { ...file, status: 'error', error: err };
						});
				}
			})
		).then(files => {
			setUploading(false);
			if (pan) {
				aadharVoterDl
					? setDocs([...docs, filesToUpload[0]])
					: setDocs([filesToUpload[0]]);
				return [filesToUpload[0]];
			}
			uploadingProgressFiles.current = uploadingProgressFiles.current.map(
				files => ({
					...files,
					status: 'completed',
				})
			);

			setUploadingFiles(_.cloneDeep(uploadingProgressFiles.current));
			return files.filter(file => file.status !== 'error');
		});
	};

	const handleDrag = e => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragIn = e => {
		e.preventDefault();
		e.stopPropagation();
		++refCounter;

		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setDragging(true);
		}
	};

	const handleDragOut = e => {
		e.preventDefault();
		e.stopPropagation();
		--refCounter;

		if (!refCounter) setDragging(false);
	};

	const handleDrop = async event => {
		event.preventDefault();
		event.stopPropagation();
		setDragging(false);
		if (pan && disabled) {
			addToast({
				message: `Only one document is allowed for pan card.!`,
				type: 'error',
			});
			return false;
		}
		if (pan && event.dataTransfer.files.length > 1) {
			addToast({
				message: `Only one document is allowed to upload at one time!`,
				type: 'error',
			});
			return false;
		}
		if (disabled) return false;

		let files = [...event.dataTransfer.files];
		if (accept) {
			files = files.filter(file => accept.includes(file.type.split('/')[1]));
		}

		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			if (upload) {
				files = await handleUpload(files);
			}
			onDrop(files);

			files = [...selectedFiles.current, ...files];
			selectedFiles.current = files;

			event.dataTransfer.clearData();
			refCounter = 0;
		}
	};

	const onChange = async event => {
		let files = [...event.target.files];
		if (upload) {
			files = await handleUpload(files);
		}
		onDrop(files);

		selectedFiles.current = [...selectedFiles.current, ...event.target.files];
	};

	// const onDocTypeChange = (fileId, value, file) => {
	const onDocTypeChange = (file, docType) => {
		const selectedDocType = docTypeOptions.find(d => d.value === docType.value);
		// console.log('onDocTypeChange-selected-doctype-', {
		// 	file,
		// 	docType,
		// 	selectedDocType,
		// });
		const newMappedFile = _.cloneDeep(mappedFiles);
		const newObj = newMappedFile[docType.value] || [];
		newObj.push(file);
		newMappedFile[docType.value] = newObj;
		setMappedFiles(newMappedFile);
		const newDocTypeFileMap = {
			..._.cloneDeep(docTypeFileMap),
			[file.id]: selectedDocType, // value
		};
		documentTypeChangeCallback(file.id, selectedDocType);
		setDocTypeFileMap(newDocTypeFileMap);
		// console.log('onDocTypeChange-eod-', { newMappedFile, newDocTypeFileMap });
	};

	const onPasswordClick = fileId => {
		setPasswordForFileId(fileId);
	};

	const onClosePasswordEnterArea = () => {
		setPasswordForFileId(null);
	};

	const onDocTypePassword = (fileId, value, uniqPassId, docType) => {
		if (value) {
			const selectedDocType = docTypeOptions.find(
				d => d.value === docType.value
			);
			passwordList.push(uniqPassId);
			const newFile = {
				...selectedDocType,
				password: value,
			};
			// console.log('onDocTypePassword-', fileId, newFile);
			documentTypeChangeCallback(fileId, newFile);
		}
		onClosePasswordEnterArea();
	};

	let taggedDocumentCount = 0;
	let displayTagMessage = 0;

	if (!pan) {
		uploadingFiles.map(file => {
			for (const key in docTypeFileMap) {
				if (file.id === key) {
					taggedDocumentCount += 1;
				}
			}
		});
		displayTagMessage = uploadingFiles.length !== taggedDocumentCount;
	}

	const initializeComponent = async () => {
		try {
			setLoading(true);
			if (prefilledDocs && prefilledDocs?.length > 0) {
				// setUploadingFiles(_.cloneDeep(prefilledDocs));
				setDocTypeFileMap(_.cloneDeep(prefilledDocs));
				const newMappedFile = _.cloneDeep(mappedFiles);
				const newDocTypeFileMap = {
					..._.cloneDeep(docTypeFileMap),
				};
				prefilledDocs.map(doc => {
					const tempFile = _.cloneDeep(doc);
					const tempDocType = { value: doc.doctype };
					const selectedDocType = docTypeOptions.find(
						d => d.value === tempDocType.value
					);
					const newObj = newMappedFile[tempDocType.value] || [];
					newObj.push(tempFile);
					newMappedFile[tempDocType.value] = newObj;
					newDocTypeFileMap[tempDocType.id] = selectedDocType;
					documentTypeChangeCallback(tempFile.id, selectedDocType);
					return null;
				});
				setDocTypeFileMap(newDocTypeFileMap);
				setMappedFiles(newMappedFile);
			}
			setLoading(false);
		} catch (err) {
			setLoading(false);
			console.log('error-initializnig-fileupload-', err);
		}
	};

	useEffect(() => {
		initializeComponent();
		if (startingKYCDoc && startingKYCDoc.length > 0) {
			const newMappedFileKYC = _.cloneDeep(mappedFiles);
			startingKYCDoc.map(doc => {
				let newObj = newMappedFileKYC[+doc.typeId] || [];
				newObj.push(doc);
				newMappedFileKYC[+doc.typeId] = newObj;
			});
			console.log('new mapped is what -', newMappedFileKYC);
			setMappedFiles(newMappedFileKYC);
		}
	}, []);

	useEffect(() => {
		let div = ref?.current;
		div?.addEventListener('dragenter', handleDragIn);
		div?.addEventListener('dragleave', handleDragOut);
		div?.addEventListener('dragover', handleDrag);
		div?.addEventListener('drop', handleDrop);
		div?.addEventListener('dragend', handleDrag);

		return () => {
			div?.removeEventListener('dragenter', handleDragIn);
			div?.removeEventListener('dragleave', handleDragOut);
			div?.removeEventListener('dragover', handleDrag);
			div?.removeEventListener('drop', handleDrop);
			div?.removeEventListener('dragend', handleDrag);
		};
	}, [disabled]);

	return loading ? (
		<>
			<h1>Loading...</h1>
		</>
	) : (
		<>
			{!disabled && (
				<Dropzone
					ref={ref}
					dragging={dragging}
					// bg={bg}
					disabled={disabled}
					uploading={uploading}>
					{dragging && !disabled && <Droping>Drop here :)</Droping>}
					<Caption>
						{caption || `Drag and drop or`}{' '}
						{accept && <AcceptFilesTypes>{accept}</AcceptFilesTypes>}
					</Caption>
					<UploadButton
						type='file'
						id={id}
						onChange={onChange}
						onClick={e => {
							e.target.value = '';
						}}
						accept={accept}
						disabled={disabled}
						multiple={section === 'document-upload' ? true : false}
					/>
					<Label htmlFor={id}>Browse</Label>
					{/* {pan && <LabelFormat>only jpeg, png, jpg</LabelFormat>} */}
					<UploadCircle
						htmlFor={id}
						style={{ marginLeft: 'auto', padding: 10 }}>
						<img
							src={uploadCircleIcon}
							width={40}
							style={{ maxWidth: 'none' }}
							alt='upload'
						/>
					</UploadCircle>
				</Dropzone>
			)}
			{displayTagMessage ? (
				<WarningMessage>
					{' '}
					Click on <FileTypeSmallIcon
						src={imgArrowDownCircle}
						alt='arrow'
					/>{' '}
					and tag your uploaded documents to their respective document tags
				</WarningMessage>
			) : null}
			{/* {docTypeOptions?.length > 0 &&
				uploadingFiles.map((file, index) => {
					let isMapped = 0;
					for (const key in docTypeFileMap) {
						if (file.id === key) {
							isMapped = true;
							break;
						}
					}
					if (!isMapped) return null;
					return (
						<WarningMessage>
							{' '}
							Click on{' '}
							<FileTypeSmallIcon src={imgArrowDownCircle} alt='arrow' /> and tag
							your uploaded documents to their respective document tags
						</WarningMessage>
					);
				})} */}
			{pan && disabled && (
				<p style={{ color: 'grey' }}>
					Please remove current uploaded file to reupload
				</p>
			)}
			<FileListWrap>
				{uploadingFiles.map((file, upidx) => {
					// console.log('uplodaing-file-', file);
					let isMapped = false;
					for (const key in docTypeFileMap) {
						if (file.id === key) {
							isMapped = true;
							break;
						}
					}
					if (isMapped) return null;
					const isFileUploaded = file.progress >= 100 || file.progress <= 0;
					return (
						<File
							error={errorMessage}
							key={`${file.id}-${upidx}`}
							progress={file.progress}
							status={file.status}
							tooltip={file.name}
							style={
								docTypeOptions.length > 0 && isFileUploaded
									? { borderRight: 0 }
									: {}
							}>
							<FileName>
								{file.name.length > 20
									? file.name.slice(0, 20) + '...'
									: file.name}
							</FileName>
							{/* previous version - tagging and password code */}
							{/* {file.status === 'completed' && !!docTypeOptions.length && (
								<>
									<SelectDocType
									value={
										branch ? docSelected : docTypeFileMap[file.id]?.name || ''
									}
									onChange={e => {
										branch && setDocSelected(e.target.value);
										branch
											? changeHandler(e.target.value)
											: onDocTypeChange(file.id, e.target.value);
									}}>
									<option value='' disabled>
										Select Document Type
									</option>
									{docTypeOptions.map(docType => (
										<option key={docType.value} value={docType.name}>
											{docType.name}
										</option>
									))}
								</SelectDocType>
									{FINANCIAL_DOC_TYPES?.includes(
										docTypeFileMap[file.id]?.main?.toLowerCase()
									) && (
										<PasswordWrapper>
											<RoundButton
												showTooltip={passwordForFileId !== file.id}
												onClick={() => onPasswordClick(file.id)}>
												<ImgClose src={lockGreen} alt='lock' />
												<FontAwesomeIcon icon={faUserLock} size='1x' />
											</RoundButton>
											{passwordForFileId === file.id && (
												<FilePasswordInput
													fileId={file.id}
													onClickCallback={onDocTypePassword}
													onClose={onClosePasswordEnterArea}
												/>
											)}
										</PasswordWrapper>
									)}
								</>
							)} */}

							{isFileUploaded ? (
								<ImgClose
									src={imgClose}
									onClick={() => onFileRemove(file)}
									alt='close'
								/>
							) : null}
							{docTypeOptions?.length > 0 && isFileUploaded && (
								<Popover
									isOpen={isPopoverOpen === file.id}
									align='start'
									positions={['left', 'bottom', 'top', 'right']} // preferred positions by priority
									padding={-50} // adjust padding here!
									reposition={false} // prevents automatic readjustment of content position that keeps your popover content within its parent's bounds
									onClickOutside={() => setIsPopoverOpen(-1)} // handle click events outside of the popover/target here!
									ref={refPopup}
									content={popupProps => {
										// const {
										// 	position,
										// 	nudgedLeft,
										// 	nudgedTop,
										// 	childRect,
										// 	popoverRect,
										// } = popupProps;
										// you can also provide a render function that injects some useful stuff!
										// console.log('popupProps-', { popupProps });
										// const isOutside = nudgedLeft < -10;
										return (
											<FileTypeBox
											// style={isOutside ? { marginLeft: '-400px' } : {}}
											>
												<FileTypeUL>
													{docTypeOptions.map((docType, docoptidx) => (
														<FileTypeList
															key={`${docType.value}-${docoptidx}`}
															value={docType.name}
															onClick={() => {
																branch && setDocSelected(docType.name);
																branch
																	? changeHandler(docType.name)
																	: onDocTypeChange(file, docType);
																// onDocTypeChange(
																// 	file.id,
																// 	docType.name,
																// 	file
																// );
																setIsPopoverOpen(-1);
															}}>
															{docType.name}
														</FileTypeList>
													))}
												</FileTypeUL>
												<FileTypeIcon
													src={imgArrowDownCircle}
													alt='arrow'
													onClick={() => {
														setIsPopoverOpen(
															isPopoverOpen === file.id ? -1 : file.id
														);
													}}
												/>
											</FileTypeBox>
										);
									}}>
									<FileType
										onClick={() =>
											setIsPopoverOpen(isPopoverOpen === file.id ? -1 : file.id)
										}>
										<FileTypeIcon src={imgArrowDownCircle} alt='arrow' />
									</FileType>
								</Popover>
							)}
							{/* don't remove this code */}
							{/* {file.status === 'progress' && (
							<CancelBtn onClick={() => onFileRemove(file)}>&#10006;</CancelBtn>
						)}
						{file.status === 'completed' && (
							<CancelBtn onClick={() => onFileRemove(file)}>&#10006;</CancelBtn>
						)} */}
						</File>
					);
				})}
			</FileListWrap>
			<DocumentUploadListWrapper>
				{docTypeOptions.map((docType, doctypeidx) => {
					const mappedDocFiles = mappedFiles[docType.value] || [];
					// const mappedFiles = [];
					// console.log('upload-list-', {
					// 	docTypeOptions,
					// 	docTypeFileMap,
					// 	docType,
					// });
					// for (const key in docTypeFileMap) {
					// 	if (docType.value === docTypeFileMap[key].value) {
					// 		const newMappedFile = {
					// 			..._.cloneDeep(docTypeFileMap[key]),
					// 			docTypeKey: key,
					// 		};
					// 		// console.log('new-mapped-file-', newMappedFile);
					// 		mappedFiles.push(newMappedFile);
					// 	}
					// }
					return (
						<DocumentUploadList key={`${docType.id}-${doctypeidx}`}>
							<DocumentUploadListRow1>
								<DocumentUploadCheck
									src={mappedDocFiles.length ? imgGreenCheck : imgGreyCheck}
									alt='check'
								/>
								{docTypeNameToolTip === `${docType.id}-${doctypeidx}` && (
									<DocumentUploadNameToolTip>
										{docType.name}
									</DocumentUploadNameToolTip>
								)}
								<DocumentUploadName
									onMouseOver={() =>
										setDocTypeNameToolTip(`${docType.id}-${doctypeidx}`)
									}
									onMouseOut={() => setDocTypeNameToolTip(-1)}
									isSelected={mappedDocFiles.length}>
									{docType.name}
									{/* {docType.name.length > 30
										? docType.name.slice(0, 30) + '...'
										: docType.name} */}
								</DocumentUploadName>
							</DocumentUploadListRow1>
							<DocumentUploadListRow2>
								{mappedDocFiles.map((doc, index) => {
									console.log(mappedDocFiles, 'mappedDosc');
									const isViewMoreClicked = viewMore.includes(docType.value);
									const isViewMore = !isViewMoreClicked && index === 2;
									if (!isViewMoreClicked && index > 2) return null;
									const uniqPassId = `${doc.id}${index}`;
									return (
										<File
											style={{
												width: '220px',
												margin: '0 0 0 45px',
												height: '35px',
												lineHeight: '35px',
												background: isViewMore ? '#e6ffef' : '',
												cursor: 'pointer',
											}}
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
												if (isViewMore)
													setViewMore([...viewMore, docType.value]);
											}}>
											<FileName
												style={{
													fontSize: 12,
													width: '100%',
												}}>
												{isViewMore
													? `View ${mappedDocFiles.length - 2} more`
													: doc.name.length > 20
													? doc.name.slice(0, 20) + '...'
													: doc.name}
											</FileName>
											{FINANCIAL_DOC_TYPES?.includes(sectionType) && (
												<PasswordWrapper>
													<RoundButton
														showTooltip={passwordForFileId !== uniqPassId}
														onClick={() => onPasswordClick(uniqPassId)}>
														<ImgClose
															style={{ height: 20 }}
															src={
																passwordList.includes(uniqPassId)
																	? lockGreen
																	: lockGrey
															}
															alt='lock'
														/>
														{/* <FontAwesomeIcon icon={faUserLock} size='1x' /> */}
													</RoundButton>
													{passwordForFileId === uniqPassId && (
														<FilePasswordInput
															fileId={doc.id}
															uniqPassId={uniqPassId}
															docType={docType}
															onClickCallback={onDocTypePassword}
															onClose={onClosePasswordEnterArea}
														/>
													)}
												</PasswordWrapper>
											)}
											{doc?.src == 'start' ? null : (
												<ImgClose
													style={{ height: '20px' }}
													src={isViewMore ? imgArrowDownCircle : imgClose}
													onClick={() => {
														// console.log('before-remove-', {
														// 	passwordList,
														// 	docTypeFileMap,
														// 	doc,
														// });
														const newPasswordList = passwordList.filter(
															p => p !== uniqPassId
														);
														const newDocTypeFileMap = _.cloneDeep(
															docTypeFileMap
														);
														delete newDocTypeFileMap[doc.docTypeKey];
														// console.log('after-remove-', {
														// 	newPasswordList,
														// 	newDocTypeFileMap,
														// 	doc,
														// });
														onFileRemove(doc, docType);
														setDocTypeFileMap(newDocTypeFileMap);
														setPasswordList(newPasswordList);
													}}
													alt='close'
												/>
											)}
										</File>
									);
								})}
							</DocumentUploadListRow2>
						</DocumentUploadList>
					);
				})}
			</DocumentUploadListWrapper>
		</>
	);
}

FileUpload.defaultProps = {
	onDrop: () => {},
};
