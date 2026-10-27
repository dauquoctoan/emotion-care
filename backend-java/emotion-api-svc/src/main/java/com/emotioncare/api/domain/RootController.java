package com.emotioncare.api.domain;

import io.swagger.v3.oas.annotations.Hidden;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Hidden
public class RootController {

  @GetMapping("/")
  public Map<String, Object> index() {
    return Map.of(
        "service", "Emotion Care Platform Backend API",
        "version", "1.0.0",
        "status", "RUNNING",
        "swagger_ui", "http://localhost:8080/swagger-ui.html",
        "endpoints", Map.of(
            "categories", "/categories",
            "posts_feed", "/posts",
            "device_profile", "/devices/me",
            "health", "/actuator/health"
        )
    );
  }
}
