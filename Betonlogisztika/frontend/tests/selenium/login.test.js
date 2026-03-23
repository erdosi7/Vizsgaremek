import { Builder, By, until } from 'selenium-webdriver';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import 'chromedriver';

describe('Bejelentkezés tesztek', () => {
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('Sikeres bejelentkezés érvényes adatokkal', async () => {
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
    
    const successOverlay = await driver.wait(
      until.elementLocated(By.css('.success-overlay')),
      10000
    );
    
    const isVisible = await successOverlay.isDisplayed();
    expect(isVisible).toBe(true);
    
    await driver.wait(until.urlIs('http://localhost:5173/'), 10000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe('http://localhost:5173/');
  }, 30000);

  test('Hibás bejelentkezés rossz jelszóval', async () => {
    await driver.get('http://localhost:5173/');
    
    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      10000
    );
    await emailInput.sendKeys('selenium.teszt@example.com');
    
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    await passwordInput.sendKeys('rosszjelszo');
    
    const loginButton = await driver.findElement(By.css('button.btn-signin'));
    await loginButton.click();
    
    await driver.sleep(2000);
    
    const errorMessage = await driver.wait(
      until.elementLocated(By.css('.error-message.visible')),
      10000
    );
    
    const isVisible = await errorMessage.isDisplayed();
    expect(isVisible).toBe(true);
    
    const errorText = await errorMessage.getText();
    expect(errorText).toContain('Hibás email vagy jelszó');
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe('http://localhost:5173/');
  }, 30000);

  test('Bejelentkezés üres mezőkkel validációs hibát jelez', async () => {
    await driver.get('http://localhost:5173/');
    
    const loginButton = await driver.wait(
      until.elementLocated(By.css('button.btn-signin')),
      10000
    );
    await loginButton.click();
    
    await driver.sleep(2000);
    
    const emailError = await driver.findElement(By.css('.form-group:first-child .error-message.visible'));
    const emailErrorText = await emailError.getText();
    expect(emailErrorText).toBe('Kérjük, adja meg az email címét!');
    
    const passwordError = await driver.findElement(By.css('.form-group:nth-child(2) .error-message.visible'));
    const passwordErrorText = await passwordError.getText();
    expect(passwordErrorText).toBe('Kérjük, adja meg a jelszavát!');
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe('http://localhost:5173/');
  }, 30000);
});