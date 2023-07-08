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
	fetchConsentDetails,
}) => {
	// Mapping headers title to corresponding table object keys
	const mapping = {
		'Aadhaar Number': 'aadhaar',
		'Applicant Name': 'name',
		Status: 'status',
		'PAN Number': 'pan',
		Pan: 'pan',
		'Company Name': 'name',
		// 'Business Name': 'name',
		'GST Number': 'gstn' || 'gstin',
		'CIN Number': 'cin',
		'Udyam Number': 'udyamNum',
		'Crime Check': 'crime_check',
		// 'Itr Number': 'itr_num',
		'Director ID': 'director_id',
		Name: 'name',
	};
	const sections = {
		ROC: 'ROC',
		GSTR3B: 'GST',
		BUREAU: 'bureau',
		EPFO: 'EPFO',
		ESIC: 'ESIC',
		AADHAAR: 'aadhaar',
		ITR: 'ITR',
		// 'GST Verification': 'GST',
		UDYAM: 'udyam',
		'c-KYC': 'ckyc' || 'CKYC',
		'Bio-metric KYC': 'BKYC',
		'CRIME CHECK': 'crime_check',
	};
	const [loading, setLoading] = useState(false);
	const { addToast } = useToasts();
	const [htmlContent, setHtmlContent] = useState('');
	const [isGstModalOpen, setModalOpen] = useState(false);
	const [status, setStatus] = useState(rowData?.status);
	const [disabled, setDisabled] = useState(false);
	// const dispatch = useDispatch();

	const fetchHandle = async appObj => {
		// console.log({ appObj });
		const payLoad = {
			choice: sections[section],
			director_id: appObj?.id || appObj?.director_id,
			aadhaarNo: appObj?.aadhaar,
			pan: appObj?.pan,
			crime_check: appObj?.check,
			gstin: appObj?.gstn || appObj?.gstin,
			cin: appObj?.cin,
			udyamNum: appObj?.udyamNum,
			// udyamNum:'UDYAM-MH-19-0002476',
			is_applicant: appObj?.is_applicant,
		};
		if (
			sections[section] === 'udyam' &&
			(!appObj?.udyamNum || appObj?.udyamNum === '--')
		) {
			addToast({
				message: 'Please enter udhyam number to verify it',
				type: 'warning',
			});
			return;
		}

		try {
			// sections[section] === 'crime_check' && setDisabled(true);
			// appObj?.status = 'In Progress';
			let isDisabledButton = false;
			setStatus('In Progress');
			// setDisabled(true);
			setLoading(true);
			const response = await axios.get(
				`${API.API_END_POINT}/api/getConsent?${formatGetSectionReqBody({
					application,
				})}`,
				sections[section] === 'ROC' || sections[section] === 'aadhaar'
					? {
							headers: {
								Authorization: `${token}`,
							},
							params: payLoad,
					  }
					: { params: payLoad }
			);
			// TODO: MODAL only for those which needs User inputs //ITR, GST and AADHAAR
			if (
				sections[section] === 'ITR' ||
				sections[section] === 'GST' ||
				sections[section] === 'aadhaar' ||
				sections[section] === 'bureau'
			) {
				setHtmlContent(response.data);
				setModalOpen(true);
			} else {
				if (response?.data?.status === 'Wrong Input') {
					addToast({
						message:
							response?.data?.message ||
							'Error fetching details, Please try after sometime!',
						type: 'error',
					});
					// appObj.status = 'Failed';
					setStatus('Failed');
				} else if (response?.data?.status === 'nok') {
					addToast({
						message:
							response?.data?.message ||
							'Something went wrong, Please try after sometime!',
						type: 'error',
					});
					// appObj.status = 'Invalid Data';
					setStatus('Invalid Data');
				}
			}
			if (
				sections[section] === 'crime_check' &&
				response?.data?.status === 'ok'
			) {
				//console.log('section', section);
				addToast({
					message: response?.data?.message || 'Successfully updated',
					type: 'success',
				});
				setStatus(appObj?.check);
				isDisabledButton = true;
				// setDisabled(true);
			} else if (
				response?.data?.status === 200 ||
				response?.data?.status === 'ok'
			) {
				setStatus('In Progress');
				// setDisabled(true);
				isDisabledButton = true;
			} else if (response?.data?.status === 400) {
				addToast({
					message:
						response?.data?.message ||
						'Something went wrong, Please try after sometime!',
					type: 'error',
				});
				setStatus('Failed');
				// setDisabled(false);
				isDisabledButton = false;
			}
			// console.log(response?.data);
			if (
				response?.data?.status === 'Wrong Input' ||
				response?.data?.status === 'nok'
			) {
				addToast({
					message:
						response?.data?.message ||
						'Something went wrong, Please try after sometime!',
					type: 'error',
				});
				// appObj?.status = 'Invalid Data';
				setStatus('Failed');
				// setDisabled(false);
				isDisabledButton = false;
			}
			if (isDisabledButton) setDisabled(true);
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

			// appObj?.status = 'Failed';
			setStatus('Failed');
			// setDisabled(false);
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
					fetchConsentDetails();
					// fetchHandle(rowData)
				}}
				maskClosable={false}
				// Width='40%'
				customStyle={{
					width: '40%',
					minWidth: 'fit-content',
					minHeight: 'auto',
					position: 'relative',
					padding: '0',
					// display: 'flex',
					// alignItems: 'center',
					// justifyContent: 'center',
					// textAlign: 'center',
				}}
			>
				<section>
					<UI.ImgClose
						onClick={() => {
							setModalOpen(false);
							fetchConsentDetails();
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
					<div
						dangerouslySetInnerHTML={{ __html: htmlContent }}
						style={{ padding: '1rem' }}
					/>
				</section>
			</Modal>

			<UI.TableRow>
				{headers?.map(header => (
					<UI.TableCell key={header}>
						{mapping[header] !== 'director_id' &&
							(header === 'Status' ? status : rowData[mapping[header]] || '--')}
						{header === 'Status' && rowData?.disclaimer && (
							<UI.Disclaimer>
								<span style={{ color: 'red' }}>*</span>
								Disclaimer:
								<br />
								<UI.DisclaimerContent>
									{rowData?.disclaimer}
								</UI.DisclaimerContent>
							</UI.Disclaimer>
						)}
					</UI.TableCell>
				))}
				<UI.TableCell>
					{sections[section] !== 'crime_check' ? (
						<Button
							name='Fetch'
							onClick={() => fetchHandle(rowData)}
							disabled={
								buttonDisabled || disabled || rowData?.status === 'Fetched'
							}
							loading={loading}
						/>
					) : (
						<UI.Buttons>
							{/* <Button
								width='100px'
								name='Yes'
								onClick={() => fetchHandle({ ...rowData, check: 'Yes' })}
								disabled={
									buttonDisabled || disabled || rowData?.status === 'Yes'
								}
							/> */}
							<Button
								width='80px'
								name='No'
								onClick={() => fetchHandle({ ...rowData, check: 'No' })}
								disabled={
									buttonDisabled || disabled || rowData?.status === 'No'
								}
							/>
						</UI.Buttons>
					)}
				</UI.TableCell>
			</UI.TableRow>
		</>
	);
};

export default Single;
