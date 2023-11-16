import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';
import useFetch from 'hooks/useFetch';
import { PRODUCT_DETAILS_URL } from '_config/app.config';

import ApplicantCoApplicantHeader from 'components/ApplicantCoApplicantHeader';
import SideNav from 'components/SideNav';
import BasicDetails from 'components/Sections/BasicDetails';
import Loading from 'components/Loading';

import AddressDetails from 'components/Sections/AddressDetails';
import EmploymentDetails from 'components/Sections/EmploymentDetails';
import LoanDetails from 'components/Sections/LoanDetails/LoanDetails';
import CollateralDetails from 'components/Sections/CollateralDetails';
import BankDetails from 'components/Sections/BankDetails';
import DocumentUpload from 'components/Sections/DocumentUpload';
import ReferenceDetails from 'components/Sections/ReferenceDetails';
import EMIDetails from 'components/Sections/EMIDetails';
import ApplicationSubmitted from 'components/Sections/ApplicationSubmitted';
import BusinessDetails from 'components/Sections/BusinessDetails/BusinessDetails';
import LiabilitysDetails from 'components/Sections/LiabilitysDetails';
import AssetsDetails from 'components/Sections/AssetsDetails';
import SubsidiaryDetails from 'components/Sections/SubsidiaryDetails';
import PowerOfAtterneyDetails from 'components/Sections/PowerOfAtterneyDetails';
import _ from 'lodash';
import {
	setIsTestMode,
	setBankList,
	setSelectedProduct,
	setSelectedSectionId,
} from 'store/appSlice';
import iconDottedRight from 'assets/images/bg/Landing_page_dot-element.png';
import * as UI from './ui';
import { sleep } from 'utils/helper';
import { BANK_LIST_FETCH, TEST_DOMAINS } from '_config/app.config';
import ConsentDetails from 'components/Sections/ConsentDetails';
import BusinessAddressDetails from 'components/Sections/BusinessAddressDetails';
// import AddressDetailsEDI from 'components/Sections/BusinessAddressDetailsEEDI';

