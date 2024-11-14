const maxTimeAllowed = 50, maxAttemptsAllowed = 4;

module.exports = {
  udyogData: async function (req, res) {
    let uanNo = req.param("uan");
    if (!uanNo) {
      return res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass uan in request payload.",
      });
    }
    uanNoValidation = /^[A-Za-z]{2}\d{2}[A-Za-z]{1}\d{7}$/;
    if (uanNoValidation.test(uanNo) === false) {
      return res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass correct UAN",
      });
    }
    const DataUniqueId = await sails.helpers.getUniqueId();

    try {
      /* Create initial record for the request */
      const currentDate = await sails.helpers.dateTime();
      await ClientRequest.create({
        request_id: DataUniqueId,
        req_datetime: currentDate,
        req_status: "initiate",
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        client_id: req.client_id,
        req_type: 'UDYOG',
      });
      await RequestDocument.create({
        client_id: req.client_id,
        request_id: DataUniqueId,
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        CIN_GST_PAN_number: uanNo,
        request_type: 'UDYOG',
      });
      const responseStatus = { status: "ok", statusCode: "NC200", requestId: DataUniqueId };
      body = {
        uan: uanNo,
      };
      auth = {
        "Content-Type": "application/json",
      };

      let result, attempt = 1, seconds = 0, interval;

      let getResult = new Promise((resolve, reject) => {
        interval = setInterval(() => {
          if (result) {
            clearInterval(interval);
            resolve(result);
          }
          else if (attempt > maxAttemptsAllowed || seconds > maxTimeAllowed) {
            clearInterval(interval);
            reject([500, {
              status: 'nok',
              statusCode: 'NC500',
              resCode: 'SERVERR',
              message: 'It took longer than expected. Please try again.'
            }]);
          }
          seconds++;
        }, 1000);
      });

      const main = async () => {
        while (attempt <= maxAttemptsAllowed && seconds <= maxTimeAllowed) {
          const crawlUdyogAadhaarResponse = await sails.helpers.apiTrigger(
            sails.config.crawler_urls.crawl_UdyogAadhaar,
            JSON.stringify(body),
            auth,
            "POST"
          );
          console.log(
            crawlUdyogAadhaarResponse,
            crawlUdyogAadhaarResponse.status == "nok",
            crawlUdyogAadhaarResponse.status
          );
          if (crawlUdyogAadhaarResponse.status == "nok") {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "failed",
              updated_at: currentDate,
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlUdyogAadhaarResponse.result
            });
            const errorResponse = JSON.parse(crawlUdyogAadhaarResponse.result);
            responseStatus.status = "nok";
            if (
              errorResponse.resCode == "INVUDYOG" ||
              errorResponse.resCode == "BADREQ"
            ) {
              responseStatus.statusCode = "NC400";
              result = [400, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (errorResponse.resCode == "NOTFOUND") {
              responseStatus.statusCode = "NC404";
              result = [404, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (attempt >= maxAttemptsAllowed) {
              responseStatus.statusCode = "NC500";
              responseStatus.resCode = "SERVERR";
              responseStatus.message = "Server error occurred. Please try again.";
              result = [500, responseStatus];
              break;
            }
          } else {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "completed",
              updated_at: currentDate,
              req_type: 'UDYOG',
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlUdyogAadhaarResponse
            });
            const crawlUdyogAadhaarObj = JSON.parse(crawlUdyogAadhaarResponse);
            result = [200, Object.assign(responseStatus, crawlUdyogAadhaarObj)];
            break;
          }
          attempt++;
        }
      }

      main();

      result = await getResult;

      return res.status(result[0]).send(result[1]);
    } catch (err) {
      if (err[0] && err[1]) return res.status(err[0]).send(err[1]);
      else return res.status(500).send({
        status: 'nok',
        statusCode: 'NC500',
        resCode: 'SERVERR',
        message: 'Server error occurred. Please try again.'
      });
    }

  },

  leiData: async function (req, res) {
    const leiID = req.param("leiId");
    if (!leiID) {
      return req.res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass leiId in request payload.",
      });
    }
    if (leiID.length !== 20) {
      return res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass correct LEI number",
      });
    }
    const DataUniqueId = await sails.helpers.getUniqueId();
    try {
      /* Create initial record for the request */
      const currentDate = await sails.helpers.dateTime();
      await ClientRequest.create({
        request_id: DataUniqueId,
        req_datetime: currentDate,
        req_status: "initiate",
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        client_id: req.client_id,
        req_type: 'LEI',
      });
      await RequestDocument.create({
        client_id: req.client_id,
        request_id: DataUniqueId,
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        CIN_GST_PAN_number: leiID,
        request_type: 'LEI',
      });
      const responseStatus = { status: "ok", statusCode: "NC200", requestId: DataUniqueId };
      body = {
        leiId: leiID,
      };
      auth = {
        "Content-Type": "application/json",
      };

      let result, attempt = 1, seconds = 0, interval;

      let getResult = new Promise((resolve, reject) => {
        interval = setInterval(() => {
          if (result) {
            clearInterval(interval);
            resolve(result);
          }
          else if (attempt > maxAttemptsAllowed || seconds > maxTimeAllowed) {
            clearInterval(interval);
            reject([500, {
              status: 'nok',
              statusCode: 'NC500',
              resCode: 'SERVERR',
              message: 'It took longer than expected. Please try again.'
            }]);
          }
          seconds++;
        }, 1000);
      });

      const main = async () => {
        while (attempt <= maxAttemptsAllowed && seconds <= maxTimeAllowed) {
          const crawlLeiResponse = await sails.helpers.apiTrigger(
            sails.config.crawler_urls.crawl_lei,
            JSON.stringify(body),
            auth,
            "POST"
          );
          console.log(
            crawlLeiResponse,
            crawlLeiResponse.status == "nok",
            crawlLeiResponse.status
          );
          if (crawlLeiResponse.status == "nok") {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "failed",
              updated_at: currentDate,
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlLeiResponse.result
            });
            const errorResponse = JSON.parse(crawlLeiResponse.result);
            responseStatus.status = "nok";
            if (errorResponse.resCode == "BADREQ") {
              responseStatus.statusCode = "NC400";
              result = [400, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (errorResponse.resCode == "NOTFOUND") {
              responseStatus.statusCode = "NC404";
              result = [404, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (attempt >= maxAttemptsAllowed) {
              responseStatus.statusCode = "NC500";
              responseStatus.resCode = "SERVERR";
              responseStatus.message = "Server error occurred.";
              result = [500, responseStatus];
              break;
            }
          } else {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "completed",
              updated_at: currentDate,
              req_type: 'LEI',
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlLeiResponse
            });
            const crawlLeiObj = JSON.parse(crawlLeiResponse);
            result = [200, Object.assign(responseStatus, crawlLeiObj)];
            break;
          }
        }
      };

      main();
      result = await getResult;
      return res.status(result[0]).send(result[1]);

    } catch (err) {
      if (err[0] && err[1]) return res.status(err[0]).send(err[1]);
      else return res.status(500).send({
        status: 'nok',
        statusCode: 'NC500',
        resCode: 'SERVERR',
        message: 'Server error occurred. Please try again.'
      });
    }

  },

  pan_aadhaar_link_status: async function (req, res) {
    const panNum = req.param("pan"),
      aadhaarNum = req.param("aadhaar");
    if (!panNum || !aadhaarNum) {
      return req.res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass PAN & Aadhaar number in request payload.",
      });
    }
    panNumValidation = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
    aadhaarNoValidation = /^\d{12}$/;
    if (
      panNumValidation.test(panNum) === false ||
      aadhaarNoValidation.test(aadhaarNum) === false
    ) {
      return res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass correct PAN or Aadhaar number",
      });
    }
    const DataUniqueId = await sails.helpers.getUniqueId();

    try {
      /* Create initial record for the request */
      const currentDate = await sails.helpers.dateTime();
      await ClientRequest.create({
        request_id: DataUniqueId,
        req_datetime: currentDate,
        req_status: "initiate",
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        client_id: req.client_id,
        req_type: 'PAN-AADHAAR-LINKAGE',
      });
      await RequestDocument.create({
        client_id: req.client_id,
        request_id: DataUniqueId,
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        CIN_GST_PAN_number: panNum + "-" + aadhaarNum,
        request_type: 'PAN-AADHAAR-LINKAGE',
      });
      const responseStatus = { status: "ok", statusCode: "NC200", requestId: DataUniqueId };
      body = {
        pan: panNum,
        aadhaar: aadhaarNum,
      };
      auth = {
        "Content-Type": "application/json",
      };

      let result, attempt = 1, seconds = 0, interval;

      let getResult = new Promise((resolve, reject) => {
        interval = setInterval(() => {
          if (result) {
            clearInterval(interval);
            resolve(result);
          }
          else if (attempt > maxAttemptsAllowed || seconds > maxTimeAllowed) {
            clearInterval(interval);
            reject([500, {
              status: 'nok',
              statusCode: 'NC500',
              resCode: 'SERVERR',
              message: 'It took longer than expected. Please try again.'
            }]);
          }
          seconds++;
        }, 1000);
      });


      const main = async () => {
        while (attempt <= maxAttemptsAllowed && seconds <= maxTimeAllowed) {
          let crawlPanAadhaarLinkStatusResponse = await sails.helpers.apiTrigger(
            sails.config.crawler_urls.crawl_panAadhaarLinkStatus,
            JSON.stringify(body),
            auth,
            "POST"
          );
          console.log(
            crawlPanAadhaarLinkStatusResponse,
            crawlPanAadhaarLinkStatusResponse.status == "nok",
            crawlPanAadhaarLinkStatusResponse.status
          );
          if (crawlPanAadhaarLinkStatusResponse.status == "nok") {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "failed",
              updated_at: currentDate,
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlPanAadhaarLinkStatusResponse.result
            });
            const errorResponse = JSON.parse(
              crawlPanAadhaarLinkStatusResponse.result
            );
            responseStatus.status = "nok";
            if (errorResponse.resCode == "BADREQ") {
              responseStatus.statusCode = "NC400";
              result = [400, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (errorResponse.resCode == "NOTFOUND") {
              responseStatus.statusCode = "NC404";
              result = [404, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (attempt >= maxAttemptsAllowed) {
              responseStatus.statusCode = "NC500";
              responseStatus.resCode = "SERVERR";
              responseStatus.message = "Server error occurred.";
              result = [500, responseStatus];
              break;
            }
          } else {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            let crawlPanAadhaarLinkStatusObj = JSON.parse(crawlPanAadhaarLinkStatusResponse);
            crawlPanAadhaarLinkStatusObj.data.requestTime = currentDate;
            crawlPanAadhaarLinkStatusResponse = JSON.stringify(crawlPanAadhaarLinkStatusObj);
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "completed",
              updated_at: currentDate,
              req_type: 'PAN-AADHAAR-LINKAGE',
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlPanAadhaarLinkStatusResponse
            });

            result = [200, Object.assign(responseStatus, crawlPanAadhaarLinkStatusObj)];
            break;
          }
        }

      }

      main();
      result = await getResult;
      return res.status(result[0]).send(result[1]);

    } catch (err) {
      if (err[0] && err[1]) return res.status(err[0]).send(err[1]);
      else return res.status(500).send({
        status: 'nok',
        statusCode: 'NC500',
        resCode: 'SERVERR',
        message: 'Server error occurred. Please try again.'
      });
    }

  },

  udyamData: async function (req, res) {
    const udyamRegNum = req.param("udyamRegNo");

    if (!udyamRegNum) {
      return req.res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass udyamRegNo in request payload.",
      });
    }

    udyamRegNumValidation = /^[A-Za-z]{5}[-]{1}[A-Za-z]{2}[-]{1}\d{2}[-]{1}\d{7}$/;

    if (udyamRegNumValidation.test(udyamRegNum) === false) {
      return res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass correct Udyam Reg Number",
      });
    }

    const DataUniqueId = await sails.helpers.getUniqueId();

    try {
      /* Create initial record for the request */
      const currentDate = await sails.helpers.dateTime();

      await ClientRequest.create({
        request_id: DataUniqueId,
        req_datetime: currentDate,
        req_status: "initiate",
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        client_id: req.client_id,
        req_type: 'UDYAM',
      });

      await RequestDocument.create({
        client_id: req.client_id,
        request_id: DataUniqueId,
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        CIN_GST_PAN_number: udyamRegNum,
        request_type: 'UDYAM',
      });

      body = {
        udyamRegNo: udyamRegNum,
        request_id: DataUniqueId
      };

      auth = {
        "Content-Type": "application/json",
        "Authorization": sails.config.signzy.udyam.accessToken
      };

      res.send({
        status: "ok",
        request_id: DataUniqueId
      });

      try {
        // let crawlUdyamDataResponse = await sails.helpers.apiTrigger(
        //   sails.config.crawler_urls.crawl_udyamData,
        //   JSON.stringify(body),
        //   auth,
        //   "POST"
        // );

        let crawlUdyamDataResponse = await sails.helpers.apiTrigger(
          sails.config.signzy.udyam.url,
          JSON.stringify({
            "udyamNumber": udyamRegNum
          }),
          auth,
          "POST"
        );
        crawlUdyamDataResponse = JSON.parse(crawlUdyamDataResponse);

        console.log(crawlUdyamDataResponse);
        if (DataUniqueId && crawlUdyamDataResponse) await RequestDocument.updateOne({
          request_id: DataUniqueId
        }).set({
          response: JSON.stringify(crawlUdyamDataResponse)
        });
      } catch (err) {

      }

      return;
      // let result, attempt = 1, seconds = 0, interval;

      // let getResult = new Promise((resolve, reject) => {
      //   interval = setInterval(() => {
      //     if (result) {
      //       clearInterval(interval);
      //       resolve(result);
      //     }
      //     else if (attempt > maxAttemptsAllowed || seconds > maxTimeAllowed) {
      //       clearInterval(interval);
      //       reject([500, {
      //         status: 'nok',
      //         statusCode: 'NC500',
      //         resCode: 'SERVERR',
      //         message: 'It took longer than expected. Please try again.'
      //       }]);
      //     }
      //     seconds++;
      //   }, 1000);
      // });

      // const main = async () => {
      //   while (attempt <= maxAttemptsAllowed && seconds <= maxTimeAllowed) {
      //     let crawlUdyamDataResponse = await sails.helpers.apiTrigger(
      //       sails.config.crawler_urls.crawl_udyamData,
      //       JSON.stringify(body),
      //       auth,
      //       "POST"
      //     );
      //     crawlUdyamDataResponse = JSON.parse(crawlUdyamDataResponse);
      //     // console.log(
      //     //   crawlUdyamDataResponse,
      //     //   crawlUdyamDataResponse.status == "nok",
      //     //   crawlUdyamDataResponse.status
      //     // );
      //     if (crawlUdyamDataResponse.resCode != "SUCCESS") {
      //       /* update database*/
      //       const currentDate = await sails.helpers.dateTime();
      //       await ClientRequest.update({ request_id: DataUniqueId }).set({
      //         req_status: "failed",
      //         updated_at: currentDate,
      //       });
      //       await RequestDocument.update({ request_id: DataUniqueId }).set({
      //         updated_at: currentDate, response: JSON.stringify(crawlUdyamDataResponse)
      //       });
      //       const errorResponse = crawlUdyamDataResponse;
      //       responseStatus.status = "nok";
      //       if (
      //         errorResponse.resCode == "INVUDYAM" ||
      //         errorResponse.resCode == "BADREQ"
      //       ) {
      //         responseStatus.statusCode = "NC400";
      //         result = [400, Object.assign(responseStatus, errorResponse)];
      //         break;
      //       } else if (errorResponse.resCode == "NOTFOUND") {
      //         responseStatus.statusCode = "NC404";
      //         result = [404, Object.assign(responseStatus, errorResponse)];
      //         break;
      //       } else if (attempt >= maxAttemptsAllowed) {
      //         responseStatus.statusCode = "NC500";
      //         responseStatus.resCode = "SERVERR";
      //         responseStatus.message = "Server error occurred.";
      //         result = [500, responseStatus];
      //         break;
      //       }
      //     } else {
      //       /* update database*/
      //       const currentDate = await sails.helpers.dateTime();
      //       await ClientRequest.update({ request_id: DataUniqueId }).set({
      //         req_status: "completed",
      //         updated_at: currentDate,
      //         req_type: 'UDYAM',
      //       });
      //       await RequestDocument.update({ request_id: DataUniqueId }).set({
      //         updated_at: currentDate, response: JSON.stringify(crawlUdyamDataResponse)
      //       });
      //       //const crawlUdyamDataObj = JSON.parse(crawlUdyamDataResponse);
      //       result = [200, Object.assign(responseStatus, crawlUdyamDataResponse)];
      //       break;
      //     }
      //     attempt++;
      //   }
      // }

      // main();

      // result = await getResult;
      // return res.status(result[0]).send(result[1]);

    } catch (err) {
      if (err[0] && err[1]) return res.status(err[0]).send(err[1]);
      else return res.status(500).send({
        status: 'nok',
        statusCode: 'NC500',
        resCode: 'SERVERR',
        message: 'Server error occurred. Please try again.'
      })
    }
  },

  ckycData: async function (req, res) {
    const pan = req.param("pan");
    if (!pan) {
      return req.res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass pan in request payload.",
      });
    }
    panNumValidation = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
    if (panNumValidation.test(pan) === false) {
      return res.badRequest({
        status: "nok",
        statusCode: "NC400",
        resCode: "BADREQ",
        message: "Please pass correct  pan Number",
      });
    }
    const DataUniqueId = await sails.helpers.getUniqueId();

    try {
      /* Create initial record for the request */
      const currentDate = await sails.helpers.dateTime();
      await ClientRequest.create({
        request_id: DataUniqueId,
        req_datetime: currentDate,
        req_status: "initiate",
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        client_id: req.client_id,
        req_type: 'CKYC',
      });
      await RequestDocument.create({
        client_id: req.client_id,
        request_id: DataUniqueId,
        is_active: "active",
        created_at: currentDate,
        updated_at: currentDate,
        CIN_GST_PAN_number: pan,
        request_type: 'CKYC',
      });
      const responseStatus = { status: "ok", statusCode: "NC200", requestId: DataUniqueId };
      body = {
        pan: pan,
      };
      auth = {
        "Content-Type": "application/json",
      };

      let result, attempt = 1, seconds = 0, interval;

      let getResult = new Promise((resolve, reject) => {
        interval = setInterval(() => {
          if (result) {
            clearInterval(interval);
            resolve(result);
          }
          else if (attempt > maxAttemptsAllowed || seconds > maxTimeAllowed) {
            clearInterval(interval);
            reject([500, {
              status: 'nok',
              statusCode: 'NC500',
              resCode: 'SERVERR',
              message: 'It took longer than expected. Please try again.'
            }]);
          }
          seconds++;
        }, 1000);
      });

      const main = async () => {
        while (attempt <= maxAttemptsAllowed && seconds <= maxTimeAllowed) {
          const crawlCkycDataResponse = await sails.helpers.apiTrigger(
            sails.config.crawler_urls.crawl_ckyc,
            JSON.stringify(body),
            auth,
            "POST"
          );
          console.log(
            crawlCkycDataResponse,
            crawlCkycDataResponse.status == "nok",
            crawlCkycDataResponse.status
          );
          if (crawlCkycDataResponse.status == "nok") {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "failed",
              updated_at: currentDate,
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlCkycDataResponse.result
            });
            const errorResponse = JSON.parse(crawlCkycDataResponse.result);
            responseStatus.status = "nok";
            if (
              errorResponse.resCode == "INVPAN" ||
              errorResponse.resCode == "BADREQ"
            ) {
              responseStatus.statusCode = "NC400";
              result = [400, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (errorResponse.resCode == "NOTFOUND") {
              responseStatus.statusCode = "NC404";
              result = [404, Object.assign(responseStatus, errorResponse)];
              break;
            } else if (attempt >= maxAttemptsAllowed) {
              responseStatus.statusCode = "NC500";
              responseStatus.resCode = "SERVERR";
              responseStatus.message = "Server error occurred.";
              result = [500, responseStatus];
              break;
            }
          } else {
            /* update database*/
            const currentDate = await sails.helpers.dateTime();
            await ClientRequest.update({ request_id: DataUniqueId }).set({
              req_status: "completed",
              updated_at: currentDate
            });
            await RequestDocument.update({ request_id: DataUniqueId }).set({
              updated_at: currentDate, response: crawlCkycDataResponse
            });
            const crawlCkycDataObj = JSON.parse(crawlCkycDataResponse);
            result = [200, Object.assign(responseStatus, crawlCkycDataObj)];
            break;
          }
          attempt++;
        }
      }

      main();

      result = await getResult;
      return res.status(result[0]).send(result[1]);

    } catch (err) {
      console.log(err);
      if (err[0] && err[1]) return res.status(err[0]).send(err[1]);
      else return res.status(500).send({
        status: 'nok',
        statusCode: 'NC500',
        resCode: 'SERVERR',
        message: 'Server error occurred. Please try again.'
      })
    }
  }
};
