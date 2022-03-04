import { useContext, useState } from 'react';
import styled from 'styled-components';

import { DOCS_UPLOAD_URL } from '../_config/app.config';
import Modal from './Modal';
import Button from './Button';
import { UserContext } from '../reducer/userReducer';
import FileUpload from '../shared/components/FileUpload/FileUpload';

const Div = styled.div`
	text-align: center;
	font-size: 1.5em;
	font-weight: 500;
	margin-bottom: 20px;
`;

export default function UploadAgreementModal({ onClose, onDone, name }) {
	const {
		state: { userId, userToken },
	} = useContext(UserContext);

	const [agreementFiles, setAgreementFiles] = useState([]);

	const handleFileUpload = async files => {
		setAgreementFiles(preFiles => [
			...preFiles,
			...files.map(file => ({ ...file, doc_type_id: '12' })),
		]);
	};

	const onDoneClick = () => {
		onDone(agreementFiles, name);
	};

	return (
		<Modal show={true} onClose={onClose} width='50%'>
			{/* <div>{name}</div> */}
			<Div> Upload Agreement Document</Div>
			<FileUpload
				agreementDocShowMsg={false}
				onDrop={handleFileUpload}
				accept=''
				upload={{
					url: DOCS_UPLOAD_URL({ userId }),
					header: {
						Authorization: `Bearer ${userToken}`,
					},
				}}
			/>
			<Button
				fill
				name='Done'
				width='150px'
				onClick={onDoneClick}
				disabled={!agreementFiles.length}
			/>
		</Modal>
	);
}
