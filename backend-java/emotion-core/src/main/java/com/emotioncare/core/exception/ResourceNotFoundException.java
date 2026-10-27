package com.emotioncare.core.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApplicationException {

  public ResourceNotFoundException(String resourceName, Object identifier) {
    super(
        HttpStatus.NOT_FOUND,
        "RESOURCE_NOT_FOUND",
        String.format("%s with identifier [%s] not found", resourceName, identifier)
    );
  }

  public ResourceNotFoundException(String message) {
    super(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", message);
  }
}
