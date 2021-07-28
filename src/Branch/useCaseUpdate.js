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

  async function caseUpdateInit(formData, userToken, loanId, bussinessId) {
    // {
    //     "applicantData": {
    //         "firstName": "savi",
    //         "lastName": "n",
    //         "panNumber": "bfbsgshj67",
    //         "email": "bhjcdhdhj@nc.co",
    //         "mobileNo": "55665665",
    //         "business_id": 1234569370,
    //         "address": {
    //             "aid" : 1,
    //             "address1": "",
    //             "address2": "sx",
    //             "address3": "xx",
    //             "address4": "scsad",
    //             "city": "sa",
    //             "state": "sss",
    //             "pinCode": "213232"
    //         },
    //         "grossIncome": "",
    //         "netMonthlyIncome": "",
    //     },
    //     "loanData": {
    //         "loan_id": 22344,
    //         "loanAmount": "100000",
    //         "tenure": "200000",
    //         "assetsValue": "",
    //         "loanTypeId": "7",
    //         "summary": "bncbjbjkaghgfhkagggygeyGD",
    //         "productId": ""
    //     },
    //     "loanAssetData": {
    //         "id": 110,
    //         "property_type": "leased",
    //         "loan_asset_type_id": 2,
    //         "owned_type": "paid_off",
    //         "address1": "test address1",
    //         "address2": "test address2",
    //         "flat_no": "112",
    //         "locality": "ramnagar",
    //         "city": "banglore",
    //         "pincode": "570000",
    //         "name_landmark": "SI ATM",
    //         "automobile_type": "qw",
    //         "brand_name": "d",
    //         "model_name": "fd",
    //         "value_Vehicle": "122",
    //         "dealership_name": "sd",
    //         "manufacturing_yr": "123",
    //         "Value": "test@123",
    //         "cersai_rec_path": "",
    //         "survey_no": "",
    //         "cersai_asset_id": "",
    //         "no_of_assets": "",
    //         "type_of_land": 5,
    //         "forced_sale_value": "",
    //         "sq_feet": "",
    //         "insurance_required": "",
    //         "priority": "",
    //         "ec_applicable": "YES"
    //     },
    //     "directorData": [
    //         {
    //             "director_id": 8735,
    //             "firstName": "asa",
    //             "lastName": "fed",
    //             "email": "sggfg@gnail.com",
    //             "dob": "05-06-1995",
    //             "panNumber": "",
    //             "aadhaar": "",
    //             "incomeType": "salaried",
    //             "residenceStatus": "Resident",
    //             "countryResidence": "",
    //             "maritalStatus": "Single",
    //             "cibilScore": ""
    //         }
    //     ]
    //     }

    const formatedData = {
      applicantData: {
        firstName: formData,
        lastName: formData,
        panNumber: formData,
        email: formData,
        mobileNo: formData,
        business_id: bussinessId,
        address: {
          aid: 1,
          address1: "",
          address2: "sx",
          address3: "xx",
          address4: "scsad",
          city: "sa",
          state: "sss",
          pinCode: "213232",
        },
        grossIncome: "",
        netMonthlyIncome: "",
      },
      loanData: {
        loan_id: loanId,
      },
    };

    await caseUpdateReq(formatedData, userToken);
  }

  return { caseUpdateInit };
}
