import useFetch from "../hooks/useFetch";
import { BRANCH_UPDATE_CASE_API } from "../_config/branch.config";
import { NC_STATUS_CODE } from "../_config/app.config";

export default function useCaseUpdate() {
  const { newRequest } = useFetch();

  async function caseUpdateReq(formData, userToken) {
    try {
      const caseUpdateReq = await newRequest(
        BRANCH_UPDATE_CASE_API,
        {
          method: "POST",
          formData,
        },
        {
          Authorization: `Bearer ${userToken}`,
        }
      );
      const caseUpdateRes = caseUpdateReq.data;
      if (
        caseUpdateRes.statusCode === NC_STATUS_CODE.NC200 ||
        caseUpdateRes.status === NC_STATUS_CODE.OK
      ) {
        return caseUpdateRes;
      }

      throw new Error(caseUpdateRes.message);
    } catch (er) {
      console.log("STEP: 1 => CASE UPDATION ERRROR", er.message);
      throw new Error(er.message);
    }
  }

  async function caseUpdateInit(formData, userToken) {
    await caseUpdateReq(formData, userToken);
  }

  return { caseUpdateInit };
}
