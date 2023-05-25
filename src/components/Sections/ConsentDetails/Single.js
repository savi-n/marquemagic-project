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
const Single = ({
	headers,
	section,
	buttonDisabled,
	application,
	token,
	rowData,
}) => {
	// Mapping headers title to corresponding table object keys
	const mapping = {
		'Aadhar Number': 'aadhaar',
		'Applicant Name': 'name',
		Status: 'status',
		'PAN Number': 'pan',
		'Company Name': 'name',
		'GST Number': 'gstin',
		'CIN Number': 'cin',
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
		Udyam: 'udyam',
		'C-KYC': 'CKYC',
		'Bio-metric KYC': 'BKYC',
		'Crime Check': 'CRIMECHECK',
	};
	const [loading, setLoading] = useState();
	const { addToast } = useToasts();
	const [htmlContent, setHtmlContent] = useState('');
	const [isGstModalOpen, setModalOpen] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [status, setStatus] = useState(rowData?.status);
	// const dispatch = useDispatch();

	const fetchHandle = async appObj => {
		// console.log({ appObj });
		const payLoad = {
			choice: sections[section],
			director_id: appObj.id,
			aadhaar: appObj.aadhaar,
			pan: appObj.pan,
			crimeCheck: appObj.check,
			gstin: appObj.gstin,
			cin: appObj.cin,
			udyamNum: appObj.udyamNum,
		};
		try {
			sections[section] === 'CRIMECHECK' && setDisabled(true);
			// appObj.status = 'In Progress';
			setStatus('In Progress');
			setDisabled(true);
			setLoading(true);
			const response = await axios.get(
				`${API.API_END_POINT}/api/getConsent?${formatGetSectionReqBody({
					application,
				})}`,
				sections[section] === 'ROC'
					? {
							headers: {
								Authorization: `${token}`,
							},
							params: payLoad,
					  }
					: { params: payLoad }
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
					// appObj.status = 'Failed';
					setStatus('Failed');
				} else if (response?.data?.status === 'nok') {
					addToast({
						message: 'Something went wrong, Please try after sometime!',
						type: 'error',
					});
					// appObj.status = 'Invalid Data';
					setStatus('Invalid Data');

					setDisabled(true);
				} else {
					// TODO: Here need to get status from API and update appObj.status
					appObj.status =
						response?.data?.status === 200 || response?.data?.status === 'ok'
							? 'In Progress'
							: response?.data?.status;
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
			// appObj.status = 'Failed';
			setStatus('Failed');
		} finally {
			setLoading(false);
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

			<UI.TableRow>
				{headers?.map(header => (
					<UI.TableCell key={header}>
						{header === 'Status' ? status : rowData[mapping[header]] || '--'}
					</UI.TableCell>
				))}
				<UI.TableCell>
					{sections[section] !== 'CRIMECHECK' ? (
						<Button
							name='Fetch'
							onClick={() => fetchHandle(rowData)}
							disabled={
								buttonDisabled || disabled || rowData.status === 'Fetched'
							}
						/>
					) : (
						rowData.status === 'Not Fetched' && (
							<UI.Buttons>
								<Button
									width='100px'
									name='Yes'
									onClick={() => fetchHandle({ ...rowData, check: true })}
									disabled={buttonDisabled || disabled}
								/>
								<Button
									width='80px'
									name='No'
									onClick={() => fetchHandle({ ...rowData, check: false })}
									disabled={buttonDisabled || disabled}
								/>
							</UI.Buttons>
						)
					)}
				</UI.TableCell>
			</UI.TableRow>
		</>
	);
};

export default Single;
