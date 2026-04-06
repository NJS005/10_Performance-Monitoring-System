package com.performance.Monitoring;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class WebAppTest {

    @Test
    public void testReactLoginUI() {
        // Set up Chrome options
        ChromeOptions options = new ChromeOptions();
        // options.addArguments("--headless"); // Uncomment if you don't want the browser to pop up

        WebDriver driver = new ChromeDriver(options);
        
        try {
            // 1. Navigate to the local React App
            driver.get("http://localhost:3001");
            
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            
            // 2. Wait for the "Sign in" header to ensure page loaded successfully
            WebElement signInHeading = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(), 'Sign in')]"))
            );
            assertTrue(signInHeading.isDisplayed(), "Sign in heading not found");
            
            // 3. Find and click the 'Admin' role selection button
            WebElement adminButton = wait.until(
                ExpectedConditions.elementToBeClickable(By.xpath("//button[.//p[text()='Admin']]"))
            );
            adminButton.click();
            
            // 4. Verify that the form dynamically updates based on our click
            WebElement roleText = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//p[contains(text(), 'Ready to sign in as Admin')]"))
            );
            assertTrue(roleText.isDisplayed(), "Role selection text did not update to Admin");
            
            System.out.println("✅ Web App UI Test Passed! Role selection is dynamically working.");
            
        } finally {
            // Closes the browser test
            if (driver != null) {
                driver.quit();
            }
        }
    }
}
