module.exports = {

    fn: async function (params, fields) {

        missingFields = [];

        var reqFields = new Map(Object.entries(params));    //creating map of params and storing in reqFields
        for (key in fields) {
            if (reqFields.has(fields[key])) {               //check if fields values are present in reqFields
                keyValue = reqFields.get(fields[key]);      //get value of the key
                if (!keyValue || keyValue === null || keyValue === undefined) {   //check for null or undefined value
                    missingFields.push(fields[key])
                }
            } else {
                missingFields.push(fields[key]);            // if required field is not passed in the params
            }
        }
        return missingFields;                               // array of missing fields
    }

}
