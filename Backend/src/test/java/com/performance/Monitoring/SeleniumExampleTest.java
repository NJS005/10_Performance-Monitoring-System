package com.performance.Monitoring;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class SeleniumExampleTest {

    @Test
    public void testGoogleSearch() {
        // Set up Chrome options
        ChromeOptions options = new ChromeOptions();
        // options.addArguments("--headless"); // Uncomment to run invisibly

        // Initialize the Chrome driver (Requires Chrome browser installed)
        // Selenium 4.6+ automatically manages the driver executable (ChromeDriver)
        WebDriver driver = new ChromeDriver(options);
        
        try {
            // Navigate to a webpage
            driver.get("https://www.google.com");
            
            // Print the title
            System.out.println("Successfully opened page! Title is: " + driver.getTitle());
            
            // Assert that the title is correct
            assertEquals("Google", driver.getTitle());
            
        } finally {
            // Clean up and close the browser
            if (driver != null) {
                driver.quit();
            }
        }
    }
}
