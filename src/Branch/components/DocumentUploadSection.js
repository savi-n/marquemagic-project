import { useState, useEffect } from 'react';

import { useToasts } from '../../components/Toast/ToastProvider';
import useFetch from '../../hooks/useFetch';
import FileUpload from '../../shared/components/FileUpload/FileUpload';
import Button from '../../components/Button';
import CheckBox from '../../shared/components/Checkbox/CheckBox';
import {
	NC_STATUS_CODE,
	DOCS_UPLOAD_URL_LOAN,
	BORROWER_UPLOAD_URL,
} from '../../_config/app.config';
import {
	DELETE_FILE_UPLOADED,
	VIEW_CASE_DOCUMENTS_LIST_UIUX,
} from '../../_config/branch.config';
import { DOCUMENTS_TYPE_MAP } from '../../_config/key.config';
import DocumentView from './DocumentView';

const cooap = (data, type) => {
	return data?.directors.find(
		e => e?.type_name.toLowerCase() === type.toLowerCase() && e.id
	);
};

const docGroups = [
	['Financial_doc', 'Financial Documents'],
	['KYC_doc', 'KYC Documents'],
	['Other_doc', 'Other Documents'],
];

const documentListMapper = groupedDocs => {
	let formatedDocumentsData = [];
	for (let group of docGroups) {
		const groupDocuments = groupedDocs[group[0]] || [];
		const formatedDocs = groupDocuments
			?.filter(doc => doc.status !== 'deleted')
			?.map(doc => ({
				docGroup: group[1],
				userId: doc.user_id,
				bussinessId: doc.business_id,
				directorId: doc.directorId,
				docType: doc.doctype,
				id: doc.id,
				loanId: doc.loan,
				date: doc.on_upd,
				docName: doc.original_doc_name,
				size: doc.size,
				fdKey: doc.doc_name,
				status: doc.status,
			}));

		formatedDocumentsData = [...formatedDocumentsData, ...formatedDocs];
	}

	return formatedDocumentsData;
};

