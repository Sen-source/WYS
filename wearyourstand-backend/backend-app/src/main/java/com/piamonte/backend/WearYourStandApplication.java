package com.piamonte.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = {"com.piamonte.biz.data"})
@EntityScan(basePackages = {"com.piamonte.biz.data"})
@ComponentScan(basePackages = {"com.piamonte"})
public class WearYourStandApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(WearYourStandApplication.class, args);
    }
}



