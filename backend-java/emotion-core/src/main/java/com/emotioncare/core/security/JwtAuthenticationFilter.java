package com.emotioncare.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter extracting JWT tokens from Authorization header or fallback x-device-id header
 * and setting anonymous authenticated Device principal in Spring SecurityContext.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider jwtTokenProvider;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain
  ) throws ServletException, IOException {
    try {
      String jwt = jwtTokenProvider.resolveToken(request);
      if (StringUtils.isNotBlank(jwt) && jwtTokenProvider.validateToken(jwt)) {
        String deviceId = jwtTokenProvider.getDeviceIdFromToken(jwt);
        setAuthentication(request, deviceId);
      } else {
        // Fallback to x-device-id for anonymous React Native Expo client compatibility
        String deviceIdHeader = request.getHeader("x-device-id");
        if (StringUtils.isBlank(deviceIdHeader)) {
          deviceIdHeader = request.getHeader("X-Device-Id");
        }
        if (StringUtils.isNotBlank(deviceIdHeader)) {
          setAuthentication(request, deviceIdHeader.trim());
        }
      }
    } catch (Exception ex) {
      log.error("Failed to set device authentication in security context", ex);
    }

    filterChain.doFilter(request, response);
  }

  private void setAuthentication(HttpServletRequest request, String deviceId) {
    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
        deviceId,
        null,
        Collections.singletonList(new SimpleGrantedAuthority("ROLE_DEVICE"))
    );
    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }
}
