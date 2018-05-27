const app = require('express')()
const request = require('request')
const bodyParser = require('body-parser')
const upload = require('multer')()
const qs = require('querystring')

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ORIGIN || '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Content-Type', 'application/json')
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/oauth/authorize', (req, res) => {
  const redirect_uri = req.query.callback || req.get('Origin')
  const query = {
    scope: 'public_repo',
    redirect_uri,
    client_id: process.env.CLIENT_ID
  }
  const url = `https://github.com/login/oauth/authorize?${qs.stringify(query)}`
  return res.redirect(url)
})

app.post('/api/oauth/token', upload.array(), (req, res) => {
  const form = {
    ...req.body,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
  }
  request.post({
    url: 'https://github.com/login/oauth/access_token',
    form,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'proxy.oauth'
    },
  }, (error, r, body) => {
    if (!error) {
      res.send(body)
    } else {
      res.json({ error })
    }
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`proxy.oauth listening on port ${port}`))
