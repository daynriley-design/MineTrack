import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://127.0.0.1:3000/');
  
  // Wait for login page
  await page.waitForSelector('button[type="submit"]');
  console.log("Found submit button. Clicking...");
  
  await page.click('button[type="submit"]');
  
  // wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Current URL:", page.url());
  
  await browser.close();
})();
