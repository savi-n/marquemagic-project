import { useState, useContext, useEffect } from "react";
import { func, object, oneOfType, string } from "prop-types";
import styled from "styled-components";

import Button from "../../../components/Button";
import {
  ROC_DATA_FETCH,
  LOGIN_CREATEUSER,
  WHITELABEL_ENCRYPTION_API,
  SEARCH_COMPANY_NAME,
  NC_STATUS_CODE,
  APP_CLIENT,
  DOCS_UPLOAD_URL_LOAN,
  PINCODE_ADRRESS_FETCH,
} from "../../../_config/app.config";
import { AppContext } from "../../../reducer/appReducer";
import { BussinesContext } from "../../../reducer/bussinessReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import useForm from "../../../hooks/useForm";
import useFetch from "../../../hooks/useFetch";
import { useToasts } from "../../../components/Toast/ToastProvider";
import CompanySelectModal from "../../../components/CompanySelectModal";
import FileUpload from "../../../shared/components/FileUpload/FileUpload";
import { getKYCData, verifyPan, gstFetch } from "../../../utils/request";
import Modal from "../../../components/Modal";

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

const Lab = styled.h1`
  font-size: 1em;
  font-weight: 500;
  color: grey;
`;

const LabRed = styled.h1`
  font-size: 1em;
  font-weight: 500;
  color: red;
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

const Span = styled.span`
  color: ${({ theme, bg }) => theme.main_theme_color};
  font-size: 13px;
