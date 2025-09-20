module.exports = {
    inputs : {
        amount : {
            type : "string",
            required : true
        },
        amount_um : {
            type : "string"
        }
    },
    exits: {
		success: {
			description: "success"
		}
	},
    fn : async function(inputs, exits){
        let {amount, amount_um} = inputs;
        let value, value_um = "";
        if (amount_um){
            amount_value = amount_um == "Lakhs" ? Number(amount) * 100000 : Number(amount) * 10000000;
            value = Math.round(amount_value);
        } else {
            if (amount >= 10000000) {
                value = (amount / 10000000);
                value_um  = "Crores";
            } else {
                value = (amount / 100000);
                value_um  = "Lakhs";
            }
        }
        return exits.success({status : "ok", value:value, value_um:value_um});
    }
}
