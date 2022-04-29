require('dotenv').config()

const axios = require('axios')
const cheerio = require('cheerio')

const data = []
const flatUrl = 'https://www.ss.lv/lv/real-estate/flats/valmiera-and-reg/valmiera/sell/'
const homeUrl = 'https://www.ss.lv/lv/real-estate/homes-summer-residences/valmiera-and-reg/sell/'
const landUrl = 'https://www.ss.lv/lv/real-estate/plots-and-lands/valmiera-and-reg/valmiera/sell/'
const apikey = process.env.TELEGRAM_KEY
const chat = process.env.CHAT
const is_first = {
    flat: true,
    home: true,
    land: true,
}



async function getData(url, type) {
    const html = await axios.get(url)
    const $ = cheerio.load(html.data)
    $('#filter_frm table:nth-child(3) tr').each(async (i, elem) => {
        const item = {
            id: $(elem).attr('id'),
            link: $(elem).find('.msg2 a').attr('href'),
            amount: $(elem).find('td:nth-last-child(1)').text(),
        }
        if (item.link && !data[item.id]) {
            item.link = 'https://www.ss.lv/' + item.link
            data[item.id] = item
            if (!is_first[type]) {
                sendToTelegram(item)
            }
        }
    });
    is_first[type] = false
    console.log(`Tested ${type} at ${new Date().toLocaleString()}` )
}

async function sendToTelegram(item) {
    const text = `Cena: ${item.amount} \nLinks: ${item.link}`
    const url = `https://api.telegram.org/bot${apikey}/sendMessage?chat_id=${chat}&text=${text}`
    axios.get(encodeURI(url))
}

setInterval(() => {
    getData(flatUrl, 'flat')
    getData(homeUrl, 'home')
    getData(landUrl, 'land')
}, 1000 * process.env.FREQUENCY_SEC)