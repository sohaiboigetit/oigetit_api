const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

app.use(bodyParser.json());

app.post('/scrape', async (req, res) => {
    console.log("Within Scrape");
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.time("Timer")
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: 'load',
            timeout: 0
        });

        const data = await page.evaluate(() => {
            const titleElement = document.querySelector('h1');
            const contentElements = document.querySelectorAll('p');

            const title = titleElement ? titleElement.innerText : 'Title not found';

            let contentArray = [];
            contentElements.forEach(p => {
                contentArray.push(p.innerText);
            });
            const content = contentArray.join('\n');

            return { title, content };
        });

        await browser.close();
       

        if (!data.content) {
            console.log('No content found in <p> tags.');
        } else {
            console.log('Content successfully retrieved from <p> tags.');
        }

        console.log(data)

        res.json(data);
        console.timeEnd("Timer")

    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).json({ error: 'Error scraping data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
