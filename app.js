const express = require('express')
const bodyParser = require('body-parser')
const request = require('./async-request')
const app = express()
const port = 3000

const dataGenerate = (from1, to1, from2, to2) => {
  const list = []
  for (let i = from1; i <= to1; i++) {
    list.push({
      id: i,
      name: `Test ${i}`
    });
  }
  for (let i = from2; i < to2; i++) {
    list.push({
      id: i,
      name: `Test ${i}`
    });
  }
  return list;
}

app.get('/data-1', (req, res, next) => {
  setTimeout(() => {
    res.json(dataGenerate(1, 10, 31, 40));
    next()
  }, 1600);
})

app.get('/data-2', (req, res, next) => {
  setTimeout(() => {
    res.json(dataGenerate(11, 20, 41, 50));
    next()
  }, 1000);
})

app.get('/data-3', (req, res) => {
  res.json(dataGenerate(21, 30, 51, 60));
})

// Запросы с ошибками, которые не отработают
// Ошибка 400 - 
app.get('/data-4', (req, res, next) => {
  res.status(400);
})

// Упадет по таймауту
app.get('/data-5', (req, res, next) => {
  setTimeout(() => {
    res.json({
      id: 105,
      name: "Test 105"
    });
    next()
  }, 2500);
})



app.get('/get', (req, res, next) => {
  const asyncReq = async (path) => {
    try {
      result = await request({
        uri: path,
        baseUrl: 'http://localhost:3000',
        json: true,
        timeout: 2000
      })
      console.log("-- Последовательность отрабатываемых запросов --")
      console.log(path)
      console.log("-- --")

      return result;
    }
    catch (err) {
      return null;
    }
  };

  const tasks = [
    async () => await asyncReq('/data-1'),
    async () => await asyncReq('/data-2'),
    async () => await asyncReq('/data-3'),
    async () => await asyncReq('/data-4'),
    async () => await asyncReq('/data-5')
  ]

  Promise.all(tasks.map(p => p())).then((result) =>{
    result = result
      .filter(n => n)
      .reduce((prev, current) => [...prev, ...current])
      .sort(function(a, b) {
        return a.id - b.id  ||  a.name.localeCompare(b.name);
      });
    res.json(result)
  });

});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
