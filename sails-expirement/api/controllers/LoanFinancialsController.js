


module.exports = {
	deleteLoanFinancial:async function (req, res) {
		const loan_id = req.param("loan_id"),
		 id = req.param("id");
		if(loan_id && id){
			const loanRec = await LoanFinancialsRd.find({id: id, loan_id: loan_id});
			if (loanRec.length === 0 || loanRec[0] === null) {
				return res.send({
					status: "nok",
					message: "invalid params id or load_id does not exits."
				});
			}

			if (sails.config.enach.muthoot.allowedWhiteLabelIds.includes(parseInt(req?.user?.loggedInWhiteLabelID))) {

				if (loanRec[0]?.fin_type == 'Bank Account' && loanRec[0]?.enach_status && loanRec[0]?.enach_status != 'failed' && loanRec[0]?.enach_status != 'cancelled') {

					return res.badRequest({
						status: "nok",
						message: "This Bank cannot be deleted, as Enach has been triggered for this bank."
					});

				}

			}

			const deltedDoc = await LoanFinancials.update({
				id: id,
				loan_id: loan_id
			}).set({
				status: "deleted"
			});

			return res.send({
				status: "ok",
				message: "Document deleted",
				data: deltedDoc
			});

		} else{
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	}




};
