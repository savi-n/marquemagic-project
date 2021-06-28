import { useState, useRef, useContext } from 'react';
import useFetch from '../../hooks/useFetch';
import { UserContext } from '../../reducer/userReducer';
import FileUpload from '../../shared/components/FileUpload/FileUpload';
import Button from '../shared/components/Button';
import { DOCS_UPLOAD_URL } from '../../_config/app.config';

export default function Security({ setSecurity, productId }) {
	const {
		state: { userId, userToken, userDetails }
	} = useContext(UserContext);
	const { newRequest } = useFetch();
	const uploadedFiles = useRef([]);

	const handleFileUpload = async files => {
		Promise.all(
			files.map(file => {
				const formData = new FormData();
				formData.append('document', file);

				return newRequest(
					DOCS_UPLOAD_URL({ userId }),
					{
						method: 'POST',
						data: formData
					},
					{
						Authorization: `Bearer ${userToken}`
					}
				)
					.then(res => {
						if (res.data.status === 'ok') {
							const file = res.data.files[0];
							const uploadfile = {
								loan_id: productId,
								doc_type_id: '1',
								upload_doc_name: file.filename,
								document_key: file.fd,
								size: file.size
							};
							uploadedFiles.current = [...uploadedFiles.current, uploadfile];
						}
						return res.data.files[0];
					})
					.catch(err => err);
			})
		).then(files => console.log(files));
	};

	return (
		<section className='rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full'>
			<section className='h-auto overflow-hidden'>
				<FileUpload onDrop={handleFileUpload} accept='' />
			</section>
			<section className='w-full gap-x-4 flex justify-end'>
				<Button type='blue-light' size='small' rounded='rfull' onClick={() => setSecurity(false)}>
					Submit
				</Button>
				<Button type='red-light' size='small' rounded='rfull' onClick={() => setSecurity(false)}>
					Cancel
				</Button>
			</section>
		</section>
	);
}
