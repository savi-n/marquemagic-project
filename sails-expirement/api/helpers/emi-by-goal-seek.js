const DAYS_IN_YEAR = 360;
const PERCENTAGE = 100;
const DAYS_IN_MONTH = 30;

module.exports = {


  friendlyName: 'Emi by goal seek',


  description: '',


  inputs: {
    loanAmount: {
      type: "number",
      required: true
    },
    roi: {
      type: "number",
      required: true
    },
    termInMonths: {
      type: "number",
      required: true
    },
    noOfDays: {
      type: "number",
      rquired: true
    },
    advanceInstallments: {
      type: "number",
      defaultsTo: 0
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const {
      loanAmount,
      roi,
      termInMonths,
      noOfDays,
      advanceInstallments
    } = inputs;

    const constant1 = DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE;


    // function calculateClosingBalance(loan, emi, k, term) {
    //   let gp = ((k + 1) ** term - 1) / k;
    //   let closingBalance = loan * (1 + k) ** term - emi * gp;
    //   console.log(term + "=>" + closingBalance.toFixed(2));
    // }

    // for (let i = 1; i <= term; i++) {
    //   calculateClosingBalance(LOAN, EMI, K, i);
    // }

    // const pendingInstallments = termInMonths - advanceInstallments;

    // const constant2 = ((constant1 + 1) ** pendingInstallments - 1) / constant1;
    // const constant3 = ((constant1 + 1) ** pendingInstallments);

    // const emi = loanAmount * (1 + constant1) ** pendingInstallments /
    //   (constant2 + advanceInstallments * (1 + constant1) ** pendingInstallments);

    const pendingInstallments = termInMonths - advanceInstallments - 1;

    const constant2 = ((constant1 + 1) ** pendingInstallments - 1) / constant1;
    const constant3 = constant1 * noOfDays / DAYS_IN_MONTH;
    const constant4 = (1 + constant1) ** pendingInstallments;

    const emi = loanAmount * (1 + constant3) * constant4 /
      (constant2 + (1 + advanceInstallments * (1 + constant3)) * constant4);

    let roundedOffEmi = finalEmi = Math.round(emi);

    // const pendingInstallments = termInMonths - advanceInstallments - 1;

    // const constant2 = ((DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE + 1) ** pendingInstallments - 1) / (DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE);
    // const constant3 = (DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE) * noOfDays / DAYS_IN_MONTH;
    // const constant4 = (1 + (DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE)) ** pendingInstallments;

    // const emi = loanAmount * (1 + ((DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE) * noOfDays / DAYS_IN_MONTH)) * ((1 + (DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE)) ** pendingInstallments) /
    //   ((((DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE + 1) ** pendingInstallments - 1) / (DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE)) + (1 + advanceInstallments * (1 + ((DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE) * noOfDays / DAYS_IN_MONTH))) * ((1 + (DAYS_IN_MONTH * roi / DAYS_IN_YEAR / PERCENTAGE)) ** pendingInstallments));
    let closingBal = getClosingBal(
      roundedOffEmi,
      loanAmount,
      roi,
      termInMonths,
      noOfDays,
      advanceInstallments
    );

    let incrementBy = closingBal > 0 ? 1 : -1;
    let absClosingVal = Math.abs(closingBal);
    let minClosingBal = absClosingVal;

    console.log("finalEmi", finalEmi);
    console.log("closingBal", closingBal);

    while (closingBal * incrementBy > 0) {
      roundedOffEmi += incrementBy;
      closingBal = getClosingBal(
        roundedOffEmi,
        loanAmount,
        roi,
        termInMonths,
        noOfDays,
        advanceInstallments
      );

      absClosingVal = Math.abs(closingBal);
      if (absClosingVal < minClosingBal) {
        minClosingBal = absClosingVal;
        finalEmi = roundedOffEmi;
      }
      console.log("finalEmi", finalEmi);
      console.log("closingBal", closingBal);
    }

    return exits.success(emi);
  }


};

function getClosingBal(emi, loanAmount, roi, termInMonths, noOfDays, advanceInstallments) {
  //console.log(emi, loanAmount, roi, termInMonths, noOfDays, advanceInstallments);
  let closingBalance = loanAmount;
  if (advanceInstallments) {
    closingBalance -= (emi * advanceInstallments);
    termInMonths -= advanceInstallments;
  } else {
    //console.log(closingBalance);
    const interest = Math.ceil((closingBalance * roi * noOfDays / DAYS_IN_YEAR / PERCENTAGE));
    const principle = emi - interest;
    closingBalance -= principle;
    //console.log(closingBalance, principle, emi, interest);
    termInMonths--;
  }

  for (let i = 1; i <= termInMonths; i++) {
    const interest = Math.ceil((closingBalance * roi * DAYS_IN_MONTH / DAYS_IN_YEAR / PERCENTAGE));
    const principle = emi - interest;
    closingBalance -= principle;
    //console.log(i, closingBalance, principle, emi, interest);
  }

  return closingBalance;

}
