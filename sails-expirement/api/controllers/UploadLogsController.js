// // const path = require('path');
// // const fs = require("fs");
// // const moment = require('moment');

// // let BlobService;
// // if (sails.config.azure.isActive) {
// //     const azure = require('azure-storage');
// //     BlobService = azure.createBlobService(
// //         sails.config.azure.prod_env.storage.storageAccountName,
// //         sails.config.azure.prod_env.storage.secret
// //     );
// // }

// module.exports = {

//     uploadLogs: async (req, res) => {
//         // const dateTime = moment(await sails.helpers.dateTime())
//         //     .format('DD_MMMM_YYYY')
//         //     .toString();
//         // const logPath = path.join(__dirname, "../../logs");
//         // const noOfFile = await fs.readdirSync(logPath);
//         // for (let i in noOfFile) {
//         //     if (noOfFile[i] != 'error.log' && noOfFile[i] != 'info.log' && noOfFile[i] != 'warn.log') {
//         //         const filePath = logPath + "/" + noOfFile[i];
//         //         const fileName = Math.round(new Date()) + "_" + noOfFile[i];

//         //         if (sails.config.azure.isActive) {
//         //             const container = sails.config.azure.prod_env.storage.logContainer;

//         //             let result = await new Promise((resolve, reject) => {
//         //                 BlobService.createBlockBlobFromLocalFile(container, dateTime + '/' + fileName, filePath, (error, result, response) => {
//         //                     if (!error)
//         //                         fs.unlink(filePath, (err) => { });
//         //                     return resolve("success");
//         //                 });
//         //             });
//         //         }
//         //     }
//         // }
//         return res.send({
//             status: "ok"
//         })
//     }
// };
