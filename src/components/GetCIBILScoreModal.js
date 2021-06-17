import { useEffect, useContext, useRef } from "react";

import Loading from "../components/Loading";
import {
  FETCH_CIBIL_SCORE,
  NC_STATUS_CODE,
  BANK_TOKEN_API,
} from "../_config/app.config";
import { AppContext } from "../reducer/appReducer";
import useFetch from "../hooks/useFetch";
import Modal from "./Modal";

export default function GetCIBILScoreModal({ onClose, userData }) {
  const bankTokenRef = useRef();

  const { newRequest } = useFetch();

  const {
    state: { clientToken },
  } = useContext(AppContext);

  useEffect(() => {
    async function getBankToken() {
      try {
        const bankTokenReq = await newRequest(
          BANK_TOKEN_API,
          {
            method: "POST",
            data: {
              type: "EQFAX",
              linkRequired: false,
              isEncryption: false,
            },
          },
          {
            authorization: clientToken,
          }
        );

        const bankTokenRes = bankTokenReq?.data;

        if (bankTokenRes.statusCode === NC_STATUS_CODE.NC200) {
          bankTokenRef.current = {
            bankToken: bankTokenRes.generated_key,
            requestId: bankTokenRes.request_id,
          };
          await fetchData();
        }
      } catch (error) {
        onClose(false, { message: "Something Went Wrong Try Again Later" });
      }
    }

    if (
      Object.entries(userData).length === 0 &&
      userData.constructor === Object
    ) {
      onClose(false, { message: "Data not available" });
      return;
    }

    getBankToken();
    return () => {};
  }, []);

  async function fetchData() {
    try {
      const req = await newRequest(
        FETCH_CIBIL_SCORE,
        {
          method: "POST",
          data: {
            requestFrom: "CUB",
            transactionAmount: userData.loanAmount,
            fullName: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            inquiryAddresses: {
              addressLine: `${userData.address[0].address1 || ""} ${userData
                .address[0].address2 || ""} ${userData.address[0].address3 ||
                ""}`,
              city: userData.address[0].city,
              state: userData.address[0].state,
              postal: userData.address[0].pinCode,
            },
            inquiryPhones: [
              {
                number: userData.mobileNo,
                phoneType: "M",
              },
            ],
            dob: userData.dob,
            panNumber: userData.panNumber,
            nationalIdCard: "",
            passportId: "",
            voterId: "",
            driverLicense: "",
          },
        },
        { authorization: bankTokenRef.current.bankToken }
      );

      const res = req.data;
      if (res.statusCode === NC_STATUS_CODE.NC200) {
        onClose(true, {
          ...bankTokenRef.current,
          cibilScore: res.cibilScore,
          message: "CIBIL Fetch Completed Successfully",
        });
      } else {
        onClose(false, { message: res.message });
      }
    } catch (error) {
      onClose(false, { message: "Something Went Wrong Try Again Later" });
    }
  }

  return (
    <Modal show={true} onClose={() => {}} width="50%">
      <Loading />
    </Modal>
  );
}
