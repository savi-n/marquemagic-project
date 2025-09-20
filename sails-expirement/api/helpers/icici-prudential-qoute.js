
function getAmount(amnt, unit) {
  if (unit == "Lakhs") return amnt * 100000;
  else if (unit == "Crores") return amnt * 10000000;
  else return amnt;
}
module.exports = {


  friendlyName: 'Icici prudential qoute',


  description: '',


  inputs: {
    did: {
      type: "number",
      required: true
    },
    loanId: {
      type: "number",
      required: true
    },
    sumAssured: {
      type: "number"
    },
    policyTerm: {
      type: "number"
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // return exits.success({
    //   insCharge: 599,
    //   gstCharge: 91
    // })
    const did = inputs.did
    const loan_id = inputs.loanId
    const sum_assured = inputs.sumAssured
    const policy_term = inputs.policyTerm
    try {
      const applicant = await Director.findOne({id: did});
      const sanData = await LoanSanctionRd.findOne({loan_id}).select(["san_amount", "amount_um", "san_term", "san_interest"]);
      const loanAmount = getAmount(sanData?.san_amount, sanData?.amount_um)
      const payload =
        `<soap:Envelope
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:xsd="http://www.w3.org/2001/XMLSchema"
	xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header>
        <AuthSoapHd xmlns="http://tempuri.org/">
		</AuthSoapHd>
    </soap:Header>
    <soap:Body>
        <GenerateEBIDigital xmlns="http://tempuri.org/">
            <strInputXML>
                <![CDATA[
                    <EBIRequest>
                        <FirstName>${applicant.dfirstname}</FirstName>
                        <LastName>${applicant.dlastname}</LastName>
                        <DateOfBirth>${applicant.ddob}</DateOfBirth>
                        <Gender>${applicant.gender}</Gender>
                        <MaritalStatus/>
                        <ServiceTaxNotApplicable>0</ServiceTaxNotApplicable>
                        <AreaCode/>
                        <ProductDetails>
                            <Product>
                                <ProductType>TRADITIONAL</ProductType>
                                <ProductName>ICICI PRU SUPER PROTECT CREDIT</ProductName>
                                <ProductCode>GP1</ProductCode>
                                <ModeOfPayment>Yearly</ModeOfPayment>
                                <ModalPremium>0</ModalPremium>
                                <AnnualPremium>0</AnnualPremium>
                                <Term>${policy_term * 12}</Term>
                                <SalesChannel>3</SalesChannel>
                                <DeathBenefit>${sum_assured}</DeathBenefit>
                                <isKeralaCess>false</isKeralaCess>
                                <LoanTenure>${sanData.san_term}</LoanTenure>
                                <LoanAmount>${loanAmount}</LoanAmount>
                                <PremiumPaymentOption>Single Pay</PremiumPaymentOption>
                                <MasterCode>MF000LAP</MasterCode>
                                <CoverageOption>Reducing</CoverageOption>
                                <BenefitOption>0</BenefitOption>
                                <Funded>FUNDED</Funded>
                            </Product>
                        </ProductDetails>
                    </EBIRequest>
                ]]>
            </strInputXML>
        </GenerateEBIDigital>
    </soap:Body>
         </soap:Envelope>`
      let apiRes = await sails.helpers.sailstrigger(
        sails.config.insurance.icici.urls.quotation,
        JSON.stringify({
          payload,
          loan_id: loan_id
        }),
        "",
        "POST"
      );

      apiRes = JSON.parse(apiRes);
      // console.log("apiress:", apiRes)
      console.log("apires:", apiRes.data)
      // exits.success({data: apiRes.data})

      if (apiRes?.data?.ErrorMessage === "Success") {
        return exits.success({
          insCharge: apiRes?.data?.PremiumSummary?.PremiumInstallmentWithTax,
          gstCharge: apiRes?.data?.PremiumSummary?.ServiceTax
        })
      } else {
        return exits.success({error: apiRes?.data?.ErrorMessage});
      }

    } catch (error) {
      console.log(error);
      result = error.message;
    }

  }



};
