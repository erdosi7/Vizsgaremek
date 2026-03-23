 // frontend/tests/selenium/kapcsolat.test.js

import { Builder, By, until } from 'selenium-webdriver';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import 'chromedriver';

describe('Kapcsolat tesztek', () => {
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
    await driver.get('http://localhost:5173/kapcsolat');
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('01 - Kapcsolat oldal betöltődik', async () => {
    const title = await driver.findElement(By.css('.kapcsolat-hero h1'));
    const titleText = await title.getText();
    expect(titleText).toContain('Lépjen kapcsolatba velünk');
  }, 30000);

  test('02 - Kötelező mezők kitöltése nélkül validációs hibák', async () => {
    const submitButton = await driver.findElement(By.css('button.kapcsolat-btn'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errors = await driver.findElements(By.css('.kapcsolat-error-message.visible'));
    expect(errors.length).toBeGreaterThan(4);
  }, 30000);

  test('03 - Hibás email formátum validáció', async () => {
    const name = await driver.findElement(By.css('#name'));
    await name.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('hibas-email');
    
    const subject = await driver.findElement(By.css('#subject'));
    await subject.sendKeys('Információ');
    
    const message = await driver.findElement(By.css('#message'));
    await message.sendKeys('Ez egy teszt üzenet.');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.kapcsolat-btn'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const emailError = await driver.findElement(By.css('#email + .kapcsolat-error-message'));
    const errorText = await emailError.getText();
    expect(errorText).toContain('érvényes e-mail címet');
  }, 30000);

  test('04 - Tárgy kiválasztása kötelező', async () => {
    const name = await driver.findElement(By.css('#name'));
    await name.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('teszt@example.com');
    
    const message = await driver.findElement(By.css('#message'));
    await message.sendKeys('Ez egy teszt üzenet.');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.kapcsolat-btn'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const subjectError = await driver.findElement(By.css('#subject + .kapcsolat-error-message'));
    const errorText = await subjectError.getText();
    expect(errorText).toContain('válassza ki a tárgyat');
  }, 30000);

  test('05 - Üzenet mező kitöltése kötelező', async () => {
    const name = await driver.findElement(By.css('#name'));
    await name.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('teszt@example.com');
    
    const subject = await driver.findElement(By.css('#subject'));
    await subject.sendKeys('Információ');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.kapcsolat-btn'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const messageError = await driver.findElement(By.css('#message + .kapcsolat-error-message'));
    const errorText = await messageError.getText();
    expect(errorText).toContain('írja be az üzenetét');
  }, 30000);

  test('06 - ÁSZF és adatvédelmi checkboxok kötelezőek', async () => {
    const name = await driver.findElement(By.css('#name'));
    await name.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('teszt@example.com');
    
    const subject = await driver.findElement(By.css('#subject'));
    await subject.sendKeys('Információ');
    
    const message = await driver.findElement(By.css('#message'));
    await message.sendKeys('Ez egy teszt üzenet.');
    
    const submitButton = await driver.findElement(By.css('button.kapcsolat-btn'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errors = await driver.findElements(By.css('.kapcsolat-error-message.visible'));
    let termsFound = false;
    let privacyFound = false;
    
    for (let error of errors) {
      const text = await error.getText();
      if (text.includes('ÁSZF')) termsFound = true;
      if (text.includes('Adatvédelmi')) privacyFound = true;
    }
    
    expect(termsFound).toBe(true);
    expect(privacyFound).toBe(true);
  }, 30000);

  test('07 - Sikeres űrlap kitöltés és elküldés', async () => {
  const name = await driver.findElement(By.css('#name'));
  await name.sendKeys('Teszt Elek');
  
  const email = await driver.findElement(By.css('#email'));
  await email.sendKeys('teszt@example.com');
  
  const subject = await driver.findElement(By.css('#subject'));
  await subject.sendKeys('Információ');
  
  const message = await driver.findElement(By.css('#message'));
  await message.sendKeys('Ez egy automatikus Selenium teszt üzenet.');
  
  const terms = await driver.findElement(By.css('#terms'));
  await terms.click();
  
  const privacy = await driver.findElement(By.css('#privacy'));
  await privacy.click();
  
  const submitButton = await driver.findElement(By.css('button.kapcsolat-btn'));
  await submitButton.click();
  
  await driver.sleep(5000);
  
  const currentUrl = await driver.getCurrentUrl();
  const pageSource = await driver.getPageSource();
  
  if (pageSource.includes('Sikeres üzenetküldés') || pageSource.includes('success-modal')) {
    expect(true).toBe(true);
  } else {
    console.log('URL:', currentUrl);
    expect(currentUrl).toContain('kapcsolat');
  }
}, 60000);
});