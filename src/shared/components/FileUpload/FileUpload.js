import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const Dropzone = styled.div`
	width: 100%;
	min-height: 150px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	background: ${({ bg }) => bg ?? 'rgba(0,0,0,0.1)'};
	border-radius: 20px;
	overflow: hidden;

	${({ dragging }) =>
		dragging &&
		`border: dashed grey 4px;
        background-color: rgba(255,255,255,.8);
        z-index: 9999;`}
`;

const Caption = styled.p`
	font-size: 15px;
	font-weight: 400;
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
`;

const Label = styled.label`
	padding: 10px 15px;
	color: #fff;
	font-size: 15px;
	cursor: pointer;
	background: ${({ theme, bg }) => bg ?? theme.buttonColor2};
	border-radius: 5px;
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

export default function FileUpload({ onDrop, accept = '', caption, bg, disabled = false }) {
	const ref = useRef(uuidv4());

	const id = uuidv4();

	const [dragging, setDragging] = useState(false);

	const selectedFiles = useRef([]);

	let refCounter = 0;

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

		let files = [...event.dataTransfer.files];
		if (accept) {
			files = files.filter(file => accept.includes(file.type.split('/')[1]));
		}

		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			onDrop(files);

			files = [...selectedFiles.current, ...files];
			selectedFiles.current = files;

			event.dataTransfer.clearData();
			refCounter = 0;
		}
		setDragging(false);
	};

	const onChange = async event => {
		onDrop([...event.target.files]);

		const files = [...selectedFiles.current, ...event.target.files];
		selectedFiles.current = files;
	};

	useEffect(() => {
		let div = ref.current;

		div.addEventListener('dragenter', handleDragIn);
		div.addEventListener('dragleave', handleDragOut);
		div.addEventListener('dragover', handleDrag);
		div.addEventListener('drop', handleDrop);
		div.addEventListener('dragend', handleDrag);

		return () => {
			div.removeEventListener('dragenter', handleDragIn);
			div.removeEventListener('dragleave', handleDragOut);
			div.removeEventListener('dragover', handleDrag);
			div.removeEventListener('drop', handleDrop);
			div.removeEventListener('dragend', handleDrag);
		};
	}, []);

	return (
		<Dropzone ref={ref} dragging={dragging} bg={bg} disabled={disabled}>
			{dragging && <Droping>Drop here :)</Droping>}
			<FontAwesomeIcon icon={faUpload} size='1x' />
			<Caption>
				{caption || `Drag and drop or`} {accept && <AcceptFilesTypes>{accept}</AcceptFilesTypes>}
			</Caption>
			<UploadButton type='file' id={id} onChange={onChange} multiple accept={accept} disabled={disabled} />
			<Label htmlFor={id}>Select from your Computer</Label>
		</Dropzone>
	);
}

FileUpload.defaultProps = {
	onDrop: () => {}
};
