package com.emotioncare.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication(scanBasePackages = {"com.emotioncare"})
public class EmotionCareApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(EmotionCareApiApplication.class, args);
  }
}
