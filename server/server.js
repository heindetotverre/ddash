/* eslint-disable */
const express = require('express')
const cors = require('cors')
const puppeteer = require('puppeteer')
const app = express()
const port = process.env.VUE_APP_SERVERPORT || 8000

app.use(cors())
app.use(express.json())

app.post('/', async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*")
    const crawlRequestInfo = req.body
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const listResult = await getList(page, crawlRequestInfo)
    res.send(listResult)
    await browser.close()
  } catch (error) {
    res.status(500).json({ message: `Crawling error occurred: ${error}` })
  }
})

app.listen(port)

const getList = async (page, crawlRequestInfo) => {
  await page.goto(crawlRequestInfo.url, { waituntil: 'networkidle2' })
  try {
    await page.waitForSelector(`.${crawlRequestInfo.searchParams.listSelector}`, { timeout: 4000 })
  } catch (error) {
    await page.click(`.${crawlRequestInfo.searchParams.cookieWallAcceptSelector}`)
    await page.waitForSelector(`.${crawlRequestInfo.searchParams.listSelector}`, { timeout: 4000 })
  }

  const result = await page.evaluate(({ crawlRequestInfo }) => {
    const list = document.querySelector(`.${crawlRequestInfo.searchParams.listSelector}`)
    const items = list.querySelectorAll(`.${crawlRequestInfo.searchParams.itemSelector}`)
    const resultArray = []
    for (const item of items) {
      const package = {
        title: item.querySelector(`.${crawlRequestInfo.searchParams.titleSelector}`).innerText,
        link: item.querySelector(`.${crawlRequestInfo.searchParams.linkSelector}`).getAttribute('href')
      }
      resultArray.push(package)
    }
    return resultArray.length > 0
      ? resultArray
      : `No data collected on ${crawlRequestInfo.url} with selectors '.${crawlRequestInfo.searchParams.listSelector}', '.${crawlRequestInfo.searchParams.itemSelector}', '.${crawlRequestInfo.searchParams.titleSelector}', '.${crawlRequestInfo.searchParams.linkSelector}'`
  }, { crawlRequestInfo })
  return result
}