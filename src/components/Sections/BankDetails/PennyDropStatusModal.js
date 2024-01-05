import React from 'react';
import Modal from 'components/Modal';
import Button from 'components/Button';
import iconError from 'assets/icons/Red_error_icon.png';
import iconSuccess from 'assets/icons/success_icon.png';
import moment from 'moment';

import * as UI from './ui';
import Loading from 'components/Loading';

const PennyDropStatusModal = ({ onYes, data, loading }) => {
	const keysMapping = {
		id: 'Id',
		verified: 'Status',
		verified_at: 'Verified At',
		beneficiary_name_with_bank: 'Benificiary Name With Bank',
	};

	return (
		<Modal
			show={true}
			onClose={() => {}}
			width='30%'
			customStyle={{ minHeight: '200px' }}
		>
			{loading ? (
				<Loading />
			) : (
				<>
					<UI.ModalBody>
						<UI.MessageSection>
							<UI.MessageIcon>
								{data?.message?.toLowerCase()?.includes('success') ? (
									<UI.StatusIcon src={iconSuccess} alt='success' />
								) : (
									<UI.StatusIcon src={iconError} alt='error' />
								)}
							</UI.MessageIcon>
							{data?.message?.toLowerCase()?.includes('success') ? (
								<UI.SuccessMessage>{data?.message}</UI.SuccessMessage>
							) : (
								<UI.FailureMessage>{data?.message}</UI.FailureMessage>
							)}
						</UI.MessageSection>
						<UI.DataTable>
							<tbody>
								{Object.entries(data?.data).map(([key, value]) => (
									<tr key={key}>
										<UI.TableHeader>{keysMapping[key]}</UI.TableHeader>
										<UI.TableCell>
											{key === 'verified_at'
												? moment(value).format('MMMM DD, YYYY hh:mm:ss A')
												: value.toString() === 'true'
												? 'Verified'
												: value.toString() === 'false'
												? 'Not Verified'
												: value.toString()}
										</UI.TableCell>
									</tr>
								))}
							</tbody>
						</UI.DataTable>
					</UI.ModalBody>
					<UI.ModalFooter>
						<Button fill name='Ok' onClick={onYes} />
					</UI.ModalFooter>
				</>
			)}
		</Modal>
	);
};

export default PennyDropStatusModal;
