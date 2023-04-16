require("dotenv").config()
const cheerio = require("cheerio");
const axios = require("axios").default
const mongodb = require("./library/mongodb");
const { Insert } = require("./library/method");
const table = "company"

const urls = [
      "https://www.companydetails.in/industry/agriculture-and-allied-activities",
      "https://www.companydetails.in/industry/business-services",
      "https://www.companydetails.in/industry/community-personal-and-social-services",
      "https://www.companydetails.in/industry/construction",
      "https://www.companydetails.in/industry/electricity-gas-and-water-companies",
      "https://www.companydetails.in/industry/community-personal-and-social-services",
      "https://www.companydetails.in/industry/finance",
      "https://www.companydetails.in/industry/insurance",
      "https://www.companydetails.in/industry/manufacturing-food-stuff",
      "https://www.companydetails.in/industry/manufacturing-leather-and-products-thereo",
      "https://www.companydetails.in/industry/manufacturing-machinery-and-equipment",
      "https://www.companydetails.in/industry/manufacturing-metals-and-chemicals-and-products-thereo",
      "https://www.companydetails.in/industry/manufacturing-other",
      "https://www.companydetails.in/industry/manufacturing-paper-and-paper-products-publishin",
      "https://www.companydetails.in/industry/manufacturing-textile",
      "https://www.companydetails.in/industry/mining-and-quarrying",
      "https://www.companydetails.in/industry/printing-and-reproduction-of-recorded-medi",
      "https://www.companydetails.in/industry/real-estate-and-renting",
      "https://www.companydetails.in/industry/trading",
      "https://www.companydetails.in/industry/transport-storage-and-communications"
]
const pages = [
      "09",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z"
]

async function get_html(url) {
      try {
            const response = await axios.get(url);
            if (response && response.data) {
                  return response.data
            } else {
                  return null;
            }
      } catch (error) {
            get_html(url)
      }
}

async function main() {
      for (let url of urls) {
            console.log('processing', url);
            for (let page of pages) {
                  console.log('Processing Page', page);
                  const html = await get_html(url + "/" + page);
                  if (html) {
                        const $ = await cheerio.load(html);
                        const divList = [];
                        const divElements = await $('div.shadow-sm');
                        for (let i = 0; i < divElements.length; i++) {
                              const element = divElements[i];
                              divList.push($(element));
                        }
                        if (divList) {
                              const data = []
                              for (let el of divList) {
                                    const html = await $(el).html()
                                    const cheerio_instance = cheerio.load(html);
                                    const name = cheerio_instance('h3 a').text();
                                    const status = cheerio_instance('h5').text();
                                    const description = cheerio_instance('h6').text();
                                    const page_url = $('h3 a').attr('href');
                                    data.push({ name, status, description, page_url, page: page });
                              }
                              await Insert(table, data);
                        } else {
                              console.log('No DivList Found For Page', page)
                        }
                  } else {
                        console.log("No Data For Page", page)
                  }
            }
      }
      console.log('End of All Process');

}

mongodb().then(() => {
      main()
}).catch(error => console.error('Error', error))
