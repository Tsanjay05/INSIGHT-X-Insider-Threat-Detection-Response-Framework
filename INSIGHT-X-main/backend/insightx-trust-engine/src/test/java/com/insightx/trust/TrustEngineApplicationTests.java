
package com.insightx.trust;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Basic smoke test to ensure the application context loads
 */
@SpringBootTest
@ActiveProfiles("test") // <-- ADD THIS LINE
class TrustEngineApplicationTests {

    @Test
    void contextLoads() {
        // If this test passes, the Spring context loaded successfully
    }
}
