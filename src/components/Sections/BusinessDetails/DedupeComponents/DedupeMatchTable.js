import React from 'react';
import * as UI from './ui';
import { useToasts } from 'components/Toast/ToastProvider';
import { encryptReq } from 'utils/encrypt';

const DedupeMatchTable = props => {
	const { addToast } = useToasts();

	const { data, selectedProduct } = props;
	if (!data || data.length === 0) {
		return null;
	}

	const userDetails = JSON.parse(sessionStorage?.getItem('userDetails'));
	const userToken = sessionStorage?.getItem('userToken');

	// Extract the headers from the first object in the data array
	// const headers = Object.keys(data[0]);

	// This can be later passed as props
	const HEADER_MAPPING = {
		loan_ref_id: 'Loan ID',
		match: 'Match %',
		name: 'Name',
		product: 'Product',
		branch: 'Branch',
		amount: 'Amount',
		stage: 'Stage',
	};
	const columns = Object.keys(HEADER_MAPPING);

	const pointerEventsAllowed = selectedProduct?.product_details?.allow_users_to_view_internal_dedupe?.includes(
		userDetails?.user_sub_type || userDetails?.usertype
		// 'bbm'
	);

	const redirectToProductPageInEditMode = loanData => {
		if (!loanData?.loan_ref_id || !loanData?.product_id) {
			addToast({
				message: 'Something went wrong, try after sometimes',
				type: 'error',
			});
			return;
		}
		// sessionStorage.clear();
		const editLoanRedirectObject = {
			userId: userDetails?.id,
			loan_ref_id: loanData?.loan_ref_id,
			token: userToken,
			view: true,
		};
		const redirectURL = `/nconboarding/applyloan/product/${btoa(
			loanData?.product_id
		)}?token=${encryptReq(editLoanRedirectObject)}`;
		window.open(redirectURL, '_self');
	};

	return (
		<UI.Table>
			<thead>
				<UI.TableRow>
					{columns.map(header => (
						<UI.TableHeader key={header}>
							{HEADER_MAPPING[header]}
						</UI.TableHeader>
					))}
				</UI.TableRow>
			</thead>
			<tbody>
				{console.log(selectedProduct, userDetails, pointerEventsAllowed)}
				{data.map((item, index) => (
					<UI.TableRow
						key={index}
						style={{
							pointerEvents: pointerEventsAllowed ? 'auto' : 'none',
							background: pointerEventsAllowed
								? null
								: ' rgba(236, 240, 241, 0.9)',
						}}
						onClick={() => {
							redirectToProductPageInEditMode(item);
						}}
					>
						{columns.map(column => (
							<UI.TableCell key={column}>
								{column === 'match' ? (
									<>
										{item[column]}
										<UI.ProgressBar>
											<UI.ProgressFiller
												percentage={parseInt(item[column], 10)}
											/>
										</UI.ProgressBar>
									</>
								) : (
									item[column]?.branch || item[column] || '---'
								)}
							</UI.TableCell>
						))}
					</UI.TableRow>
				))}
			</tbody>
		</UI.Table>
	);
};

export default DedupeMatchTable;