import ShareholderDetails from 'components/Sections/ShareholderDetails';
import { DOCUMENT_UPLOAD_SECTION_ID } from 'components/Sections/const';
import { DIRECTOR_TYPES, setAddNewDirectorKey } from 'store/directorsSlice';
import BusinessAddressDetailsEdi from 'components/Sections/BusinessAddressDetailsEDI';
import PrioritySectorDetails from 'components/Sections/PrioritySector';
import VehicleDetails from 'components/Sections/VehicleDetails';
const Product = props => {
	const { product } = props;
	const reduxState = useSelector(state => state);
	const { directors } = useSelector(state => state);
	const { selectedDirectorId } = directors;
	const { app } = reduxState;
	const {
		selectedSectionId,
		directorSectionIds,
		userToken,
		isTestMode,
		userDetails,
		whiteLabelId,
		isViewLoan,
		isEditOrViewLoan,
	} = app;
	const { response } = useFetch({
		url: `${PRODUCT_DETAILS_URL({
			whiteLabelId,
			productId: atob(product),
		})}`,
		options: { method: 'GET' },
		headers: { Authorization: `Bearer ${userToken}` },
	});
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const SELECTED_SECTION_MAPPING = {
		//TODO Bikash & Akshat - change to the respective components
		business_details: BusinessDetails, // change to the respective components
		business_address_details: BusinessAddressDetails, // change to the respective components
		business_address_details_edi: BusinessAddressDetailsEdi,
		priority_sector_details: PrioritySectorDetails,
		basic_details: BasicDetails,
		loan_address_details: AddressDetails,
		employment_details: EmploymentDetails,
		loan_details: LoanDetails,
		collateral_details: CollateralDetails,
		bank_details: BankDetails,
		document_upload: DocumentUpload,
		reference_details: ReferenceDetails,
		emi_details: EMIDetails,
		liability_details: LiabilitysDetails,
		assets_details: AssetsDetails,
		vehicle_details: VehicleDetails,
		application_submitted: ApplicationSubmitted,
		consent_details: ConsentDetails,
		subsidiary_details: SubsidiaryDetails,
		shareholder_details: ShareholderDetails,
		poa_details: PowerOfAtterneyDetails,
	};
	let SelectedComponent =
		SELECTED_SECTION_MAPPING?.[selectedSectionId] || BasicDetails;

	useEffect(() => {
		// console.log({ reqType: response?.data?.loan_request_type, response });
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
						return section;
					}
				});
				selectedProductRes.product_details.sections = flowData;
			}

			// if (!isViewLoan) {
			const tempSections = _.cloneDeep(
				selectedProductRes?.product_details?.sections
			);

			const flowDataSections = tempSections?.filter(section => {
				if (section?.remove_section_for_usertype) {
					return (
						!section?.remove_section_for_usertype?.includes(
							userDetails?.usertype
						) &&
						!section?.remove_section_for_usertype?.includes(
							userDetails?.user_sub_type
						)
					);
				} else {
					return section;
				}
			});
			selectedProductRes.product_details.sections = flowDataSections;
			// }

			// New Individual loan changes for displaying sections based on the config - ends
			dispatch(setSelectedProduct(selectedProductRes));
			dispatch(
				setSelectedSectionId(
					selectedProductRes?.product_details?.sections?.[0]?.id
				)
			);
			if (
				selectedProductRes?.loan_request_type === 2 &&
				!isEditOrViewLoan &&
				Object.keys(directors).length <= 0
			) {
				dispatch(setAddNewDirectorKey(DIRECTOR_TYPES.applicant));
			}
			if (response?.data?.loan_request_type) {
				response.data.product_details.loan_request_type =
					response?.data?.loan_request_type;
			}
		}

		// eslint-disable-next-line
	}, [response]);
	// for reseting formstate
	useEffect(() => {
		if (!selectedSectionId) return;

		// doc upload get api is called only once for all directors so avoid rerender
		if (selectedSectionId === DOCUMENT_UPLOAD_SECTION_ID) return;

		setLoading(true);
		sleep(100).then(res => {
			setLoading(false);
		});
	}, [selectedSectionId, selectedDirectorId, isTestMode]);

	// useEffect(() => {
	// 	console.log('Product-allStates-', {
	// 		reduxState,
	// 	});
	// }, [reduxState]);

	const getBankList = () => {
		try {
			axios.get(BANK_LIST_FETCH).then(res => {
				const newBankList = [];
				res?.data?.map(bank => {
					newBankList.push({
						value: `${bank?.id}`,
						name: `${bank?.bankname}`,
					});
					return null;
				});
				dispatch(setBankList(newBankList));
			});
		} catch (error) {
			console.error('error-getbanklist-', error);
		}
	};

	useEffect(() => {
		if (!userToken) return;
		// console.log('setting default header axios-');
		axios.defaults.headers.Authorization = `Bearer ${userToken}`;
		getBankList();
		// dispatch(setSelectedSectionId(nextSectionId));
		// eslint-disable-next-line
	}, [userToken]);

	useEffect(() => {
		if (TEST_DOMAINS.includes(window.location.hostname)) {
			const params = queryString.parse(window.location.search);
			if (params.isTestMode) {
				dispatch(setIsTestMode(true));
			} else {
				dispatch(setIsTestMode(false));
			}
		}
		// eslint-disable-next-line
	}, []);

	return (
		<>
			{!response ? (
				<Loading />
			) : (
				<UI.Wrapper>
					{/* {selectedSectionId !== 'application_submitted' && <SideNav />} */}
					<SideNav />
					<UI.RightSectionWrapper>
						<UI.IconDottedRight src={iconDottedRight} alt='dot' />
						<UI.DynamicSectionWrapper>
							{[...(directorSectionIds || []), 'document_upload']?.includes(
								selectedSectionId
							) && <ApplicantCoApplicantHeader />}
							<UI.DynamicSubSectionWrapper>
								{loading ? <div /> : <SelectedComponent />}
							</UI.DynamicSubSectionWrapper>
						</UI.DynamicSectionWrapper>
					</UI.RightSectionWrapper>
				</UI.Wrapper>
			)}
		</>
	);
};

export default Product;
