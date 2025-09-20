module.exports = {
	inputs: {
		userid: {
			type: "number",
			description: "Object for fetching key-value pairs",
			required: true
		}
	},
	fn: async function (inputs, exits) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			allUserIdsQuery = `select GROUP_CONCAT(distinct a.userid) level4, GROUP_CONCAT(distinct b.userid) AS level3, GROUP_CONCAT(distinct c.userid) AS level2,
        GROUP_CONCAT(distinct d.userid) AS level1
        from users a
    right join users b on b.userid = a.parent_id AND b.status = 'active' AND b.usertype = 'Sales'
    right JOIN users c ON c.userid = b.parent_id AND c.status = 'active' AND c.usertype = 'Sales'
	right JOIN users d ON c.parent_id = d.userid AND d.status = 'active' AND d.usertype = 'Sales'
    where d.userid =${inputs.userid}
        ;`,
			nativeResult = await myDBStore.sendNativeQuery(allUserIdsQuery),
			allUserIdsResult = nativeResult.rows,
			finalResult = JSON.parse(JSON.stringify(allUserIdsResult));
		sub_sub_children = finalResult[0].level4 === null ? [] : finalResult[0].level4.split(",");
		sub_children = finalResult[0].level3 === null ? [] : finalResult[0].level3.split(",");
		children = finalResult[0].level2 === null ? [] : finalResult[0].level2.split(",");
		const userid = [...sub_sub_children, ...sub_children, ...children, inputs.userid],
			assigned_users = await UsersRd.find({
				where: {
					assigned_sales_user: userid
				},
				select: ["name"]
			}),
			assignUsers = [];
		_.each(assigned_users, (value) => {
			assignUsers.push(value.id);
		});
		const finalArr = [...userid, ...assignUsers];
		return exits.success(finalArr);
	}
};
