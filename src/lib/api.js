const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const cheerio = require('cheerio')
const { parse } = require('rss-to-json')

module.exports = {

    obterUltimoAviso: async () => {
        return new Promise((resolve, reject) => {
            parse('https://www.defesacivil.sc.gov.br/avisos-meteorologicos/feed/').then(res => {
                resolve(res)
            }).catch(reject)
        })
    },

    obterDetalhes: async (url) => {
        return new Promise((resolve, reject) => {
            axios.get(url).then(({data}) => {
                const $ = cheerio.load(data)
                resolve({
                    titulo: $('header > div > h1').text(),
                    imagem: $('div > section > div > p:nth-child(1) > a > img').attr('src')
                })
            }).catch(reject)
        })
    },

    criaArquivos: async () => {
        if (!fs.existsSync(path.resolve('src/db/last.json'))) {
            const obj = {
                titulo: '',
                timestamp: 0,
            }
            fs.writeFileSync(path.resolve('src/db/last.json'), JSON.stringify(obj))
        }
    },

    modificarJSON: async (titulo, timestamp) => {
        var obj = JSON.parse(fs.readFileSync(path.resolve('src/db/last.json')))
        obj.titulo = titulo
        obj.timestamp = timestamp
        fs.writeFileSync(path.resolve('src/db/last.json'), JSON.stringify(obj))
    },

    getBuffer: async (url) => {
        return new Promise((resolve, reject) => {
            axios(url,{
                responseType: 'arraybuffer'
            }).then(res => {
                resolve(res.data)
            }).catch(reject)
        })
    },

}