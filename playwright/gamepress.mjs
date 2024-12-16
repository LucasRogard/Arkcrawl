
import { chromium } from 'playwright'
import { writeFile } from 'fs/promises';


  (async () => {

    const browser = await chromium.launch({headless: false})
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(`https://ak.gamepress.gg/tier-list/arknights-operator-tier-list`)

    const dico = []

    //liste des tableaux de personnages
    const tabs = await page.locator('.operator-table');
    const tabsCount = await tabs.count();
    for (let i = 0; i < tabsCount; i++){
      const tab = tabs.nth(i);

      //liste des lignes d'un tableau
      const rows = await tab.locator('tbody tr');
      const rowCount = await rows.count();
      for (let j = 0; j < rowCount; j++){
        const row = rows.nth(j);

        // rank des personnages
        const rank = await row.locator('td:nth-child(1)').innerText();

        //liste des personnages
        const characters = await row.locator('td:nth-child(2) .operator-title');
        const characterCount = await characters.count();
        
        for (let k = 0; k < characterCount; k++){
          const character = await characters.nth(k).innerText();
          dico.push({ character, rank })
        }
      }
    }

    console.log(dico.length)
    await writeFile('gamepress.json', JSON.stringify(dico, null, 2));

    await browser.close()

  })()
