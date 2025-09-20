module.exports = {
	inputs: {
		loan_id: {
			type: "number",
			required: true
		},
		business_id: {
			type: "number",
			required: true
		},
		director_id: {
			type: "string"
		},
		inserted_by_user: {
			type: "number",
			required: true
		},
		section_name: {
			type: "string",
			required: true
		},
		co_applicant_business_id : {
			type: "string"
		}
	},
	exits: {
		success: {
			description: "All done."
		}
	},
	fn: async function (inputs, exits) {
		let {loan_id, business_id, inserted_by_user, section_name, director_id, co_applicant_business_id} = inputs;
		if (!co_applicant_business_id) {co_applicant_business_id = business_id};
		datetime = await sails.helpers.dateTime();
		let createOrUpdate, data;
		const senctionName = ["basic_details", "employment_details", "loan_address_details"],
			business_sectionName = ["business_details", "business_address_details", "business_address_details_edi"],
			misData = await MisActivityRd.findOne({loan_id});
		if (misData) {
		 if  (misData.onboarding_track) {
				trackData = JSON.parse(misData.onboarding_track);
				console.log("parse data =-=============", trackData, trackData.director_details, typeof trackData.director_details);
				if (director_id && senctionName.indexOf(section_name) > -1) {
					if (Object.keys(trackData.director_details).indexOf(director_id.toString()) > -1 &&
					trackData.director_details[director_id].indexOf(section_name) === -1) {
						trackData.director_details[director_id].push(section_name);
						data = trackData;
						console.log("dir exist in mis --------------", data);
					} else {
						dirData = {[director_id]: [section_name], ...trackData.director_details};
						trackData.director_details = dirData;
						data = trackData;
						console.log("new dir for existing mis-------------", data);
					}
				} else if (co_applicant_business_id && business_sectionName.indexOf(section_name) > -1) {
					if (trackData.business_details &&
						Object.keys(trackData.business_details).indexOf(co_applicant_business_id.toString()) > -1 &&
					trackData.business_details[co_applicant_business_id].indexOf(section_name) === -1) {
						trackData.business_details[co_applicant_business_id].push(section_name);
						data = trackData;
						console.log("business exist in mis --------------", data);
					} else {
						trackData.business_details = {[co_applicant_business_id]: [section_name], ...trackData.business_details};
						data = trackData;
						console.log("new business for existing mis-------------", data);
					}
				} else {
					if (trackData.loan_details.indexOf(section_name) === -1){
						trackData.loan_details.push(section_name);
						data = trackData;
						console.log("existing loan details ------------", data);
					}
				}
			} else {
				const director_details = {}, loan_details = [], business_details = {};
				if (director_id && senctionName.indexOf(section_name) > -1) {
					director_details[director_id] = [section_name];
					console.log("update onboarding dir---------", director_details);
				} else if (co_applicant_business_id && business_sectionName.indexOf(section_name) > -1){
					business_details[co_applicant_business_id] = [section_name];
					console.log("update onboarding business---------", business_details);
				} else {
					loan_details.push(section_name);
					console.log("update onboarding loan data ------------", loan_details);
				}
				data = {loan_details, director_details, business_details};
				console.log("create data--------------", data);
			}
			console.log("update data --------------", data);
			createOrUpdate = await MisActivity.update({loan_id})
				.set({
					onboarding_track: JSON.stringify(data),
					updated_by_user: inserted_by_user,
					updated_time_stamp: datetime
				})
				.fetch();
		console.log("createOrUpdatecreateOrUpdatecreateOrUpdatecreateOrUpdatecreateOrUpdate", createOrUpdate);
		} else {
			const director_details = {}, loan_details = [], business_details = {};
			if (director_id && senctionName.indexOf(section_name) > -1) {
				director_details[director_id] = [section_name];
				console.log("create dir---------", director_details);
			} else if (co_applicant_business_id && business_sectionName.indexOf(section_name) > -1){
				business_details[co_applicant_business_id] = [section_name];
				console.log("create onboarding business---------", business_details);
			} else {
				loan_details.push(section_name);
				console.log("create loan data ------------", loan_details);
			}
			data = {loan_details, director_details, business_details};
			console.log("create data--------------", data);
			createOrUpdate = await MisActivity.create({
				loan_id,
				business_id,
				inserted_by_user,
				onboarding_track: JSON.stringify(data),
				inserted_time_stamp: datetime
			}).fetch();
		}
		return exits.success(createOrUpdate);
	}
};
