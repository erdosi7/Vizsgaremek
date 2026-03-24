import { Builder, By, until } from 'selenium-webdriver';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import 'chromedriver';

describe('Admin Dashboard tesztek', () => {
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5173/');
    
    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      10000
    );
    await emailInput.sendKeys('admin@gmail.com');
    
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    await passwordInput.sendKeys('admin67');
    
    const loginButton = await driver.findElement(By.css('button.btn-signin'));
    await loginButton.click();
    
    await driver.sleep(3000);
    await driver.get('http://localhost:5173/admin');
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('01 - Admin oldal betöltődik', async () => {
    const title = await driver.findElement(By.css('.admin-header h1'));
    const titleText = await title.getText();
    expect(titleText).toContain('Admin felület');
  }, 30000);

  test('02 - Admin oldal csak admin jogosultsággal érhető el', async () => {
    const welcomeText = await driver.findElement(By.css('.admin-welcome'));
    const text = await welcomeText.getText();
    expect(text).toContain('Üdv újra');
  }, 30000);

  test('03 - Ajánlatok tab megjelenik', async () => {
    const ajanlatokTab = await driver.findElement(By.css('.admin-tab:first-child'));
    const tabText = await ajanlatokTab.getText();
    expect(tabText).toContain('Ajánlatok');
  }, 30000);

  test('04 - Megrendelések tab megjelenik', async () => {
    const megrendelesekTab = await driver.findElement(By.css('.admin-tab:nth-child(2)'));
    const tabText = await megrendelesekTab.getText();
    expect(tabText).toContain('Megrendelések');
  }, 30000);

  test('05 - Felhasználók tab megjelenik', async () => {
    const felhasznalokTab = await driver.findElement(By.css('.admin-tab:nth-child(3)'));
    const tabText = await felhasznalokTab.getText();
    expect(tabText).toContain('Felhasználók');
  }, 30000);

  test('06 - Partnerek tab megjelenik', async () => {
    const partnerekTab = await driver.findElement(By.css('.admin-tab:nth-child(4)'));
    const tabText = await partnerekTab.getText();
    expect(tabText).toContain('Partnerek');
  }, 30000);

  test('07 - Statisztikai kártyák megjelennek', async () => {
    const statCards = await driver.findElements(By.css('.admin-stat-card'));
    expect(statCards.length).toBeGreaterThan(0);
  }, 30000);

  test('08 - Felhasználók tabra kattintva megjelennek a felhasználók', async () => {
    const felhasznalokTab = await driver.findElement(By.css('.admin-tab:nth-child(3)'));
    await felhasznalokTab.click();
    
    await driver.sleep(2000);
    
    const usersGrid = await driver.findElement(By.css('.admin-users-grid'));
    const isVisible = await usersGrid.isDisplayed();
    expect(isVisible).toBe(true);
  }, 30000);
});