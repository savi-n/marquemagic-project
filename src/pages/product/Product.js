/* This file defines the side menu that is seen in loan application creation journey */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { setSelectedProduct, setSelectedSectionId } from 'store/appSlice';
import { string } from 'prop-types';
import { PRODUCT_DETAILS_URL } from '_config/app.config';
import useFetch from 'hooks/useFetch';
import ProductIndividual from 'pages/product/ProductIndividual';

export default function Product(props) {
	const { product } = props;
	const { app } = useSelector(state => state);
	const dispatch = useDispatch();

	const { userDetails, whiteLabelId, isViewLoan } = app;

	const { response } = useFetch({
		url: `${PRODUCT_DETAILS_URL({ whiteLabelId, productId: atob(product) })}`,
		options: { method: 'GET' },
	});

	useEffect(() => {
		console.log({ reqType: response?.data?.loan_request_type, response });
		if (response) {
			const selectedProductRes = _.cloneDeep(response.data);
			// New Individual loan changes for displaying sections based on the config - starts
			if (isViewLoan) {
				const tempSections = _.cloneDeep(
					selectedProductRes?.product_details?.sections
				);

				const flowData = tempSections?.filter(section => {
					if (section?.hide_section_usertype) {
						return (
							!section?.hide_section_usertype?.includes(
								userDetails?.usertype
								// 'Sales' - for reference
							) &&
							!section?.hide_section_usertype?.includes(
								userDetails?.user_sub_type
								// 'RCU' - for reference
							)
						);
					} else {
						return tempSections;
					}
				});
				selectedProductRes.product_details.sections = flowData;
			}
			// New Individual loan changes for displaying sections based on the config - ends

			dispatch(setSelectedProduct(selectedProductRes));
			dispatch(
				setSelectedSectionId(
					selectedProductRes?.product_details?.sections[0]?.id
				)
			);
			if (response?.data?.loan_request_type) {
				response.data.product_details.loan_request_type =
					response?.data?.loan_request_type;
			}
		}
		// eslint-disable-next-line
	}, [response]);

	return <ProductIndividual />;
}

Product.propTypes = {
	product: string.isRequired,
};
