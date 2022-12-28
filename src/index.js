require('dotenv').config()
const fs = require('fs-extra')
var cron = require('node-cron')
const api = require('./lib/api')
const FileType = require('file-type')
const { TwitterApi } = require('twitter-api-v2')

const run = async() => {

    await api.criaArquivos()

    const db = JSON.parse(fs.readFileSync('src/db/last.json'))

    const Client = new TwitterApi({
        appKey: process.env.CONSUMER_KEY,
        appSecret: process.env.CONSUMER_SECRET,
        accessToken: process.env.ACCESS_TOKEN,
        accessSecret: process.env.ACCESS_TOKEN_SECRET,
    });

    const client = Client.readWrite;
    
    cron.schedule('*/2 * * * *', async () => {
        console.log(new Date().toLocaleString('pt-BR'))
        await api.obterUltimoAviso().then(async res => {
            if (res.items && res.items.length > 0) {
                var novo = new Date(res.items[0].created)
                var ultimo = new Date(db.timestamp)
                if (novo.getTime() > ultimo.getTime()) {
                    await api.obterDetalhes(res.items[0].link).then(async data => {
                        await api.getBuffer(data.imagem).then(async buffer => {
                            let bufferInfo = await FileType.fromBuffer(buffer)
                            var id = await client.v1.uploadMedia(Buffer.from(buffer), { mimeType: bufferInfo.mime })
                            var texto = ''
                            texto += data.titulo
                            texto += `.\n#DefesaCivil #SantaCatarina #Tempo`
                            await client.v1.tweet(texto, { media_ids: id })
                            await api.modificarJSON(data.titulo, res.items[0].created)
                        })
                    }).catch(console.log)
                }
            }
        }).catch(console.log)
    })

}
run()