import React from 'react';
import * as UI from './ui.js';
import Button from 'components/Button.js';
import { useState } from 'react';
import axios from 'axios';
import { useToasts } from 'components/Toast/ToastProvider';
import * as API from '_config/app.config';
import Modal from 'components/Modal';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { formatGetSectionReqBody } from 'utils/formatData.js';
const Table = ({
	headers,
	data,
	section,
	hasSeperator,
	buttonDisabled,
	loanId,
	application,
	token,
}) => {
	// Mapping headers title to corresponding table object keys
	const mapping = {
		'Aadhar Number': 'aadhaar',
		'Applicant Name': 'name',
		Status: 'status',
		'PAN Number': 'pan',
		'Company Name': 'name',
		'GST Number': 'gstin',
		CIN: 'cin',
		'Udyam Number': 'udyamNum',
		'Crime Check': 'crimecheck',
		// 'Itr Number': 'itr_num',
	};
	const sections = {
		ROC: 'ROC',
		GSTR3B: 'GST',
		'CIBIL/Equifax': 'CIBIL',
		EPFO: 'EPFO',
		ESIC: 'ESIC',
		'Aadhaar Consent': 'AADHAAR',
		ITR: 'ITR',
		// 'GST Verification': 'GST',
		UDYAM: 'UDYAM',
		'C-KYC': 'CKYC',
		'Bio-metric KYC': 'BKYC',
		'Crime Check': 'CRIMECHECK',
	};
	const [loading, setLoading] = useState();
	const { addToast } = useToasts();
	const [htmlContent, setHtmlContent] = useState('');
	const [isGstModalOpen, setModalOpen] = useState(false);
	// const dispatch = useDispatch();

	const fetchHandle = async appObj => {
		const payLoad = {
			choice: sections[section],
			director_id: appObj.id,
			aadhaar: appObj.aadhaar,
			pan: appObj.pan,
			// pan: 'AACCO0644D',
			crimeCheck: appObj.check,
			gstin: appObj.gstin,
			cin: appObj.cin,
			udyamNum: appObj.udyamNum,
		};
		try {
			appObj.status = 'In Progress';
			setLoading(true);
			const response = await axios.get(
				`${API.API_END_POINT}/api/getConsent?${formatGetSectionReqBody({
					application,
				})}`,
				{
					params: payLoad,
				},
				{
					header: { authorization: token },
				}
			);
			// TODO: MODAL only for those which needs User inputs //ITR and AADHAAR
			if (sections[section] === 'ITR' || sections[section] === 'GST') {
				setHtmlContent(response.data);
				setModalOpen(true);
			} else {
				if (response?.data?.status === 'Wrong Input') {
					addToast({
						message: 'Error fetching details, Please try after sometime!',
						type: 'error',
					});
					appObj.status = 'Failed';
				} else {
					// TODO: Here need to get status from API and update appObj.status
					console.log({ response });
					appObj.status =
						response?.data?.status === 200 ? 'Fetched' : response?.data?.status;
				}
			}
		} catch (error) {
			console.error('error-ConsentDetails-fetchModal-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: 'Error fetching details, Please try after sometime!',
				type: 'error',
			});
			setModalOpen(false);
			appObj.status = 'Failed';
		} finally {
			setLoading(false);
			// console.log('Status:', appObj);
		}
	};

	return (
		<>
			<Modal
				show={isGstModalOpen}
				onClose={() => {
					setModalOpen(false);
				}}
				maskClosable={false}
				// Width='40%'
				customStyle={{
					width: '40%',
					minWidth: 'fit-content',
					minHeight: 'auto',
					position: 'relative',
					padding: '0',
				}}
			>
				<section>
					<UI.ImgClose
						onClick={() => {
							setModalOpen(false);
						}}
						style={{
							color: 'black',
							position: 'absolute',
							top: '0',
							right: '0',
							zIndex: '1',
							display: 'inline',
						}}
						src={imgClose}
						alt='close'
					/>
					<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
				</section>
			</Modal>
			<UI.TableContainer>
				<UI.TableHeader>
					{headers.map(header => (
						<UI.TableCell key={header}>{header}</UI.TableCell>
					))}
				</UI.TableHeader>
				{data.map((rowData, rowIndex) => (
					<UI.TableRow key={rowIndex}>
						{headers.map(header => (
							<UI.TableCell key={header}>
								{rowData[mapping[header]]}
							</UI.TableCell>
						))}
						<UI.TableCell>
							<Button
								name={rowData.status === 'Fetched' ? 'Fetched' : 'Fetch'}
								onClick={() => fetchHandle(rowData)}
								disabled={
									buttonDisabled ||
									rowData.status === 'Fetched' ||
									rowData.status === 'In Progress'
								}
							/>
						</UI.TableCell>
					</UI.TableRow>
				))}
			</UI.TableContainer>
			{hasSeperator && <UI.HR />}
		</>
	);
};


export default Table;
