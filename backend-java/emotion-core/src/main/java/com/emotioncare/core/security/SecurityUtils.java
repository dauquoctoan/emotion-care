package com.emotioncare.core.security;

import java.util.Optional;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

  private SecurityUtils() {}

  public static Optional<UUID> getCurrentDeviceId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof String s) {
      try {
        return Optional.of(UUID.fromString(s));
      } catch (IllegalArgumentException ignored) {
      }
    }
    return Optional.empty();
  }

  public static Optional<String> getCurrentDeviceIdString() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof String s) {
      return Optional.of(s);
    }
    return Optional.empty();
  }
}
