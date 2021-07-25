/* eslint-disable */
require('dotenv').config()

const express = require('express')
const sessionLib = require('express-session');
const cors = require('cors')
const puppeteer = require('puppeteer')
const app = express()
const port = process.env.VUE_APP_SERVERPORT
const connect = require('./connect.js')

app.use(cors())
app.use(express.json())

const uuidCreation = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

app.use(sessionLib({
  secret: uuidCreation(),
  resave: true,
  saveUninitialized: true
}))

let session

app.post('/auth/creatUser', async (req, res) => {
  try {
    const client = await connect(res)
    const db = client.db(process.env.DB_NAME)
    const collection = db.collection('Users')
    const createUserInfo = req.body

    const existingUser = await collection.findOne({ email: createUserInfo.email })
    if (existingUser) {
      res.status(500).json({
        status: 'failed', message: 'User already exists, please use other email', reason: 'userExists'
      })
    } else {
      const newUser = await collection.insertOne({
        ...createUserInfo,
        Created: new Date().getTime(),
        userId: uuidCreation()
      })
      session = {
        userId: newUser.userId,
        firstName: createUserInfo.firstName,
        lastName: createUserInfo.lastName
      }
      res.status(200).json({
        status: 'success', message: 'User succesfully created', session: session
      })
    }
    client.close()
  } catch (error) {
    res.status(500).json({
      status: 'failed', message: `/auth/createUser error occurred: ${error}`
    })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const client = await connect(res)
    const db = client.db(process.env.DB_NAME)
    const collection = db.collection('Users')
    const loginInfo = req.body

    const existingUser = await collection.findOne({ email: loginInfo.userName })
    if (existingUser) {
      const password = await collection.findOne({ password: loginInfo.password })
      if (password) {
        session = {
          userId: existingUser.userId,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName
        }
        res.status(200).json({
          status: 'success', message: 'Login has succeeded', session: session
        })
      } else {
        res.status(200).json({
          status: 'failed', message: 'Login failed', reason: 'securityForbidsReason'
        })
      }
    } else {
      res.status(200).json({
        status: 'failed', message: 'Login failed', reason: 'securityForbidsReason'
      })
    }
    client.close()
  } catch (error) {
    res.status(200).json({
      status: 'failed', message: `Auth error occurred: ${error}`
    })
  }
})

app.post('/auth/signOut', async (req, res) => {
  req.session.destroy()
  if (!req.session) {
    session = false
    res.status(200).json({
      status: 'success', message: 'Session destroyed'
    })
  } else {
    res.status(500).json({
      status: 'failed', message: `Unable to destroy session`
    })
  }
})

app.get('/auth/check', async (req, res) => {
  if (session) {
    res.status(200).json({
      status: 'success', message: 'found session', session: session
    })
  } else {
    res.status(200).json({
      status: 'failed', message: 'no session found'
    })
  }
})

app.post('/lists/crawl', async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*")
    const crawlRequestInfo = req.body
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const listResult = await getList(page, crawlRequestInfo)
    res.send(listResult)
    await browser.close()
  } catch (error) {
    res.status(500).json({ status: 'failed', message: `Crawling error occurred: ${error}` })
  }
})

app.post('/lists/save', async (req, res) => {
  try {
    const client = await connect(res)
    const db = client.db(process.env.DB_NAME)
    const collection = db.collection('Lists')
    await collection.insertOne({
      ...req.body,
      listId: uuidCreation()
    })
    res.status(200).json({
      status: 'success', message: 'List saved'
    })
    client.close()
  } catch (error) {
    res.status(500).json({
      status: 'failed', message: `/lists/save error occurred: ${error}`
    })
  }
})

app.post('/lists/delete', async (req, res) => {
  try {
    const client = await connect(res)
    const db = client.db(process.env.DB_NAME)
    const collection = db.collection('Lists')
    const payload = req.body

    await collection.deleteOne({ listId: payload.id })
    res.status(200).json({
      status: 'success', message: 'List deleted'
    })
    client.close()
  } catch (error) {
    res.status(500).json({
      status: 'failed', message: `/lists/delete error occurred: ${error}`
    })
  }
})

app.post('/lists/get', async (req, res) => {
  try {
    const client = await connect(res)
    const db = client.db(process.env.DB_NAME)
    const collection = db.collection('Lists')
    const userInfo = req.body

    const lists = await collection.find({ userId: userInfo.payload }).toArray()
    if (lists) {
      res.status(200).json({
        status: 'success', message: '/lists/get has succeeded', lists: lists
      })
    } else {
      res.status(500).json({
        status: 'failed', message: `No lists were found with this userId`
      })
    }
    client.close()
  } catch (error) {
    res.status(500).json({
      status: 'failed', message: `/lists/get error occurred: ${error}`
    })
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