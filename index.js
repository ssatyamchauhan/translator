require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const cheerio = require("cheerio");

const morgan = require('morgan');
const Mongodb = require("./library/mongodb");
var query = require('querystring');
const axios = require("axios").default;
const ObjectID = require('mongodb').ObjectID;
const app = express()
const PORT = process.env.PORT || 6000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));


// let route = require('./routes');
// app.use('/v1', route.apiRoutes);

async function translate(text_to_en) {
    const text = query.escape(text_to_en);
    if (text_to_en != null && text_to_en) {
        const len = text_to_en.length;
        if (len > 1000) {
            console.log('length....', text_to_en, len)
            return `marathi:: ${text_to_en}`;
        }
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
    } else { return null }
}

function isNumeric(num) {
    if (!num) { return false }
    return !isNaN(num)
}

async function htmltoJson(text_to_en) {
    //  console.log('text to htmltoJson', text_to_en)

    if (text_to_en != null) {
        // const $ = cheerio.load(text_to_en);
        // const tbody = await $("table.tblmargin > tbody > tr");
        // const dataObj = {};
        // const keys = ['DocType', 'Compensation', 'MarketPrice', 'SubDivisionHouseNo', 'Area', 'Levy', 'NameAndAddressPartyOfExecutingDocument', 'NameAndAddressOfDefedent', 'DocumentSubmissionDate', 'DateOfRegistrationDeed', 'SerialNumber', 'MarketRateStampDuty', 'MarketRateRegistrationFee', 'Shera', 'OtherDetails'];
        // let index = 0;
        // for (let el of tbody) {
        //     let data = $(el).children("td:nth-child(2)").text();
        //     dataObj[keys[index]] = await translate(data);
        //     index += 1
        // };
        // return dataObj;


        const dataObj = {};
        const $ = cheerio.load(text_to_en);
        const top_tbody = await $("body > table:nth-child(1) > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1)");
        const SecondaryRegistrar = $(top_tbody).children("td:nth-child(1)").text();
        if (SecondaryRegistrar) {
            const arr = SecondaryRegistrar.split(":");
            if (arr && arr.length > 1) {
                dataObj.SecondaryRegistrar = await translate(arr[1]);
            }
        }
        const Village_Name = await $("body > table:nth-child(2) > tbody > tr:nth-child(2) > td > p > font").text();

        if (Village_Name != null) {
            dataObj.VillageName = await translate(Village_Name);
        }


        const tbody = await $("table.tblmargin > tbody > tr");
        const keys = ['DocType', 'Compensation', 'MarketPrice', 'SubDivisionHouseNo', 'Area', 'Levy', 'NameAndAddressPartyOfExecutingDocument', 'NameAndAddressOfDefedent', 'DocumentSubmissionDate', 'DateOfRegistrationDeed', 'SerialNumber', 'MarketRateStampDuty', 'MarketRateRegistrationFee', 'Shera', 'OtherDetails', 'DetailsConsideredForAssessment'];
        let index = 0;
        for (let el of tbody) {
            let data = $(el).children("td:nth-child(2)").text();
            if (data) { data = data.trim() }
            //            console.log('isNumeric', isNumeric(data))
            if (keys[index] && !isNumeric(data)) {
                dataObj[keys[index]] = await translate(data);
            } else if (keys[index]) {
                dataObj[keys[index]] = data;
            }
            //dataObj[keys[index]] = await translate(data);
            index += 1
        };
        return dataObj
    } else {
        return null
    }
}

async function main() {
    try {
        const { Find, Insert } = require("./library/methods");
        // console.log(fullData);
        // return
        for (let count = 0; count < 10000; count += 10) {
            const fullData = await Find('rowdata', {}, count, 10, {});
            let dataToInsert = [];
            console.log('skip', count, 'limit', count + 10, dataToInsert.length)
            for (let d of fullData) {
                console.log('d', d.d_name)
                if (d.d_name && d.d_name.length) {
                    const translate_d_name = await translate(d.d_name);
                    if (translate_d_name) {
                        d.d_name = translate_d_name;
                    }
                }
                if (d.sro_name && d.sro_name.length) {
                    const translate_sro_name = await translate(d.sro_name);
                    if (translate_sro_name) {
                        d.sro_name = translate_sro_name;
                    }
                }
                if (d.seller_name && d.seller_name.length) {
                    const translate_seller_name = await translate(d.seller_name);
                    if (translate_seller_name) {
                        d.seller_name = translate_seller_name;
                    }
                }
                if (d.purchaser_name && d.purchaser_name.length) {
                    const translate_p_name = await translate(d.purchaser_name);
                    if (translate_p_name) {
                        d.purchaser_name = translate_p_name;
                    }
                }
                // property_description
                if (d.property_description && d.property_description.length) {
                    const translate_property_description = await translate(d.property_description);
                    if (translate_property_description) {
                        d.property_description = translate_property_description;
                    }
                }
                if (d.pdf_data && d.pdf_data.length) {
                    const translatedoc_html = await htmltoJson(d.pdf_data);
                    if (translatedoc_html) {
                        d.pdf_data = translatedoc_html;
                    }
                }

                /*                if (d.d_name && d.d_name.length) {
                //                    const translate_d_name = await translate(d.d_name);
                                    if (translate_d_name) {
                                        d.d_name = translate_d_name;
                                    }
                                }
                                if (d.doc_html && d.doc_html.length) {
                                    const translatedoc_html = await htmltoJson(d.doc_html);
                                    if (translatedoc_html) {
                                        d.doc_html = translatedoc_html;
                                    }
                                }
                
                
                                if (d.input && Object.keys(d.input).length) {
                                    const sro_name_en = await translate(d.input.sro_name)
                                    if (sro_name_en) {
                                        d.input.sro_name = sro_name_en
                                    }
                
                                    const d_name_en = await translate(d.input.d_name);
                                    if (d_name_en) {
                                        d.input.d_name = d_name_en;
                                    }
                
                                    const property_description_en = await translate(d.input.property_description)
                                    if (property_description_en) {
                                        d.input.property_description = property_description_en
                                    }
                
                                    const purchaser_name_en = await translate(d.input.purchaser_name);
                                    if (purchaser_name_en) {
                                        d.input.purchaser_name = purchaser_name_en
                                    }
                                    const seller_name_en = await translate(d.input.seller_name);
                                    if (seller_name_en) {
                                        d.input.seller_name = seller_name_en;
                                    } */

                //                }


                dataToInsert.push(d);
            }
            console.log(dataToInsert)
            await Insert("english_data", dataToInsert)
        }
    } catch (error) {
        console.error('Error in main function', error);
    }
}

Mongodb().then((db) => {
    app.listen(PORT, () => {
        //   main()

        console.info("You App is listening", `http://localhost:${PORT}`)
    })
}).catch((error) => { console.error('Error Connecting Mongodb', error) })