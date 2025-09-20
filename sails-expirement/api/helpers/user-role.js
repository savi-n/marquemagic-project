module.exports = {
    inputs : {
        parent_id :{
            type : "number",
            required : true
        },
        lender_id : {
            type : "number",
            required : true
        }
    },
    fn : async function(inputs, exits){
        let {lender_id, parent_id} = inputs;
        let regionArray = [], regiondata = [];
        if (lender_id != 0){
		regionMapData = await LenderRegionMappingRd.find({user_id : lender_id}).select("region_id");
		if (regionMapData.length > 0){
		_.each(regionMapData, value => {
            if(value.id !== 0){
			    regionArray.push(value.region_id);
            }
		});
		regiondataFetch = await RegionRd.find({id : regionArray, status : "active"}).select("region_name");
		_.each(regiondataFetch, value1 => {
			regiondata.push(value1.region_name);
		});
	}
}
data = {
    region : regiondata,
    location_access : regiondata,
    reporting_manager_name : "",
    reporting_manager_branch : "",
    reporting_manager_designation : "",
    employee_designation : ""
}
if (parent_id != 0){
        parentUserData = await UsersRd.findOne({id : parent_id, status : "active"});
        data.reporting_manager_name  = "";
        data.reporting_manager_branch = "";
        if (regiondata.length == 5){
            data.employee_designation = data.reporting_manager_designation = "National Head";
        } else if (regiondata.length > 0 && regiondata.length < 5){
            data.employee_designation = data.reporting_manager_designation = "Regional Head";
        } else if(parentUserData.is_state_access == 1) {
            data.employee_designation = data.reporting_manager_designation = "State Manager";
        } else if(parentUserData.is_lender_manager == 1) {
            data.employee_designation = data.reporting_manager_designation = "City Manager";
        } else if(parentUserData.is_branch_access == 1) {
            data.employee_designation = data.reporting_manager_designation = "Branch Manager";
        } else if (parentUserData.user_sub_type == "Officer") {
            data.employee_designation = data.reporting_manager_designation = "Officer";
        }
    }
    return exits.success(data);
    }
}