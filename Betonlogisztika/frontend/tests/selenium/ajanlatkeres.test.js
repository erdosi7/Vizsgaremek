import { Builder, By, until } from 'selenium-webdriver';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import 'chromedriver';

describe('Ajánlatkérés tesztek', () => {
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5173/');
    
    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      10000
    );
    await emailInput.sendKeys('selenium.teszt@example.com');
    
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    await passwordInput.sendKeys('selenium123');
    
    const loginButton = await driver.findElement(By.css('button.btn-signin'));
    await loginButton.click();
    
    await driver.sleep(3000);
    await driver.get('http://localhost:5173/ajanlatkeres');
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('01 - Ajánlatkérés oldal betöltődik', async () => {
    const title = await driver.findElement(By.css('.ajanlatkeres-hero h1'));
    const titleText = await title.getText();
    expect(titleText).toContain('Ingyenes ajánlatkérés');
  }, 30000);

  test('02 - Kötelező mezők kitöltése nélkül validációs hibák', async () => {
    const submitButton = await driver.findElement(By.css('button.ajanlatkeres-btn'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errors = await driver.findElements(By.css('.ajanlatkeres-error-message.visible'));
    expect(errors.length).toBeGreaterThan(5);
  }, 30000);

  test('03 - Távolság validáció - 70 km-en túl', async () => {
    const postalCode = await driver.findElement(By.css('#postalCode'));
    await postalCode.sendKeys('9021');
    
    const city = await driver.findElement(By.css('#city'));
    await city.sendKeys('Győr');
    
    const street = await driver.findElement(By.css('#street'));
    await street.sendKeys('Baross út');
    
    const houseNumber = await driver.findElement(By.css('#houseNumber'));
    await houseNumber.sendKeys('10');
    
    await driver.sleep(3000);
    
    const distanceError = await driver.wait(
      until.elementLocated(By.css('.ajanlatkeres-error-message.visible')),
      10000
    );
    const errorText = await distanceError.getText();
    expect(errorText).toContain('km');
  }, 30000);

  test('04 - Ár előnézet megjelenik kitöltés után', async () => {
    const postalCode = await driver.findElement(By.css('#postalCode'));
    await postalCode.sendKeys('8360');
    
    const city = await driver.findElement(By.css('#city'));
    await city.sendKeys('Keszthely');
    
    const street = await driver.findElement(By.css('#street'));
    await street.sendKeys('Fő tér');
    
    const houseNumber = await driver.findElement(By.css('#houseNumber'));
    await houseNumber.sendKeys('1');
    
    await driver.sleep(2000);
    
    const concreteType = await driver.findElement(By.css('#concreteType'));
    await concreteType.sendKeys('c20-25');
    
    const quantity = await driver.findElement(By.css('#quantity'));
    await quantity.sendKeys('10');
    
    const deliveryDate = await driver.findElement(By.css('#deliveryDate'));
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    await deliveryDate.sendKeys(`${year}-${month}-${day}`);
    
    const selectedCompany = await driver.findElement(By.css('#selectedCompany'));
    await selectedCompany.sendKeys('Readymix Zala Kft.');
    
    const pumpNeeded = await driver.findElement(By.css('#pumpNeeded'));
    await pumpNeeded.sendKeys('igen');
    
    const concreteType2 = await driver.findElement(By.css('#concreteType2'));
    await concreteType2.sendKeys('acel');
    
    await driver.sleep(3000);
    
    const pricePreview = await driver.findElement(By.css('.ajanlatkeres-price-preview'));
    const isVisible = await pricePreview.isDisplayed();
    expect(isVisible).toBe(true);
  }, 60000);

  test('05 - Betongyártó cég kiválasztása kötelező', async () => {
    const postalCode = await driver.findElement(By.css('#postalCode'));
    await postalCode.sendKeys('8360');
    
    const city = await driver.findElement(By.css('#city'));
    await city.sendKeys('Keszthely');
    
    const street = await driver.findElement(By.css('#street'));
    await street.sendKeys('Fő tér');
    
    const houseNumber = await driver.findElement(By.css('#houseNumber'));
    await houseNumber.sendKeys('1');
    
    await driver.sleep(2000);
    
    const concreteType = await driver.findElement(By.css('#concreteType'));
    await concreteType.sendKeys('c20-25');
    
    const quantity = await driver.findElement(By.css('#quantity'));
    await quantity.sendKeys('10');
    
    const deliveryDate = await driver.findElement(By.css('#deliveryDate'));
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    await deliveryDate.sendKeys(`${year}-${month}-${day}`);
    
    const pumpNeeded = await driver.findElement(By.css('#pumpNeeded'));
    await pumpNeeded.sendKeys('igen');
    
    const concreteType2 = await driver.findElement(By.css('#concreteType2'));
    await concreteType2.sendKeys('acel');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.ajanlatkeres-btn'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errorMessages = await driver.findElements(By.css('.ajanlatkeres-error-message.visible'));
    let found = false;
    for (let error of errorMessages) {
      const text = await error.getText();
      if (text.includes('betongyártó')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  }, 60000);

  
});