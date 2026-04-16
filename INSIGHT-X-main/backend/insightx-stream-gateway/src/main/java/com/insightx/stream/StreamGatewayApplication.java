package com.insightx.stream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StreamGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(StreamGatewayApplication.class, args);
    }
}
