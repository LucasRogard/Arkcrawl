
import { chromium } from 'playwright'
import { writeFile } from 'fs/promises';

  (async () => {
    
    const browser = await chromium.launch({headless: false})
    const context = await browser.newContext()
    const page = await context.newPage()
    


    const characters = [];

    for (let i = 1; i <= 6; i++) {
        await page.goto(`https://arknights.wiki.gg/wiki/Operator/${i}-star`)
        console.log(i)

        // lignes du tableau de personnage
        const rows = await page.locator('.mrfz-wtable tbody tr');
        
        const rowCount = await rows.count();
        console.log(rowCount)
        for (let j = 0; j < rowCount; j++) {
            const row = rows.nth(j);

            // nom du personnage
            const name = await row.locator('td:nth-child(2) a').innerText();
            console.log(`name : ${name}`)

            const link = 'https://arknights.wiki.gg' + await row.locator('td:nth-child(2) a').getAttribute('href');
            console.log(`link : ${link}`)

            // image du personnage
            const imgElement = row.locator('td:nth-child(1) img');
            const img = (await imgElement.count()) > 0 
              ? 'https://arknights.wiki.gg' + await imgElement.getAttribute('src')
              : 'https://placehold.co/100';
            console.log(`img : ${img}`)
    
            // nom classe du personnage
            const className = await row.locator('td:nth-child(3) a').getAttribute('title');
            console.log(`className : ${className}`)

            // image classe du personnage
            const classImg = 'https://arknights.wiki.gg' + await row.locator('td:nth-child(3) a img').getAttribute('src');
            console.log(`classImg : ${classImg}`)

            const globalImgElement = row.locator('td:nth-child(6) img');
            const global = (await globalImgElement.count()) > 0 
              ? (await globalImgElement.getAttribute('alt')) === 'Released' 
              : true;

            console.log(`global : ${global}`)

            await page.goto(link)

            const chineseElement = await page.locator('div[data-source="cnname"] div').first()
            const chineseName = (await chineseElement.count()) > 0 
              ? (await chineseElement.textContent()) 
              : undefined;

            console.log(`chineseName : ${chineseName}`)

              const japaneseElement = await page.locator('div[data-source="jpname"] div').first()
              const japaneseName = (await japaneseElement.count()) > 0 
                ? (await japaneseElement.textContent()) 
                : undefined;

              console.log(`japaneseName : ${japaneseName}`)

            await page.goto(`https://arknights.wiki.gg/wiki/Operator/${i}-star`)
    
            characters.push({ name, link, img, className, classImg, stars: i, released: global, chineseName, japaneseName});

            console.log('pushed')
        }
        console.log(characters)
      
    }  

    console.log(characters.length)
    await writeFile('characters.json', JSON.stringify(characters, null, 2));

    await browser.close()

  })()
