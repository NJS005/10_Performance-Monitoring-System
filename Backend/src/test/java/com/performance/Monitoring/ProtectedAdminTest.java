package com.performance.Monitoring;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class ProtectedAdminTest {

    @Test
    public void testBypassLoginToAdminPanel() {
        ChromeOptions options = new ChromeOptions();
        WebDriver driver = new ChromeDriver(options);
        
        try {
            // 1. Navigate to the root URL first so that we are on the correct domain 
            //    in order to set localStorage. (Browsers don't let you set localStorage on empty tabs)
            driver.get("http://localhost:3001");
            
            // 2. Inject localStorage state to fake a Google Login session
            JavascriptExecutor js = (JavascriptExecutor) driver;
            
            String fakeUserJson = "{\"name\":\"Super Admin\",\"email\":\"admin@nitc.ac.in\",\"role\":\"Admin\"}";
            
            js.executeScript("window.localStorage.setItem('user', arguments[0]);", fakeUserJson);
            js.executeScript("window.localStorage.setItem('token', 'fake-google-jwt-token');");
            
            System.out.println("Injected fake user into localStorage: " + fakeUserJson);
            
            // 3. Now navigate directly to the strictly protected Admin Dashboard
            driver.get("http://localhost:3001/admin/dashboard");
            
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            
            // 4. Verify that we bypassed the login page and successfully loaded the Admin Panel!
            // The AdminPanel.jsx has an <h1> with "System Admin" and an <h2> with "Manage System Users"
            
            WebElement adminHeading = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'System Admin')]"))
            );
            assertTrue(adminHeading.isDisplayed(), "System Admin text not visible, bypass may have failed!");
            
            WebElement manageUsersHeader = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(., 'Manage System Users')]"))
            );
            assertTrue(manageUsersHeader.isDisplayed(), "Manage System Users header not visible!");

            System.out.println("✅ Security Bypass Successful! Admin panel loaded directly without Google Auth.");
            
        } finally {
            if (driver != null) {
                driver.quit();
            }
        }
    }
}