export default function DocumentUploadSection({
	userToken,
	item,
	loanData,
	option,
	docType,
}) {
	const [loading, setLoading] = useState(true);

	const [documentList, setDocumentList] = useState([]);

	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const appplicantId = loanData?.business_id?.userid;

	const loanId = loanData?.id;

	const applicantDirectorId = loanData?.directors.find(
		director => director.type_name === 'Applicant'
	);

	const coApplicantDirectorId = loanData?.directors.find(
		director => director.type_name === 'Co-applicant'
	);

	const FetchDocumentLists = async () => {
		try {
			const documentListReq = await newRequest(
				VIEW_CASE_DOCUMENTS_LIST_UIUX({ loanId }),
				{
					method: 'GET',
				},
				{ Authorization: `Bearer ${userToken}` }
			);

			const documentListRes = documentListReq.data;

			if (documentListRes.status === NC_STATUS_CODE.OK) {
				const mapDocumentList = documentListMapper(
					documentListRes.documentList
				);
				setDocumentList(mapDocumentList);
			}
		} catch (err) {
			console.log(err);
		}

		setLoading(false);
	};

	useEffect(() => {
		FetchDocumentLists();
		// eslint-disable-next-line
	}, []);

	const onDoctypeChange = (document, value) => {
		const id = document.id;

		const selectedOption = option.find(opt => opt.value === +value);

		const updatedDocumentList = documentList.map(doc => {
			if (doc.id === id) {
				return {
					...doc,
					docType: selectedOption.value,
					docGroup: selectedOption.main,
					docTypeName: selectedOption.name,
					modified: true,
				};
			}
			return doc;
		});

		setDocumentList(updatedDocumentList);
	};

	const onDeletDocument = async document => {
		try {
			const deleteFileReq = await newRequest(
				DELETE_FILE_UPLOADED,
				{
					method: 'POST',
					data: {
						loan_doc_id: document.id,
						business_id: document.businessId,
						loan_id: document.loanId,
						userid: document.userId,
					},
				},
				{ Authorization: `Bearer ${userToken}` }
			);

			const deleteFileRes = deleteFileReq.data;

			if (deleteFileRes.status === NC_STATUS_CODE.OK) {
				const updatedDocumentList = documentList.filter(
					doc => doc.id !== document.id
				);
				setDocumentList(updatedDocumentList);
				addToast({
					message: `${document.docName} deleted`,
					type: 'success',
				});
				return;
			}
			throw new Error(deleteFileRes.message);
		} catch (err) {
			console.log('DELETE FILE ERROR  ====>  ', document.id, err.message);
			addToast({
				message: err.message || 'Something Went Wrong. Try Again Later!',
				type: 'error',
			});
		}
	};

	const applicantDocs = documentList?.filter(
		docs => docs.directorId === applicantDirectorId?.id
	);

	const coApplicantDocs = documentList?.filter(
		docs => docs.directorId === coApplicantDirectorId?.id
	);

	const [uploadedfiles, setUploadedfiles] = useState([]);
	const handleFileUpload = directorId => newFiles => {
		const formatedFiles = newFiles.map(file => ({
			docTypeId: '1', //doc_type_id
			directorId: directorId,
			loanId: loanId,
			documentKey: file.document_key, //document_key
			id: file.id,
			size: file.size,
			uploadDocName: file.upload_doc_name, //upload_doc_name
		}));
		setUploadedfiles([...uploadedfiles, ...formatedFiles]);
	};

	const handleDocumentTypeChange = async (fileId, type) => {
		const formatedFiles = uploadedfiles.map(file => {
			if (file.id === fileId) {
				return {
					...file,
					...(type.value && {
						docTypeId: type.value,
						docGroup: type.main,
						docTypeName: type.name,
					}),
					...(type.password && { password: type.password }),
				};
			}
			return file;
		});
		setUploadedfiles(formatedFiles);
	};

	const onFileRemove = fileId => {
		const formatedFiles = uploadedfiles.filter(file => file.id !== fileId);
		setUploadedfiles(formatedFiles);
	};

	const handleSubmitFileUploads = async () => {
		try {
			setLoading(true);

			const submitReq = await newRequest(
				BORROWER_UPLOAD_URL,
				{
					method: 'POST',
					data: {
						upload_document: uploadedfiles.map(file => ({
							doc_type_id: file.docTypeId,
							size: file.size,
							directorId: file.directorId,
							loan_id: file.loanId,
							document_key: file.documentKey,
							upload_doc_name: file.uploadDocName,
						})),
					},
				},
				{
					Authorization: `Bearer ${userToken}`,
				}
			);

			const submitRes = submitReq.data;

			if (submitRes.status === NC_STATUS_CODE.OK) {
				addToast({
					message: 'Uploaded Successfully',
					type: 'success',
				});

				// const uploadedSuccessFiles = uploadedfiles.map((file) => ({
				//   docGroup: file.docGroup,
				//   // userId: doc.user_id,
				//   // bussinessId: doc.business_id,
				//   directorId: file.directorId,
				//   docType: file.doctypeId,
				//   // id: file.id,
				//   // loanId: doc.loan,
				//   // date: doc.on_upd,
				//   // docName: doc.original_doc_name,
				//   size: file.size,
				//   // fdKey: doc.doc_name,
				//   // status: doc.status,
				// }));

				// setDocumentList([...documentList, uploadedSuccessFiles]);
				setUploadedfiles([]);
				setLoading(false);
				return;
			}
		} catch (err) {
			console.log('FILE UPLOAD ERROR  ====>  ', err.message);
			addToast({
				message: err.message || 'Something Went Wrong. Try Again Later!',
				type: 'error',
			});
			setLoading(false);
		}
	};

	const checkedFileTypes = [
		...documentList?.map(doc => doc.docType),
		...uploadedfiles.map(file => file.docTypeId),
	];

	return (
		<>
			<section className='flex flex-col gap-y-5 w-8/12'>
				<p className='text-blue-600 font-medium text-xl'>
					Applicant Documents Uploaded
				</p>
				<FileUpload
					accept=''
					upload={{
						url: DOCS_UPLOAD_URL_LOAN({
							userId: appplicantId,
						}),
						header: {
							Authorization: `Bearer ${userToken}`,
						},
					}}
					docTypeOptions={option}
					onDrop={handleFileUpload(applicantDirectorId.id)}
					documentTypeChangeCallback={handleDocumentTypeChange}
					onRemoveFile={onFileRemove}
				/>
				<section className='flex gap-x-4 flex-col flex-wrap gap-y-4'>
					{applicantDocs?.length > 0 && (
						<>
							{docGroups.map(docGroup => (
								<DocumentView
									key={docGroup[0]}
									title={docGroup[1]}
									loanId={loanId}
									userToken={userToken}
									options={option}
									onDoctypeChange={onDoctypeChange}
									onDeletDocument={onDeletDocument}
									documents={applicantDocs.filter(
										doc => doc.docGroup === docGroup[1]
									)}
								/>
							))}
						</>
					)}
				</section>
			</section>
			{docType && (
				<section className='fixed overflow-scroll z-10 right-0 w-1/4 bg-gray-200 p-4 h-full top-24 py-16'>
					{Object.keys(docType).map(el => (
						<section className='py-6' key={el}>
							<p className='font-semibold'>{DOCUMENTS_TYPE_MAP[el]}</p>
							{docType[el].map(doc => (
								<section key={doc.doc_type_id}>
									<CheckBox
										name={doc.name}
										round
										disabled
										bg='green'
										checked={checkedFileTypes.includes(doc.doc_type_id)}
									/>
								</section>
							))}
						</section>
					))}
				</section>
			)}
			{cooap(loanData, 'Co-Applicant')?.id && (
				<section className='flex flex-col space-y-5 w-8/12'>
					<p className='text-blue-600 font-medium text-xl'>
						Co-Applicant Documents Uploaded
					</p>
					<FileUpload
						accept=''
						upload={{
							url: DOCS_UPLOAD_URL_LOAN({
								userId: appplicantId,
							}),
							header: {
								Authorization: `Bearer ${sessionStorage.getItem('token')}`,
							},
						}}
						docTypeOptions={option}
						onDrop={handleFileUpload(coApplicantDirectorId.id)}
						documentTypeChangeCallback={handleDocumentTypeChange}
						onRemoveFile={onFileRemove}
					/>
					<section className='flex flex-col gap-x-4 flex-wrap gap-y-4'>
						{coApplicantDocs?.length > 0 && (
							<>
								{docGroups.map(docGroup => (
									<DocumentView
										key={docGroup[0] + '__co-applicant'}
										title={docGroup[1]}
										loanId={loanId}
										userToken={userToken}
										options={option}
										onDoctypeChange={onDoctypeChange}
										onDeletDocument={onDeletDocument}
										documents={coApplicantDocs.filter(
											docs => docs.docGroup === docGroup[1]
										)}
									/>
								))}
							</>
						)}
					</section>
				</section>
			)}
			<div>
				<Button
					onClick={handleSubmitFileUploads}
					fill
					disabled={!uploadedfiles.length || loading}
					name={'Submit'}
					loading={loading}
				/>
			</div>
		</>
	);
}
