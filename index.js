const http = require('http');
const https = require('https');
const stringDecoder = require('string_decoder').StringDecoder;

const bufferString = function (url) {
  return new Promise((resolve, reject) => {
    https.get(url, function (res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error('statusCode=' + res.statusCode));
        return;
      }
      let buffer = '';
      let decoder = new stringDecoder();
      res.on('data', function (data) {
        buffer += decoder.write(data);
      });
      res.on('end', function () {
        buffer += decoder.end();
        let links = [];
        let linksPattern = /<li class="latest-stories__item">([\s\S]*?)<\/li>/g;
        while ((match = linksPattern.exec(buffer))) {
          let linksPattern = /<a[^>]*href=["']([^"']*)["']/g;
          while ((match = linksPattern.exec(match))) {
            links.push(match[1]);
          }
        }
        //console.log(links);
        let title = [];
        let str = buffer;

        let titlepattern =
          /<h3 class="latest-stories__item-headline">([\s\S]*?)<\/h3>/g;
        while ((match = titlepattern.exec(str))) {
          title.push(match[1]);
        }
        //console.log(title);
        let data = [];
        links.forEach((element) => {});
        for (let val in title) {
          var obj = {
            title: title[val],
            link: 'https://time.com/' + links[val],
          };
          data.push(obj);
        }

        resolve(data);
      });

      res.on('error', function (err) {
        reject(err);
      });
    });
  });
};

const server = http.createServer(serverHandler);

async function serverHandler(req, response) {
  if (req.method === 'GET' && req.url === '/getTimeStories') {
    try {
      let result = await bufferString('https://time.com/');
      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(result));
    } catch (error) {
      console.log(error);
    }
  } else {
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        message: `${req.method} is not supported for ${req.url}`,
      })
    );
  }
}

server.listen(5000, () => {
  console.log(`Server running at :5000`);
});
