var query = require('querystring');
const axios = require("axios").default;

// async function convertMarathiToEnglish(text_to_en) {
//       const text = query.escape(text_to_en);
//       if (text_to_en != null && text_to_en) {
//             const len = text_to_en.length;
//             if (len > 1000) {
//                   console.log('length....', text_to_en, len)
//                   return `marathi:: ${text_to_en}`;
//             }
//             const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=mr&tl=en&dt=t&q=${text}`)
//             if (response.status == 200 && response.data && response.data.length) {
//                   if (response.data[0] != null) {
//                         let text_to_return = '';
//                         if (response.data[0].length) {
//                               for (let __ of response.data[0]) { text_to_return += __[0] }
//                               return text_to_return;
//                         }
//                         return null;
//                   } else {
//                         return null
//                   }
//             }
//       } else { return null }
// }

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
                        console.log('chunks', chunk)
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


module.exports = {
      convertMarathiToEnglish
};
