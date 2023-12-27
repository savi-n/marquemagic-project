import React from 'react';
import * as UI from './ui';
import { useToasts } from 'components/Toast/ToastProvider';
import { encryptReq } from 'utils/encrypt';
import MatchParameterPopover from './MatchParameterPopover';

const DedupeMatchTable = props => {
	const { addToast } = useToasts();

	const { data, selectedProduct, matchType } = props;
	if (!data || data.length === 0) {
		return <UI.NoDataText>No Matches Found</UI.NoDataText>;
	}

	const userDetails = JSON.parse(sessionStorage?.getItem('userDetails'));
	const userToken = sessionStorage?.getItem('userToken');

	// Extract the headers from the first object in the data array
	// const headers = Object.keys(data[0]);

	// This can be later passed as props
	const tableKeysObject = {
		'Application Match': {
			HEADER_MAPPING: {
				loan_ref_id: 'Loan ID',
				match: 'Match %',
				name: 'Name',
				product: 'Product',
				income_type: 'Income Type',
				source: 'Loan Source',
				branch: 'Branch',
				loan_amount: 'Loan Amount',
				stage: 'Stage',
			},
		},

		'Customer Match': {
			HEADER_MAPPING: {
				loan_ref_id: 'Loan ID',
				match: 'Match %',
				name: 'Name',
				product: 'Product',
				income_type: 'Income Type',
				source: 'Loan Source',
				branch: 'Branch',
				loan_amount: 'Loan Amount',
				stage: 'Stage',
				ucic_no: 'UCIC',
				customer_type: 'Customer Type',
			},
		},
		'Negative List Match': {
			HEADER_MAPPING: {
				loan_ref_id: 'Loan ID',
				match: 'Match %',
				name: 'Name',
				product: 'Product',
				income_type: 'Income Type',
				source: 'Loan Source',
				branch: 'Branch',
				loan_amount: 'Loan Amount',
				stage: 'Stage',
				ucic_no: 'UCIC',
				customer_type: 'Customer Type',
			},
		},
	};
	const columns = Object.keys(tableKeysObject?.[matchType]?.['HEADER_MAPPING']);

	const pointerEventsAllowed =
		selectedProduct?.product_details?.allow_users_to_view_internal_dedupe?.includes(
			userDetails?.usertype
		) ||
		selectedProduct?.product_details?.allow_users_to_view_internal_dedupe?.includes(
			userDetails?.user_sub_type
		);

	const redirectToProductPageInViewMode = loanData => {
		try {
			if (!loanData?.loan_ref_id || !loanData?.loan_product_id) {
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
				loanData?.loan_product_id
			)}?token=${encryptReq(editLoanRedirectObject)}`;
			window.open(redirectURL, '_self');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<UI.Table>
			<thead>
				<UI.TableRow>
					{columns.map(header => (
						<UI.TableHeader key={header}>
							{tableKeysObject?.[matchType]?.['HEADER_MAPPING']?.[header]}
						</UI.TableHeader>
					))}
				</UI.TableRow>
			</thead>
			<tbody>
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
							redirectToProductPageInViewMode(item);
						}}
					>
						{columns.map(column => (
							<UI.TableCell key={column}>
								{column === 'match' ? (
									<MatchParameterPopover data={item?.parameters}>
										<span
											style={{
												pointerEvents: 'auto',
											}}
										>
											{item[column]}
											<UI.ProgressBar>
												<UI.ProgressFiller
													percentage={parseInt(item[column], 10)}
												/>
											</UI.ProgressBar>
										</span>
									</MatchParameterPopover>
								) : column === 'source' ? (
									item?.source_data?.source === 'Connector' ? (
										`Connector/${item?.source_data?.source}`
									) : (
										item?.source_data?.source || '---'
									)
								) : column === 'branch' ? (
									item?.source_data?.branch?.name || '---'
								) : (
									item[column] || '---'
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
