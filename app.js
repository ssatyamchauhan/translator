require("dotenv").config();
const { MongoClient } = require("mongodb");
const Mongodb = require("./library/mongodb");
const Mongodb_Local = require("./local_library/local_mongodb");
const axios = require("axios").default;
const ObjectID = require('mongodb').ObjectID;
// var googleTranslate = require('google-translate')("AIzaSyBAny6QBIiofzwPVCsJm3SIBJZQyWHdwOo");
const projectId = 'brant-380809';
var query = require('querystring');

async function translate(text_to_en) {
    const text = query.escape(text_to_en);
    const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=mr&tl=en&dt=t&q=${text}`)
    if (response.status == 200 && response.data && response.data.length) {
        return response.data[0][0][0]
    }
}

async function main() {
    const { Find } = require("./library/methods");
    const { Insert_local } = require("./local_library/methods");

    for (let count = 170; count < 50000; count += 10) {
        const mh_data = await Find("mh", {}, count, 10, {});
        let dataToInsert = [];
        console.log('skip', count, 'limit', count+10, dataToInsert.length)
        for (let d of mh_data) {
            if (d.village_names && d.village_names.length) {
                const village_name_en = [];
                for (let village of d.village_names) {
                    const translated_data = await translate(village)
                    village_name_en.push(translated_data)
                }
                d.village_names = village_name_en;
            }
            if (d.primary_data && Object.keys(d.primary_data).length) {
                const primary_data = d.primary_data;
                const doc_name_en = await translate(d.primary_data.doc_name)
                const d_name_en = await translate(d.primary_data.d_name)
                primary_data.doc_name = doc_name_en;
                primary_data.d_name = d_name_en;

                d.primary_data = primary_data;
            }
            if (d.seller_lessor_details && d.seller_lessor_details.length) {
                const seller_details = [];
                for (let seller of d.seller_lessor_details) {
                    let new_seller = seller;
                    if (seller.name && seller.name.length > 1) {
                        const seller_name_en = await translate(seller.name);
                        new_seller.name = seller_name_en;
                    }
                    if (seller.address && seller.address.length > 1) {
                        const seller_address_en = await translate(seller.address);
                        new_seller.address = seller_address_en;
                    }
                    seller_details.push(new_seller);
                }
                d.seller_lessor_details = seller_details;
            }
            if (d.deed_type && d.deed_type.length) {
                const translate_deed_type = await translate(d.deed_type);
                if (translate_deed_type) {
                    d.deed_type = translate_deed_type;
                }
            }
            if (d.input && Object.keys(d.input).length) {
                const sro_name_en = await translate(d.input.sro_name)
                if (sro_name_en) {
                    d.input.sro_name = sro_name_en
                }
                const purchaser_name_en = await translate(d.input.purchaser_name);
                if (purchaser_name_en) {
                    d.input.purchaser_name = purchaser_name_en
                }
                const seller_name_en = await translate(d.input.seller_name);
                if (seller_name_en) {
                    d.input.seller_name = seller_name_en;
                }

                const d_name_en = await translate(d.input.d_name);
                if (d_name_en) {
                    d.input.d_name = d_name_en;
                }

                const property_description_en = await translate(d.input.property_description)
                if (property_description_en) {
                    d.input.property_description = property_description_en
                }
            }
            if (d.secondary_registrar && d.secondary_registrar.length) {
                const secondary_registrar_en = await translate(d.secondary_registrar);
                if (secondary_registrar_en) {
                    d.secondary_registrar = secondary_registrar_en;
                }
            }
            if (d.buyer_lessee_details && d.buyer_lessee_details.length) {
                const buyer_details = [];
                for (let buyer of d.buyer_lessee_details) {
                    let new_buyer = buyer;
                    if (buyer.name && buyer.name.length > 1) {
                        const buyer_name_en = await translate(buyer.name);
                        new_buyer.name = buyer_name_en;
                    }
                    if (buyer.address && buyer.address.length > 1) {
                        const buyer_address_en = await translate(buyer.address);
                        new_buyer.address = buyer_address_en;
                    }
                    buyer_details.push(new_buyer);
                }
                d.buyer_lessee_details = buyer_details;
            }
            if (d.area && d.area.length) {
                const area_en = [];
                for (let ar of d.area) {
                    if (ar && ar.length > 1) {
                        const translated_data = await translate(ar)
                        area_en.push(translated_data)
                    }
                }
                d.area = area_en;
            }
            if (d.title && d.title.length) {
                const title_en = await translate(d.title);
                if (title_en) {
                    d.title = title_en;
                }
            }

            if (d.property_details && d.property_details.length) {
                const property_details_en = await translate(d.property_details);
                if (property_details_en) {
                    d.property_details = property_details_en;
                }
            }
            dataToInsert.push(d);
        }

        await Insert_local("mh", dataToInsert)
        // const data_from_brant = await I("rowdatas")
    }

    // const translated_data = await translate("फ्लॅट नं  2503 , 25 वा मजला, देास्ती अॅम्ब्रोसिया, दोस्ती एकर्स प्रोजेक्ट, वडाळा पू मुं 37");

}

Mongodb_Local().then(() => {
    Mongodb().then(() => {
        console.log('connected')
        main();
    }).catch((error) => { console.error('Error Connecting Mongodb', error) })
}).catch((error) => console.log(error));





