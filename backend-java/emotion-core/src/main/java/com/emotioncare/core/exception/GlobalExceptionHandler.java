package com.emotioncare.core.exception;

import com.emotioncare.core.restful.response.wrapper.BaseResponse;
import com.emotioncare.core.restful.response.wrapper.FieldViolation;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralized Exception Handler for Emotion Care APIs.
 * Ensures consistent JSON response structure to client apps under any failure scenario.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApplicationException.class)
  public ResponseEntity<BaseResponse<Void>> handleApplicationException(ApplicationException ex) {
    log.warn("Application exception: [{}]: {}", ex.getErrorCode(), ex.getMessage());
    BaseResponse<Void> response = BaseResponse.fail(ex.getMessage());
    response.setStatusCode(ex.getStatus().value());
    response.getMetadata().setStatus(ex.getErrorCode());
    return new ResponseEntity<>(response, ex.getStatus());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<BaseResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
    List<FieldViolation> violations = ex.getBindingResult()
        .getAllErrors()
        .stream()
        .map(error -> {
          String fieldName = error instanceof FieldError ? ((FieldError) error).getField() : error.getObjectName();
          return new FieldViolation(fieldName, error.getDefaultMessage());
        })
        .collect(Collectors.toList());

    log.warn("Validation error on request: {}", violations);
    BaseResponse<Void> response = BaseResponse.fail(violations);
    response.setStatusCode(HttpStatus.BAD_REQUEST.value());
    response.getMetadata().setMessage("Validation failed for input arguments");
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<BaseResponse<Void>> handleGenericException(Exception ex) {
    log.error("Unhandled unexpected internal server error", ex);
    BaseResponse<Void> response = BaseResponse.fail("An unexpected error occurred. Please try again later.");
    response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
