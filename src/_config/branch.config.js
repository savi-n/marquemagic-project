import { API_END_POINT } from "./app.config";
import taggedTemplate from "../utils/taggedTemplate";

export const BRANCH_LOGIN_API = `${API_END_POINT}/cub/branchFlowLOgin`;

export const BRANCH_UPDATE_CASE_API = `${API_END_POINT}/cub/updateCase`;

export const BRANCH_COLLATERAL_DETAILS = taggedTemplate`${API_END_POINT}/cubCollateral/getCollateralDetails?custAccNo=${"custAccNo"}&loanID=${"loanID"}
`;

export const BRANCH_COLLATERAL_SELCTED = taggedTemplate`${API_END_POINT}/cubCollateral/saveCollateralDetails?loanID=${"loanId"}&pickedCollateralNumber=${"collateral"}
`;

export const BRANCH_COLLATERAL_UPDATE = taggedTemplate`${API_END_POINT}/cubCollateral/saveCollateralDetails?loanID=${"loanId"}&updatedCollateralDetails=${"collateral"}
`;
