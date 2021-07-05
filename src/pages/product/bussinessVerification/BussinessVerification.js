import { useState, useContext } from "react";
import { func, object, oneOfType, string } from "prop-types";
import styled from "styled-components";

import Button from "../../../components/Button";
import {
  ROC_DATA_FETCH,
  LOGIN_CREATEUSER,
  WHITELABEL_ENCRYPTION_API,
  SEARCH_COMPANY_NAME,
  NC_STATUS_CODE,
} from "../../../_config/app.config";
import { AppContext } from "../../../reducer/appReducer";
import { BussinesContext } from "../../../reducer/bussinessReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import useForm from "../../../hooks/useForm";
import useFetch from "../../../hooks/useFetch";
import { useToasts } from "../../../components/Toast/ToastProvider";
import CompanySelectModal from "../../../components/CompanySelectModal";

const Colom1 = styled.div`
  flex: 1;
  padding: 50px;
`;

const Colom2 = styled.div`
  width: 30%;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: ${({ theme }) => theme.main_theme_color};
  }
`;

const FieldWrapper = styled.div`
  padding: 20px 0;
  width: 50%;
`;

const H2 = styled.h2`
  width: 50%;
  text-align: center;
  font-weight: 500;
`;

function formatCompanyData(data) {
  let directors = {};

  for (const [i, dir] of data["directors/signatory_details"].entries()) {
    directors[`directors_${i}`] = {
      ddin_no: dir["din/pan"],
    };
  }

  return {
    BusinessName: data.company_master_data.company_name,
    Email: data.company_master_data.email_id,
    PancardNumber: "",
    CIN: data.company_master_data["cin "],
    DirectorDetails: directors,
    unformatedData: data,
  };
}

export default function BussinessDetails({
  productDetails,
  map,
  onFlowChange,
  id,
}) {
  const {
    state: { whiteLabelId, bankToken },
  } = useContext(AppContext);

  const {
    actions: { setCompanyDetails },
  } = useContext(BussinesContext);

  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const { newRequest } = useFetch();
  const { register, handleSubmit, formState } = useForm();

  const { addToast } = useToasts();

  const [loading, setLoading] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [companyListModal, setCompanyListModal] = useState(false);

  const onCompanySelect = (cinNumber) => {
    setCompanyListModal(false);
    setLoading(true);
    cinNumberFetch(cinNumber);
  };

  const companyNameSearch = async (companyName) => {
    const companyNameSearchReq = await newRequest(
      SEARCH_COMPANY_NAME,
      {
        method: "POST",
        data: {
          search: companyName,
        },
      },
      {}
    );

    const companyNameSearchRes = companyNameSearchReq.data;

    if (companyNameSearchRes.status === NC_STATUS_CODE.OK) {
      setCompanyListModal(true);
      setCompanyList(companyNameSearchRes.data);
    }
  };

  const cinNumberFetch = async (cinNumber) => {
    const cinNumberResponse = await newRequest(
      ROC_DATA_FETCH,
      {
        method: "POST",
        data: {
          cin_number: cinNumber,
        },
      },
      { authorization: bankToken }
    );

    const companyData = cinNumberResponse.data;

    if (companyData.status === NC_STATUS_CODE.OK) {
      const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
        method: "POST",
        data: {
          email: companyData.data.company_master_data.email_id,
          white_label_id: whiteLabelId,
          source: "Clixcapital",
          name: companyData.data.company_master_data.company_name,
          mobileNo: "9999999999",
          addrr1: "",
          addrr2: "",
        },
      });

      const userDetailsRes = userDetailsReq.data;

      if (userDetailsRes.statusCode === NC_STATUS_CODE.NC200) {
        const encryptWhiteLabelReq = await newRequest(
          WHITELABEL_ENCRYPTION_API,
          {
            method: "GET",
          },
          { Authorization: `Bearer ${userDetailsRes.token}` }
        );

        const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

        if (encryptWhiteLabelRes.status === NC_STATUS_CODE.OK)
          setCompanyDetails({
            token: userDetailsRes.token,
            userId: userDetailsRes.userId,
            branchId: userDetailsRes.branchId,
            encryptedWhitelabel: encryptWhiteLabelRes.encrypted_whitelabel[0],
            ...formatCompanyData(companyData.data),
          });
        onProceed();
        return;
      }
    }
  };

  const onSubmit = async ({ companyName, cinNumber }) => {
    if (!companyName && !cinNumber) {
      return;
    }

    setLoading(true);

    try {
      if (cinNumber) {
        await cinNumberFetch(cinNumber);
      }

      if (companyName) {
        await companyNameSearch(companyName);
      }
    } catch (error) {
      console.error(error);
      addToast({
        message: error.message || "Something Went Wrong. Try Again!",
        type: "error",
      });
    }

    setLoading(false);
  };

  const onProceed = () => {
    setCompleted(id);
    onFlowChange(map.main);
  };

  return (
    productDetails && (
      <>
        <Colom1>
          {/* <H>
            Help us with your <span>Identity Verification</span>
          </H> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper>
              {register({
                name: "companyName",
                placeholder: "Enter Company Name",
                value: formState?.values?.companyName,
              })}
            </FieldWrapper>
            <H2>or</H2>
            <FieldWrapper>
              {register({
                name: "cinNumber",
                placeholder: "Enter CIN Number",
                value: formState?.values?.cinNumber,
              })}
            </FieldWrapper>
            <Button
              type="submit"
              name={loading ? "Please wait..." : "SUBMIT"}
              fill
              disabled={
                !(
                  formState.values?.companyName || formState.values?.cinNumber
                ) ||
                (formState.values?.companyName &&
                  formState.values?.cinNumber) ||
                loading
              }
            />
          </form>
        </Colom1>
        <Colom2>
          <Img src={productDetails.productDetailsImage} alt="Loan Caption" />
        </Colom2>
        {
          <CompanySelectModal
            show={companyListModal}
            companyList={companyList}
            onClose={() => setCompanyListModal(false)}
            onCompanySelect={onCompanySelect}
          />
        }
      </>
    )
  );
}

BussinessDetails.propTypes = {
  productDetails: object,
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
};