`;

const businessTypeMaps = [
  [["private", "pvt"], 4],
  [["public", "pub"], 5],
  [["llp"], 3],
];

function formatCompanyData(data, panNum) {
  let directors = {};
  let directorsForShow = [];

  for (const [i, dir] of data["directors/signatory_details"]?.entries() || []) {
    directors[`directors_${i}`] = {
      [`ddin_no${i}`]: dir["din/pan"],
    };
    directorsForShow.push({
      Name: dir.assosiate_company_details?.director_data.name,
      Din: dir.assosiate_company_details?.director_data.din,
    });
  }

  let businesType;

  for (const type of businessTypeMaps) {
    const typeAllowed = type[0].find((t) =>
      data?.company_master_data.company_name?.toLowerCase().includes(t)
    );

    if (typeAllowed) {
      businesType = type[1];
      break;
    }
  }

  const [
    date,
    month,
    year,
  ] = data.company_master_data.date_of_incorporation.split(/\/|-/);

  return {
    BusinessName: data.company_master_data.company_name,
    BusinessType: businesType,
    Email: data.company_master_data.email_id,
    BusinessVintage: `${year}-${month}-${date}`, //1990-03-16
    panNumber: panNum,
    CIN: data.company_master_data["cin "],
    CompanyCategory: data.company_master_data.company_category,
    Address: data.company_master_data.registered_address,
    ClassOfCompany: data.company_master_data.class_of_company,
    RegistrationNumber: data.company_master_data.registration_number,
    DirectorDetails: directors,
    directorsForShow,
    unformatedData: data,
  };
}

function formatCompanyDataGST(data, panNum, gstNum) {
  if (data?.length > 1) data = data[0].data;
  let directors = {};
  let directorsForShow = [];

  directorsForShow.push({
    Name: data?.lgnm,
    Din: "",
  });

  let businesType;

  for (const type of businessTypeMaps) {
    const typeAllowed = type[0].find((t) =>
      data?.tradeNam?.toLowerCase().includes(t)
    );

    if (typeAllowed) {
      businesType = type[1];
      break;
    }
  }

  const [date, month, year] = data?.rgdt?.split(/\/|-/);

  return {
    BusinessName: data.tradeNam,
    BusinessType: businesType,
    Email: "",
    BusinessVintage: `${year}-${month}-${date}`, //1990-03-16
    panNumber: panNum,
    CIN: "",
    GSTVerification: gstNum,
    CompanyCategory: data.nba[0],
    Address: data.pradr?.addr,
    ClassOfCompany: data.ctb,
    RegistrationNumber: data.ctjCd,
    DirectorDetails: directors,
    directorsForShow,
    unformatedData: data,
  };
}

export default function PanVerification({
  productDetails,
  map,
  onFlowChange,
  id,
}) {
  const productType =
    productDetails.loanType.includes("Business") ||
    productDetails.loanType.includes("LAP") ||
    productDetails.loanType.includes("Working")
      ? "business"
      : "salaried";
  const {
    state: { whiteLabelId, clientToken, bankToken },
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
  const [panNum, setPan] = useState("");

  const companyNameSearch = async (companyName) => {
    setLoading(true);
    setCompanyListModal(false);
    const companyNameSearchReq = await newRequest(
      SEARCH_COMPANY_NAME,
      {
        method: "POST",
        data: {
          search: companyName.trim(),
        },
      },
      {}
    );

    const companyNameSearchRes = companyNameSearchReq.data;

    if (companyNameSearchRes.status === NC_STATUS_CODE.OK) {
      setCompanyListModal(true);
      setLoading(false);
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
      { authorization: clientToken }
    );

    const companyData = cinNumberResponse.data;

    if (companyData.status === NC_STATUS_CODE.OK) {
      const userDetailsReq = await newRequest(LOGIN_CREATEUSER, {
        method: "POST",
        data: {
          email: companyData.data.company_master_data.email_id,
          white_label_id: whiteLabelId,
          source: APP_CLIENT,
          name: companyData.data.company_master_data.company_name,
          mobileNo: "9999999999",
          addrr1: "",
          addrr2: "",
        },
      });

      const userDetailsRes = userDetailsReq.data;

      localStorage.setItem("branchId", userDetailsRes.branchId);

      if (userDetailsRes.statusCode === NC_STATUS_CODE.NC200) {
        const encryptWhiteLabelReq = await newRequest(
          WHITELABEL_ENCRYPTION_API,
          {
            method: "GET",
          },
          { Authorization: `Bearer ${userDetailsRes.token}` }
        );

        const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

        localStorage.setItem(
          "encryptWhiteLabel",
          encryptWhiteLabelRes.encrypted_whitelabel[0]
        );

        if (encryptWhiteLabelRes.status === NC_STATUS_CODE.OK)
          setCompanyDetails({
            token: userDetailsRes.token,
            userId: userDetailsRes.userId,
            branchId: userDetailsRes.branchId,
            encryptedWhitelabel: encryptWhiteLabelRes.encrypted_whitelabel[0],
            ...formatCompanyData(companyData.data, panNum),
          });
        onProceed();
        return;
      }
    }
  };

  const [selectDoc, selectDocs] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(null);
  const [gstNum, setGstNum] = useState(null);

  const gstNumberFetch = async (data, gstNum) => {
    const companyData = data;
    if (data?.error_code) {
      return;
    }
    setCompanyDetails({
      ...formatCompanyDataGST(companyData, panNum, gstNum),
    });

    const url = window.location.hostname;

    let userToken = localStorage.getItem(url);

    let form = JSON.parse(userToken);

    form = {
      ...form,
      formReducer: {
        ...form.formReducer,
        user: {
          ...form.formReducer.user,
          applicantData: {
            ...form.formReducer.user.applicantData,
            ...formatCompanyDataGST(companyData, panNum, gstNum),
          },
        },
      },
    };

    localStorage.setItem(url, JSON.stringify(form));
    localStorage.setItem(
      "BusinessName",
      form.formReducer.user.applicantData.BusinessName
    );
    localStorage.setItem(
      "busniess",
      JSON.stringify(form.formReducer.user.applicantData)
    );

    let busniess = form.formReducer.user.applicantData;

    if (busniess && busniess.Address) {
      const getAddressDetails = async () => {
        const companyNameSearchReq = await newRequest(
          PINCODE_ADRRESS_FETCH,
          {
            method: "GET",
            params: {
              pinCode: busniess.Address?.pncd || "",
            },
          },
          {}
        );

        // const response = await newRequest(PINCODE_ADRRESS_FETCH({ pinCode: busniess.Address?.pncd || '' }), {});
        const data = companyNameSearchReq.data;

        busniess = {
          ...busniess,
          Address: {
            ...busniess.Address,
            st: data?.state?.[0],
            city: data?.district?.[0],
          },
        };
      };
    }

    onProceed();
    return;
  };

  const onProceed = () => {
    setCompleted(id);
    onFlowChange(map.main);
  };

  const [panUpload, setPanUpload] = useState(true);
  const [file, setFile] = useState([]);
  const [docs, setDocs] = useState([]);
  const [dataSelector, setDataSelector] = useState(false);
  const [selectedData, setData] = useState(null);
  const [response, setResponse] = useState(null);
  const [isBusiness, setBusiness] = useState(true);

  const handleFileUpload = (files) => {
    setFile([...files, ...file]);
  };

  useEffect(() => {
    localStorage.removeItem("product");
  }, []);

  const userid = "10626";
  const removeHandler = (e) => {
    setDocs([]);
  };

  const [openConfirm, setPanConfirm] = useState(false);
  const [uploadOtherDocs, setUploadOtherDocs] = useState(false);
  const [otherDoc, setOtherDoc] = useState([]);
  const [aadhar, setAadhar] = useState([]);
  const [voter, setVoter] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState(null);

  const handlePanUpload = (files) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("req_type", "pan");
    formData.append("process_type", "extraction");
    formData.append("document", files);
    getKYCData(formData, clientToken)
      .then((res) => {
        if (res.data.status === "nok") {
          setPanConfirm(true);
          setBusiness(false);

          addToast({
            message: res.data.message,
            type: "error",
          });
        } else {
          setPan(res.data.data["Pan_number"]);
          localStorage.setItem("pan", res.data.data["Pan_number"]);
          formState.values.panNumber = res.data.data["Pan_number"];
          formState.values.responseId = res?.data?.data?.id;
          formState.values.companyName = res.data.data["Name"];
          formState.values.dob = res.data.data["DOB"];
          localStorage.getItem("DOB", res.data.data["DOB"]);
          localStorage.setItem("formstatepan", JSON.stringify(formState));
          if (productType === "business") {
            if (
              !(
                res.data.data["Name"]
                  .toLowerCase()
                  .includes("private limited") ||
                res.data.data["Name"]
                  .toLowerCase()
                  .includes("public limited") ||
                res.data.data["Name"].toLowerCase().includes("limited") ||
                res.data.data["Name"].toLowerCase().includes("pvt ltd") ||
                res.data.data["Name"].toLowerCase().includes("private")
              )
            ) {
              setBusiness(false);
              setPanUpload(false);
            } else {
              onSubmit(formState);
            }
          }
          if (productType === "salaried") {
            const name =
              res.data?.data?.name?.split(" ") ||
              res.data?.data?.Name?.split(" ");
            if (name) {
              let fName = [...name];
              fName.pop();
              formState.values.firstName = fName.join(" ");
              formState.values.lastName = name[name.length - 1];
            }
            setPanConfirm(true);
          }
          setResponse(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setPanConfirm(true);
        setBusiness(false);

        addToast({
          message: err.message,
          type: "error",
        });
        setLoading(false);
      });
  };

  const onSubmit = async ({
    panNumber,
    companyName,
    udhyogAadhar,
    gstin,
    gstNumber,
  }) => {
    setLoading(true);
    setVerificationFailed(null);
    setGstNum(gstin);

    if (productType === "business") {
      if (isBusiness) {
        if (!formState?.values?.companyName && !formState?.values?.panNumber) {
          return;
        }

        try {
          if (
            formState?.values?.panNumber &&
            formState?.values?.companyName &&
            formState.values.responseId
          ) {
            await verifyPan(
              formState.values.responseId,
              formState?.values?.panNumber,
              formState?.values?.companyName,
              clientToken
            );
          }

          if (formState?.values?.companyName) {
            await companyNameSearch(formState?.values?.companyName);
          }
        } catch (error) {
          console.error(error);
          addToast({
            message: error.message || "Something Went Wrong. Try Again!",
            type: "error",
          });
        }

        // setLoading(false);
      } else {
        localStorage.setItem("product", "demo");

        if (!udhyogAadhar && !panNumber && (!gstin || gstin == "")) {
          return;
        }

        try {
          if (udhyogAadhar) {
            await verifyPan(
              formState.values.responseId,
              formState.values?.udhyogAadhar,
              formState?.values?.companyName,
              clientToken
            );
          }

          let stateCode = null,
            panFromGstin = null;
          if (gstin) {
            stateCode = gstin.slice(0, 2);
            panFromGstin = gstin.slice(2, 12);
            if (panFromGstin !== panNumber) {
              setVerificationFailed("Invalid GSTIN for the given PAN");
              setLoading(false);
              return;
            }
          }

          if (panNumber) {
            await gstFetch(panNumber, stateCode, clientToken).then((res) => {
              gstNumberFetch(res?.data?.data[0]?.data, gstin);
            });
          }
        } catch (error) {
          console.error(error);
          addToast({
            message: error.message || "Something Went Wrong. Try Again!",
            type: "error",
          });
        }
      }

      // setLoading(false);
    } else {
      if (
        (aadhar.length > 0 && otherDoc.length > 0) ||
        (aadhar.length > 0 && voter.length > 0) ||
        (voter.length > 0 && otherDoc.length > 0)
      ) {
        setLoading(false);
        return addToast({
          message: `please upload only one type of document`,
          type: "error",
        });
      }
      if (aadhar.length > 0 && aadhar[0]?.file) {
        handleUpload(aadhar[0]?.file);
      }
      if (voter.length > 0 && voter[0].file) {
        handleUpload(voter[0]?.file);
      }
      if (otherDoc.length > 0 && otherDoc[0]?.file) {
        handleUpload(otherDoc[0]?.file);
      }

      // setLoading(false);
    }
  };

  function formatUserDetails(data, fields) {
    let formatedData = {};
    fields.forEach((f) => {
      formatedData[f.name] = data[f.name] || "0";
    });
    return formatedData;
  }

  const t = () => {
    if (otherDoc.length > 0) {
      return "DL";
    }
    if (aadhar.length > 0) {
      return "aadhar";
    }
    if (voter.length > 0) {
      return "voter";
    }
  };
  const [backUpload, setBackUpload] = useState(false);
  const [backUploading, setBackUploading] = useState(false);

  useEffect(() => {
    if (aadhar.length > 0 || voter.length > 0 || otherDoc.length > 0)
      setBackUpload(true);
  }, [otherDoc, aadhar, voter]);

  const handleUpload = (files) => {
    setLoading(true);
    const fileType = t();
    const formData = new FormData();
    formData.append("req_type", fileType);
    formData.append("process_type", "extraction");
    formData.append("document", files);
    getKYCData(formData, clientToken).then((res) => {
      if (res.data.status === "nok") {
        addToast({
          message: res.data.message,
          type: "error",
        });
        setOtherDoc([]);
        setAadhar([]);
        setVoter([]);
        onProceed();
      } else {
        // data ---> extractionData
        // ref_id: pass the id from the first doc response
        // combine data
        const aadharNum = res?.data?.data?.Aadhar_number?.replaceAll(
          /\s/g,
          ""
        ).split("");
        const t = aadharNum
          ? "00000000" + aadharNum?.splice(8, 4).join("")
          : "";
        const name =
          res.data?.data?.name?.split(" ") || res.data?.data?.Name?.split(" ");
        formState.values.aadhaar = t;
        localStorage.setItem("aadhar", t);
        formState.values.dob = res?.data?.data?.DOB;
        let firstName = [...name];
        firstName.pop();
        formState.values.firstName = firstName.join(" ");
        formState.values.lastName = name[name.length - 1];
 
        formState.values.dob = res?.data?.data?.DOB || res?.data?.data?.dob;
        formState.values.dl_no = res.data?.data?.dl_no;
        formState.values.address1 =
          res.data?.data?.address || res?.data?.data?.Address;
        let address = formState.values.address1;

        var pinCode = res?.data?.data?.pincode;

        if (address) {
          let locationArr = address && address?.split(" ");
          let y = locationArr?.map((e) => Number(e) !== NaN && e);
          let pin;
          y.map((e) => {
            if (e?.length === 6) pin = e;
          });

          formState.values.pin = pinCode || pin;
        }

        localStorage.setItem("formstate", JSON.stringify(formState));
        setOtherDoc([]);
        setAadhar([]);
        setVoter([]);
        onProceed();
      }
      setLoading(false);
    });
  };

  return (
    productDetails && (
      <>
        <Colom1>
          {panUpload ? (
            <section className="flex flex-col gap-y-6">
              <p className="py-4 text-xl">
                Upload your PAN Card{" "}
                <Span>supported formats - jpeg, png, jpg</Span>
              </p>
              <FileUpload
                accept=""
                upload={{
                  url: DOCS_UPLOAD_URL_LOAN({
                    userid,
                  }),
                  header: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
                  },
                }}
                pan={true}
                onDrop={handleFileUpload}
                onRemoveFile={(e) => removeHandler(e)}
                docs={docs}
                setDocs={setDocs}
              />
              <section>
                <Button
                  onClick={() => {
                    if (docs.length > 0) {
                      handlePanUpload(docs[0].file);
                      setDocs([]);
                    }
                  }}
                  isLoader={loading}
                  name={loading ? "Please wait..." : "Submit"}
                  disabled={!docs.length > 0}
                  fill
                />
              </section>
            </section>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {uploadOtherDocs ? (
                <>
                  <p className="py-4 text-xl text-black">
                    Upload{" "}
                    {(backUploading && "back picture of") || "front picture of"}{" "}
                    your DL <Span>supported formats - jpeg, png, jpg</Span>
                  </p>

                  <FileUpload
                    accept=""
                    upload={{
                      url: DOCS_UPLOAD_URL_LOAN({
                        userid,
                      }),
                      header: {
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
                      },
                    }}
                    pan={true}
                    onDrop={handleFileUpload}
                    onRemoveFile={(e) => removeHandler(e)}
                    docs={otherDoc}
                    setDocs={setOtherDoc}
                  />
                  <p className="py-4 text-xl text-black">
                    Upload{" "}
                    {(backUploading && "back picture of") || "front picture of"}{" "}
                    your Aadhar <Span>supported formats - jpeg, png, jpg</Span>
                  </p>

                  <FileUpload
                    accept=""
                    upload={{
                      url: DOCS_UPLOAD_URL_LOAN({
                        userid,
                      }),
                      header: {
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
                      },
                    }}
                    pan={true}
                    onDrop={handleFileUpload}
                    onRemoveFile={(e) => removeHandler(e)}
                    docs={aadhar}
                    setDocs={setAadhar}
                  />
                  <p className="py-4 text-xl text-black">
                    Upload{" "}
                    {(backUploading && "back picture of") || "front picture of"}{" "}
                    your Voter ID{" "}
                    <Span>supported formats - jpeg, png, jpg</Span>
                  </p>

                  <FileUpload
                    accept=""
                    upload={{
                      url: DOCS_UPLOAD_URL_LOAN({
                        userid,
                      }),
                      header: {
                        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTUsImNsaWVudF9uYW1lIjoiY2xpeCIsImNsaWVudF9sb2dvIjoiIiwiY2xpZW50X2lkIjoxNjI3NDc3OTkyMzk5NDgzNiwic2VjcmV0X2tleSI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpqYkdsbGJuUmZibUZ0WlNJNkltTnNhWGdpTENKamJHbGxiblJmYVdRaU9qRTJNamMwTnpjNU9USXpPVGswT0RNMkxDSnBZWFFpT2pFMk1qYzBOemM1T1RJc0ltVjRjQ0k2TVRZeU56VTJORE01TW4wLlhma1lIZEFHNEI1cVhGQkNTXzJlbV9vbk1yNkw4aEczY2dmUjJENktJOTAiLCJpc19hY3RpdmUiOiJhY3RpdmUiLCJjcmVhdGVkX2F0IjoiMjAyMS0wNy0yOFQxODo0MzoxMi4wMDBaIiwidXBkYXRlZF9hdCI6IjIwMjEtMDctMjhUMTM6MTM6MTIuMDAwWiIsInBhc3N3b3JkIjoiY2xpeEAxMjMiLCJlbWFpbCI6ImNsaXhAbmMuY29tIiwid2hpdGVfbGFiZWxfaWQiOjksImlhdCI6MTYyNzUzMzU0NCwiZXhwIjoxNjI3NjE5OTQ0fQ.T0Pc973NTyHbFko1fDFwi_baVwGxjUSEdNZhUuVfaSs`,
                      },
                    }}
                    pan={true}
                    onDrop={handleFileUpload}
                    onRemoveFile={(e) => removeHandler(e)}
                    docs={voter}
                    setDocs={setVoter}
                  />
                </>
              ) : (
                <>
                  <FieldWrapper>
                    {register({
                      name: "panNumber",
                      placeholder: "Pan Number",
                      value: formState?.values?.panNumber,
                    })}
                  </FieldWrapper>

                  <FieldWrapper>
                    {register({
                      name: "gstin",
                      placeholder: "GST Identification Number",
                      value: formState?.values?.gstin,
                    })}
                  </FieldWrapper>
                  <br />
                  <H2>OR</H2>

                  <FieldWrapper>
                    {register({
                      name: "udhyogAadhar",
                      placeholder: "Udhyog Aadhar Number",
                      value: formState?.values?.udhyogAadhar,
                    })}
                  </FieldWrapper>
                </>
              )}
              <section className="flex items-center gap-x-4">
                <Button
                  onClick={() => setPanUpload(true)}
                  name="Upload PAN again"
                  fill
                />
                <Button
                  type="submit"
                  isLoader={loading}
                  name={loading ? "Please wait..." : "SUBMIT"}
                  fill
                  disabled={
                    productType !== "salaried"
                      ? isBusiness
                        ? !(
                            formState.values?.companyName ||
                            formState.values?.panNumber
                          ) ||
                          (formState.values?.companyName &&
                            formState.values?.panNumber)
                        : !(
                            formState.values?.udhyogAadhar ||
                            formState.values?.panNumber
                          ) ||
                          (formState.values?.udhyogAadhar &&
                            formState.values?.panNumber) ||
                          loading
                      : !(
                          aadhar.length > 0 ||
                          otherDoc.length > 0 ||
                          voter.length > 0
                        )
                  }
                />
              </section>

              <FieldWrapper>
                <LabRed>{verificationFailed}</LabRed>
              </FieldWrapper>
            </form>
          )}
        </Colom1>
        <Colom2>
          <Img src={productDetails.productDetailsImage} alt="Loan Caption" />
        </Colom2>
        {
          <CompanySelectModal
            companyNameSearch={companyNameSearch}
            show={companyListModal}
            companyName={formState?.values?.companyName}
            companyList={companyList}
            onClose={() => setCompanyListModal(false)}
            onCompanySelect={onCompanySelect}
            formState={formState}
          />
        }
        {openConfirm && (
          <Modal
            show={openConfirm}
            onClose={() => {
              setPanConfirm(false);
            }}
            width="30%"
          >
            <section className="p-4 flex flex-col gap-y-8">
              <span className="font-bold text-lg">
                Please confirm your PAN Number
              </span>
              <section className="flex gap-x-4 items-center">
                <FieldWrapper>
                  {register({
                    name: "panNumber",
                    placeholder: "Pan Number",
                    value: formState?.values?.panNumber,
                  })}
                </FieldWrapper>
              </section>
              <Button
                name="Submit"
                fill
                onClick={() => {
                  localStorage.setItem("pan", formState?.values?.panNumber);
                  setPanConfirm(false);
                  setPanUpload(false);
                  if (productType === "salaried") {
                    setUploadOtherDocs(true);
                  }
                }}
                disabled={!formState?.values?.panNumber}
              />
            </section>
          </Modal>
        )}
        {backUpload &&
          !panUpload &&
          (aadhar.length > 0 || otherDoc.length > 0 || voter.length > 0) &&
          !backUploading && (
            <Modal
              show={backUpload}
              onClose={() => {
                setBackUpload(false);
              }}
              width="30%"
            >
              <span className="px-4 font-bold">
                Upload back part of the document?
              </span>
              <section className="p-4 py-16 flex gap-x-8">
                <Button
                  name="Yes"
                  fill
                  onClick={() => {
                    setBackUploading(true);
                    setBackUpload(false);
                    setAadhar([]);
                    setVoter([]);
                    setOtherDoc([]);
                  }}
                />
                <Button
                  name="No"
                  fill
                  onClick={() => {
                    setBackUpload(false);
                  }}
                />
              </section>
            </Modal>
          )}
        {selectDoc && (
          <Modal>
            <section className="p-4 flex flex-col gap-y-8">
              <span className="font-bold text-lg">Please select doc type</span>
              <section className="flex gap-x-4 items-center">
                <section>
                  <label>DL</label>
                  <input type="radio" name="doctype" value="DL" />
                </section>
                <section>
                  <label>Aadhar</label>
                  <input type="radio" name="doctype" value="aadhar" />
                </section>
                <section>
                  <label>VoterID</label>
                  <input type="radio" name="doctype" value="voter" />
                </section>
              </section>
              <Button
                name="Submit"
                fill
                onClick={() => {
                  selectDocs(false);
                }}
                isLoader={false}
                disabled={!formState?.values?.panNumber}
              />
            </section>
          </Modal>
        )}
      </>
    )
  );
}

PanVerification.propTypes = {
  productDetails: object,
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
};
