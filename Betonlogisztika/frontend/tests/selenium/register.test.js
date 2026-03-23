import { Builder, By, until } from 'selenium-webdriver';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import 'chromedriver';

describe('Regisztráció tesztek', () => {
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('Sikeres regisztráció érvényes adatokkal', async () => {
    await driver.get('http://localhost:5173/regisztracio');
    
    const fullName = await driver.wait(
      until.elementLocated(By.css('#fullName')),
      10000
    );
    await fullName.sendKeys('Selenium Teszt');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('selenium.teszt@example.com');
    
    const phone = await driver.findElement(By.css('#phone'));
    await phone.sendKeys('06301234567');
    
    const password = await driver.findElement(By.css('#password'));
    await password.sendKeys('selenium123');
    
    const passwordConfirm = await driver.findElement(By.css('#passwordConfirm'));
    await passwordConfirm.sendKeys('selenium123');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.regisztracio-btn-signup'));
    await submitButton.click();
    
    await driver.sleep(3000);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('localhost:5173');
  }, 30000);

  test('Regisztráció hibás email formátummal', async () => {
    await driver.get('http://localhost:5173/regisztracio');
    
    const fullName = await driver.wait(
      until.elementLocated(By.css('#fullName')),
      10000
    );
    await fullName.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('hibas-email');
    
    const phone = await driver.findElement(By.css('#phone'));
    await phone.sendKeys('06301234567');
    
    const password = await driver.findElement(By.css('#password'));
    await password.sendKeys('teszt123');
    
    const passwordConfirm = await driver.findElement(By.css('#passwordConfirm'));
    await passwordConfirm.sendKeys('teszt123');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.regisztracio-btn-signup'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const emailError = await driver.findElement(By.css('.regisztracio-error-message.visible'));
    const errorText = await emailError.getText();
    expect(errorText).toContain('érvényes e-mail címet');
  }, 30000);

  test('Regisztráció nem egyező jelszavakkal', async () => {
    await driver.get('http://localhost:5173/regisztracio');
    
    const fullName = await driver.wait(
      until.elementLocated(By.css('#fullName')),
      10000
    );
    await fullName.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('selenium.teszt@example.com');
    
    const phone = await driver.findElement(By.css('#phone'));
    await phone.sendKeys('06301234567');
    
    const password = await driver.findElement(By.css('#password'));
    await password.sendKeys('selenium123');
    
    const passwordConfirm = await driver.findElement(By.css('#passwordConfirm'));
    await passwordConfirm.sendKeys('rosszjelszo');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.regisztracio-btn-signup'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errorMessages = await driver.findElements(By.css('.regisztracio-error-message.visible'));
    let found = false;
    for (let error of errorMessages) {
      const text = await error.getText();
      if (text.includes('nem egyeznek')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  }, 30000);

  test('Regisztráció túl rövid jelszóval', async () => {
    await driver.get('http://localhost:5173/regisztracio');
    
    const fullName = await driver.wait(
      until.elementLocated(By.css('#fullName')),
      10000
    );
    await fullName.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('selenium.teszt@example.com');
    
    const phone = await driver.findElement(By.css('#phone'));
    await phone.sendKeys('06301234567');
    
    const password = await driver.findElement(By.css('#password'));
    await password.sendKeys('123');
    
    const passwordConfirm = await driver.findElement(By.css('#passwordConfirm'));
    await passwordConfirm.sendKeys('123');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.regisztracio-btn-signup'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errorMessages = await driver.findElements(By.css('.regisztracio-error-message.visible'));
    let found = false;
    for (let error of errorMessages) {
      const text = await error.getText();
      if (text.includes('legalább 6 karakter')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  }, 30000);

  test('Regisztráció kötelező mezők kitöltése nélkül', async () => {
    await driver.get('http://localhost:5173/regisztracio');
    
    const submitButton = await driver.wait(
      until.elementLocated(By.css('button.regisztracio-btn-signup')),
      10000
    );
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errors = await driver.findElements(By.css('.regisztracio-error-message.visible'));
    expect(errors.length).toBeGreaterThan(0);
    
    const url = await driver.getCurrentUrl();
    expect(url).toContain('/regisztracio');
  }, 30000);

  test('Regisztráció ÁSZF elfogadása nélkül', async () => {
    await driver.get('http://localhost:5173/regisztracio');
    
    const fullName = await driver.wait(
      until.elementLocated(By.css('#fullName')),
      10000
    );
    await fullName.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('selenium.teszt@example.com');
    
    const phone = await driver.findElement(By.css('#phone'));
    await phone.sendKeys('06301234567');
    
    const password = await driver.findElement(By.css('#password'));
    await password.sendKeys('selenium123');
    
    const passwordConfirm = await driver.findElement(By.css('#passwordConfirm'));
    await passwordConfirm.sendKeys('selenium123');
    
    const privacy = await driver.findElement(By.css('#privacy'));
    await privacy.click();
    
    const submitButton = await driver.findElement(By.css('button.regisztracio-btn-signup'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errorMessages = await driver.findElements(By.css('.regisztracio-error-message.visible'));
    let found = false;
    for (let error of errorMessages) {
      const text = await error.getText();
      if (text.includes('ÁSZF')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  }, 30000);

  test('Regisztráció adatvédelmi nyilatkozat elfogadása nélkül', async () => {
    await driver.get('http://localhost:5173/regisztracio');
    
    const fullName = await driver.wait(
      until.elementLocated(By.css('#fullName')),
      10000
    );
    await fullName.sendKeys('Teszt Elek');
    
    const email = await driver.findElement(By.css('#email'));
    await email.sendKeys('selenium.teszt@example.com');
    
    const phone = await driver.findElement(By.css('#phone'));
    await phone.sendKeys('06301234567');
    
    const password = await driver.findElement(By.css('#password'));
    await password.sendKeys('selenium123');
    
    const passwordConfirm = await driver.findElement(By.css('#passwordConfirm'));
    await passwordConfirm.sendKeys('selenium123');
    
    const terms = await driver.findElement(By.css('#terms'));
    await terms.click();
    
    const submitButton = await driver.findElement(By.css('button.regisztracio-btn-signup'));
    await submitButton.click();
    
    await driver.sleep(2000);
    
    const errorMessages = await driver.findElements(By.css('.regisztracio-error-message.visible'));
    let found = false;
    for (let error of errorMessages) {
      const text = await error.getText();
      if (text.includes('Adatvédelmi')) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  }, 30000);
});