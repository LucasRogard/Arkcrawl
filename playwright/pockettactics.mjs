
import { chromium } from 'playwright'
import { writeFile } from 'fs/promises';


  (async () => {

    const browser = await chromium.launch({headless: false})
    const context = await browser.newContext()
    const page = await context.newPage()
    
    await page.goto('https://www.pockettactics.com/arknights/tier-list')

    const dico = []

    //liste des tableaux de personnages
    const tabs = await page.locator('.table-rail table');
    const tabsCount = await tabs.count();
    for (let i = 0; i < tabsCount; i++){
      const tab = tabs.nth(i);

      //liste des lignes d'un tableau
      const rows = await tab.locator('tbody tr');
      const rowCount = await rows.count();
      for (let j = 1; j < rowCount; j++){
        
        const row = rows.nth(j);
        
        // rank des personnages
        const rank = await row.locator('td:nth-child(1)').innerText();

        //liste des personnages
        const characters = (await row.locator('td:nth-child(2)').innerText()).split(', ');
        for (const character of characters){
          dico.push({ character, rank })
        }
        
      }
    }
    console.log(dico.length)
    await writeFile('pockettactics.json', JSON.stringify(dico, null, 2));

    await browser.close()

  })()
