import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
    await page.goto('https://www.dexerto.com/gaming/arknights-tier-list-best-characters-operators-class-1807334/#h-arknights-operator-tier-list');
    
  });