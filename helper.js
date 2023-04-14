var query = require('querystring');
const axios = require("axios").default;
const cheerio = require("cheerio");

function isNumeric(num) {
      if (!num) { return false }
      return !isNaN(num)
}

async function convertMarathiToEnglish(text_to_en) {
      try {
            const text = query.escape(text_to_en);
            if (text_to_en != null && text_to_en) {
                  const len = text_to_en.length;
                  if (len > 300) {
                        const chunks = [];
                        for (let i = 0; i < len; i += 300) {
                              chunks.push(text_to_en.substring(i, i + 300));
                        }

                        let text_to_return = '';
                        for (let chunk of chunks) {
                              const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=mr&tl=en&dt=t&q=${query.escape(chunk)}`)
                              if (response.status == 200 && response.data && response.data.length) {
                                    if (response.data[0] != null) {
                                          if (response.data[0].length) {
                                                for (let __ of response.data[0]) { text_to_return += __[0] }
                                          }
                                    }
                              }
                        }
                        return text_to_return;
                  } else {
                        const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=mr&tl=en&dt=t&q=${text}`)
                        if (response.status == 200 && response.data && response.data.length) {
                              if (response.data[0] != null) {
                                    let text_to_return = '';
                                    if (response.data[0].length) {
                                          for (let __ of response.data[0]) { text_to_return += __[0] }
                                          return text_to_return;
                                    }
                                    return null;
                              } else {
                                    return null
                              }
                        }
                  }
            } else { return null }
      } catch (error) {
            console.error('Error While converting to English', error);
            throw Error(error);
      }
}

async function htmlToJson(pdf_data) {
      if (pdf_data != null) {
            const dataObj = {};
            const $ = cheerio.load(pdf_data);
            const top_tbody = await $("body > table:nth-child(1) > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1)");
            const SecondaryRegistrar = $(top_tbody).children("td:nth-child(1)").text();
            if (SecondaryRegistrar) {
                  const arr = SecondaryRegistrar.split(":");
                  if (arr && arr.length > 1) {
                        dataObj.SecondaryRegistrar = arr[1]; // await translate(arr[1]);
                  }
            }
            const Village_Name = await $("body > table:nth-child(2) > tbody > tr:nth-child(2) > td > p > font").text();

            if (Village_Name != null) {
                  dataObj.VillageName = Village_Name // await translate(Village_Name);
            }


            const tbody = await $("table.tblmargin > tbody > tr");
            const keys = ['DocType', 'Compensation', 'MarketPrice', 'SubDivisionHouseNo', 'Area', 'Levy', 'NameAndAddressPartyOfExecutingDocument', 'NameAndAddressOfDefedent', 'DocumentSubmissionDate', 'DateOfRegistrationDeed', 'SerialNumber', 'MarketRateStampDuty', 'MarketRateRegistrationFee', 'Shera', 'OtherDetails', 'DetailsConsideredForAssessment'];
            let index = 0;
            for (let el of tbody) {
                  let data = $(el).children("td:nth-child(2)").text();
                  if (data) { data = data.trim() }
                  if (keys[index] && !isNumeric(data)) {
                        dataObj[keys[index]] = data;
                  } else if (keys[index]) {
                        dataObj[keys[index]] = data;
                  }
                  index += 1
            };
            return dataObj
      } else {
            return null
      }
}

module.exports = {
      convertMarathiToEnglish,
      htmlToJson
};
