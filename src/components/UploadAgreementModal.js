/* In Housing Loan, we have option of uploading agreement.
For the same purpose we have another component to handle upload of agreement documents*/

import { useContext, useState } from 'react';
import styled from 'styled-components';

import { DOCS_UPLOAD_URL } from '_config/app.config';
import Modal from 'components/Modal';
import Button from './Button';
import { UserContext } from 'reducer/userReducer';
import FileUpload from 'shared/components/FileUpload/FileUpload';
import { CATEGORY_OTHER } from 'pages/product/documentUpload/const';

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
			...files.map(file => ({
				...file,
				mainType: 'Others',
				req_type: 'property',
				isDocRemoveAllowed: true,
				category: CATEGORY_OTHER,
				doc_type_id: `app_${CATEGORY_OTHER}`,
			})),
		]);
	};

	const onDoneClick = () => {
		onDone(agreementFiles, name);
	};

	const removeHandler = (e, docs) => {
		// console.log('e', e);
		// console.log('doc', docs);
		var index = docs.findIndex(x => x.id === e);
		docs.splice(index, 1);
		setAgreementFiles(docs);
		// console.log('---', agreementFiles);
	};

	return (
		<Modal show={true} onClose={onClose} width='50%'>
			{/* <div>{name}</div> */}
			<Div> Upload Agreement Document</Div>
			<FileUpload
				aggreementUploadModal={false}
				onDrop={handleFileUpload}
				onRemoveFile={e => removeHandler(e, agreementFiles)}
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
