import { useState, useEffect } from "react";
import {
    BRANCH_COLLATERAL_DETAILS,
    BRANCH_COLLATERAL_SELCTED,
    BRANCH_COLLATERAL_UPDATE,
} from "../../_config/branch.config";
import styled from "styled-components";
import Collateral from "./Collateral";
import useFetch from "../../hooks/useFetch";
import useForm from "../../hooks/useForm";
import Button from "../shared/components/Button";
import ButtonS from "../../components/Button";
import collateralSelect from "../../hooks/useCollateralSelect";
import useCollateralSelect from "../../hooks/useCollateralSelect";


const WrapContent = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const FieldWrapper = styled.div`
    padding: 20px 0;
    width: 100%;
`;

const Wrapper = styled.form`
    width: 30%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const pageStates = {
    fetch: "fetch",
    available: "available",
    next: "next",
};

export default function CollateralsDetails({loanId, product}) {
    
    const { newRequest } = useFetch();
    const { register, handleSubmit, formState } = useForm();
    const [fetching, setFetching] = useState(false);
    const [pageState, setPageState] = useState(pageStates.fetch);
    const [colateralDetails, setColateralDetails] = useState(null);
    const [seletedCollateral, setSelectedCollateral] = useState(null);
    const [noOfCollaterals, setNoOfCollaterals] = useState(null);
    const [updatedCollateral, setUpdatedCollateral] = useState(null);

    const [delLater, setDelLater] = useState('Not called');
    
    const onCollateralUpdate = (updateCollateral) => {
        setUpdatedCollateral(updateCollateral);
        if(updatedCollateral != null) {
            onUpdateCollateral(updateCollateral);
        }
    }

    // const [colComp] = useCollateralSelect(seletedCollateral, loanId, product, onCollateralUpdate);
    // const [colComp] = useCollateralSelect(seletedCollateral, loanId, product);

    const fetchCollateralDetails = async (url) => {
        const fetchCollateral = await newRequest(
            url,
            {
                method: "POST",
            },
            {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        );
        return fetchCollateral;
    };
    
    const getCollaterals = async ({ custAccNo }) => {
        setFetching(true);
        const colateralDataReq = await fetchCollateralDetails(
        BRANCH_COLLATERAL_DETAILS({ loanID: loanId, custAccNo })
        );
        const colateralDataRes = colateralDataReq?.data;
    
        setColateralDetails(colateralDataRes.data);
        setNoOfCollaterals(colateralDataRes.data.initial_collateral.length);;
        setPageState(pageStates.available);
        setFetching(false);
    };
    
    const onSubmitCollateral = async ({ collateralNumber }) => {
        console.log(collateralNumber);
        setFetching(true);
        const colateralSaveDataReq = await fetchCollateralDetails(
        BRANCH_COLLATERAL_SELCTED({
            loanId: loanId,
            collateral: collateralNumber,
        })
        );
        const colateralSaveDataRes = colateralSaveDataReq.data;
        setSelectedCollateral(colateralSaveDataRes.data ? colateralSaveDataRes.data[0] : colateralSaveDataRes);
        setPageState(pageStates.next);
        setFetching(false);
    };

    const onUpdateCollateral = async ({ collateralType }) => {
        setFetching(true);
        const colateralUpdateDataReq = await fetchCollateralDetails(
        BRANCH_COLLATERAL_UPDATE({
            loanId: loanId,
            collateral: collateralType,
        })
        );
        const colateralUpdateDataRes = colateralUpdateDataReq.data;
        setDelLater("Update API was called successfully");
        setFetching(false);
    };
    
    let no = 1;
    console.log("Col details");
    return(
        <>
            {pageState === pageStates.fetch && (
                <WrapContent>
                <Wrapper onSubmit={handleSubmit(getCollaterals)}>
                    <FieldWrapper>
                    {register({
                        name: "custAccNo",
                        placeholder: "Enter Customer / Account Number",
                        value: formState?.values?.custAccNo,
                    })}
                    </FieldWrapper>

                    <ButtonS
                    type="submit"
                    name="Submit"
                    fill
                    disabled={!formState.values?.custAccNo || fetching}
                    />
                </Wrapper>
                </WrapContent>
            )}

            {/* ----------------------------------- */}

             
          {pageState === pageStates.available && (
            <WrapContent>
              <Wrapper onSubmit={handleSubmit(onSubmitCollateral)}>
              <FieldWrapper>
              {register({
                name: "collateralNumber",
                type: "select",
                placeholder: "Select Collateral",
                options: colateralDetails.initial_collateral.map((col) => ({
                  value: col.collateralNumber,
                  name: col.collateralNumber,
                })),
                value: formState?.values?.collateralNumber,
                
              })}
            </FieldWrapper>

                <ButtonS
                    type="submit"
                    name="Submit"
                    fill
                    disabled={!formState?.values?.collateralNumber || fetching}
                />
                </Wrapper>
                </WrapContent>
            )} 
            {/* ----------------------------------- */}
            {pageState === pageStates.next && (
                
                <>
                {console.log(seletedCollateral  )}
                {/* Header tab */}
                {/* <div className='flex flex-row justify-start'>
                    {colateralDetails?.initial_collateral.map((col) => (
                        <div className='mr-20'>
                            <div >
                                <Button
                                    size="small"
                                    type="blue-light"
                                    rounded="rfull"
                                    width="fulll"
                                    // onClick={() => showDetails(col)}
                                    onClick={()=>setSelectedCollateral(col)}
                                >
                                Security {no < noOfCollaterals ? no++:noOfCollaterals }
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                 */}
                <div>
                   {/* {colComp} */}
                   <Collateral collateral={seletedCollateral} loanId={loanId} product={product} onUpdate={onUpdateCollateral}/>
                </div>
                <div>{updatedCollateral}</div>
                <div>{delLater}</div>

                
                </>
            )}
        </>
    )
}