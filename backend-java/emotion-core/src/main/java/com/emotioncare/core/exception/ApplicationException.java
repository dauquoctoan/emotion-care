package com.emotioncare.core.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApplicationException extends RuntimeException {

  private final HttpStatus status;
  private final String errorCode;

  public ApplicationException(String message) {
    super(message);
    this.status = HttpStatus.INTERNAL_SERVER_ERROR;
    this.errorCode = "INTERNAL_ERROR";
  }

  public ApplicationException(HttpStatus status, String errorCode, String message) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}
