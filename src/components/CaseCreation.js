import { useContext, useState } from 'react';

import useFetch from '../hooks/useFetch';
import { useToasts } from '../components/Toast/ToastProvider';
import { UserContext } from '../reducer/userReducer';
import { FormContext } from '../reducer/formReducer';
import { AppContext } from '../reducer/appReducer';
import { CaseContext } from '../reducer/caseReducer';
import {
	CREATE_CASE,
	BORROWER_UPLOAD_URL,
	UPLOAD_CUB_STATEMENT,
	CREATE_CASE_OTHER_USER,
	NC_STATUS_CODE,
	USER_ROLES,
} from '../_config/app.config';

export default function useCaseCreation(userType, productId, role) {
	const {
		state: { userId, userToken },
	} = useContext(UserContext);

	const { state } = useContext(FormContext);

	const {
		state: { whiteLabelId, clientToken },
	} = useContext(AppContext);

	const {
		state: { caseDetails },
		actions: { setCase },
	} = useContext(CaseContext);

	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const [processing, setProcessing] = useState(false);

	// step: 1 if applicant submit request createCase
	const createCaseReq = async (data, url) => {
		try {
			const caseReq = await newRequest(
				url,
				{
					method: 'POST',
					data,
				},
				{
					Authorization: `Bearer ${userToken}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.log('STEP: 1 => CASE CREATION ERRROR', er.message);
			throw new Error(er.message);
		}
	};

	// step 2: upload docs reference
	const updateDocumentList = async (loanId, directorId, user) => {
		if (!state[user]?.uploadedDocs?.length) {
			return true;
		}

		try {
			const uploadDocsReq = await newRequest(
				BORROWER_UPLOAD_URL,
				{
					method: 'POST',
					data: {
						upload_document: state[user]?.uploadedDocs?.map(({ id, ...d }) => ({
							...d,
							loan_id: loanId,
							...(d.typeId && { doc_type_id: d.typeId }),
							directorId,
						})),
						directorId,
					},
				},
				{
					Authorization: `Bearer ${userToken}`,
				}
			);

			const uploadDocsRes = uploadDocsReq.data;
			if (uploadDocsRes.status === NC_STATUS_CODE.OK) {
				return uploadDocsRes;
			}
			throw new Error(uploadDocsRes.message);
		} catch (err) {
			console.log('STEP: 2 => UPLOAD DOCUMENT REFERENCE ERRRO', err.message);
			throw new Error(err.message);
		}
	};

	// step: 3 upload cub statements to sails
	const updateRefernceToSails = async (
		loanId,
		directorId,
		token,
		requestId
	) => {
		if (!requestId.length) {
			return true;
		}
		try {
			const statementUploadReq = await newRequest(
				UPLOAD_CUB_STATEMENT,
				{
					method: 'POST',
					data: {
						access_token: token,
						request_id: requestId,
						directorId: directorId,
						loan_id: loanId,
						doc_type_id: 6,
					},
				},
				{
					Authorization: `${clientToken}`,
				}
			);

			const statementUploadRes = statementUploadReq.data;

			if (statementUploadRes.statusCode === NC_STATUS_CODE.NC200) {
				return statementUploadRes;
			}

			throw new Error(statementUploadRes.message);
		} catch (err) {
			console.log(
				'STEP: 3 => CUB STATEMENT UPLOAD TO SAILS ERRROR',
				err.message
			);
			throw new Error(err.message);
		}
	};

	// step 4: loan asset upload
	// const loanAssetsUpload = async (loanId, data) => {
	//   const submitReq = await newRequest(
	//     UPDATE_LOAN_ASSETS,
	//     {
	//       method: "POST",
	//       data: {
	//         loanId: loanId,
	//         propertyType: "leased",
	//         loan_asset_type_id: 2,
	//         ownedType: "paid_off",
	//         address1: "test address1",
	//         address2: "test address2",
	//         flat_no: "112",
	//         locality: "ramnagar",
	//         city: "banglore",
	//         pincode: "570000",
	//         landmark: "SI ATM",
	//         autoMobileType: "qw",
	//         brandName: "d",
	//         modelName: "fd",
	//         vehicalValue: "122",
	//         dealershipName: "sd",
	//         manufacturingYear: "123",
	//         Value: "test@123",
	//         ints: "",
	//         cpath: "",
	//         surveyNo: "",
	//         cAssetId: "",
	//         noOfAssets: 5,
	//       },
	//     },
	//     {
	//       Authorization: `Bearer ${userToken}`,
	//     }
	//   );
	//   return submitReq;
	// };

	const caseCreationSteps = async (data, referenceData) => {
		try {
			// step 1: create case
			const caseCreateRes = await createCaseReq(data, CREATE_CASE);

			// step 2: upload documents reference [loanId from createcase]
			await updateDocumentList(
				caseCreateRes.loanId,
				caseCreateRes.directorId,
				USER_ROLES.User
			);

			// step 3: upload cub statement to sailspld
			if (referenceData.length) {
				await updateRefernceToSails(
					caseCreateRes.loanId,
					caseCreateRes.directorId,
					userToken,
					referenceData
				);
			}

			return caseCreateRes;
		} catch (er) {
			console.log('APPLICANT CASE CREATE STEP ERROR-----> ', er.message);
			addToast({
				message: er.message,
				type: 'error',
			});
		}
	};

	const caseCreationReqOtherUser = async (loan, role, requestId) => {
		if (!loan) return false;
		try {
			setProcessing(true);
			const caseReq = await createCaseReq(
				{
					loan_ref_id: loan.loan_ref_id,
					applicantData: {
						...state[USER_ROLES[role]].applicantData,
						...(state[USER_ROLES[role]]?.emi?.length
							? {
									emiDetails: state[USER_ROLES[role]]?.emi?.map(em => ({
										emiAmount: em.amount,
										bank_name: em.bank,
									})),
							  }
							: {}),
					},
					...state[USER_ROLES[role]].loanData,
					cibilScore: state[USER_ROLES[role]]?.cibilData?.cibilScore || '',
				},
				CREATE_CASE_OTHER_USER
			);

			await updateDocumentList(
				loan.loanId,
				caseReq.directorId,
				USER_ROLES[role]
			);
			if (requestId.length) {
				await updateRefernceToSails(
					loan.loanId,
					caseReq.directorId,
					userToken,
					requestId
				);
			}
			setProcessing(false);

			return true;
		} catch (err) {
			console.log('COAPPLICANT CASE CREATION STEPS ERRRO ==> ', err.message);
			addToast({
				message: err.message,
				type: 'error',
			});
			setProcessing(false);

			return false;
		}
	};

	async function caseCreationUser() {
		try {
			setProcessing(true);
			const loanReq = await caseCreationSteps(
				{
					white_label_id: whiteLabelId || sessionStorage.getItem('wt_lbl'),
					product_id: productId,
					branchId: sessionStorage.getItem('branchId'),
					applicantData: {
						...state.user.applicantData,
						...(state.user?.emi
							? {
									emiDetails: state.user?.emi?.map(em => ({
										emiAmount: em.amount,
										bank_name: em.bank,
									})),
							  }
							: {}),
					},
					loanData: { assetsValue: 0, ...state.user.loanData, productId },
					...state.user.bankData,
					cibilScore: state[USER_ROLES[role]]?.cibilData?.cibilScore || '',
				},
				[
					...(state[USER_ROLES[role]]?.cubStatement?.requestId
						? [state[USER_ROLES[role]]?.cubStatement?.requestId]
						: []),
					...(state[USER_ROLES[role]]?.cibilData?.requestId
						? [state[USER_ROLES[role]]?.cibilData?.requestId]
						: []),
				]
			);

			if (!loanReq) {
				setProcessing(false);
				return false;
			}
			setCase(loanReq);
			setProcessing(false);

			return true;
		} catch (err) {
			setProcessing(false);
			console.log('APPLICANT CASE CREATION INIT ERRRO ==> ', err.message);
			return false;
		}
	}

	async function caseCreationUserType() {
		try {
			const coAppilcantCaseReq = await caseCreationReqOtherUser(
				caseDetails,
				role,
				[
					...(state[role]?.cibilData?.requestId
						? [state[role]?.cibilData?.requestId]
						: []),
					...(state[role].cubStatement?.requestId
						? [state[role].cubStatement?.requestId]
						: []),
				]
			);
			if (!coAppilcantCaseReq) {
				return false;
			}

			return true;
		} catch (err) {
			console.log('OTHER APPLICANT CASE CREATION INIT ERRRO ==> ', err.message);
			return false;
		}
	}

	return {
		processing,
		caseCreationUser: caseCreationUser,
		caseCreationUserType: caseCreationUserType,
	};
}
