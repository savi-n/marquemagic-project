/**
 * PreferenceQuestionnaireController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
	/**
	 * Eligibility Question List
	 * @description :: Eligibility Question List
	 * @api {get} /questionList/ Question List
	 * @apiName Question List
	 * @apiGroup Eligibility
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/questionList/
	 * @apiParam {number} step Step starts with 1 and goes so on.
	 * @apiParam {number} loan_product_id in step1 what loan_product the user selects that id to be passed for step 2 onwards..
	 * @apiSuccess {object[]} List of questions.
	 * @apiDescription <b>Note:Api needs to be called with incremental step till you get empty array</b>
	 *
	 */
	index: async function (req, res) {
		const user_whitelabel = req.user.loggedInWhiteLabelID;
		if (!user_whitelabel) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const whereCondition = {
			eligibility_flag: "yes",
			status: "active",
			white_label_id: user_whitelabel
		};
		if (req.param("step")) {
			whereCondition.group_id = req.param("step");
		}
		if (req.param("loan_product")) {
			loan_product = req.param("loan_product")
			whereCondition.or = [
					{product_id: `${loan_product}`},
					{product_id: {'like': `%,${loan_product}`}},
					{product_id: {'like': `${loan_product},%`}},
					{product_id: {'like': `%,${loan_product},%`}}
				]
		}
		const questionList = await PreferenceQuestionnaireRd.find(whereCondition).select(["id", "text", "master_data"]),
			data = [];
		for (const question of questionList) {
			if (question.master_data) {
				data.push({q_id: question.id, question: question.text, master_data: JSON.parse(question.master_data)});
			} else {
				data.push({q_id: question.id, question: question.text});
			}
		}
		return res.send({status: "ok", data});
	}
};
