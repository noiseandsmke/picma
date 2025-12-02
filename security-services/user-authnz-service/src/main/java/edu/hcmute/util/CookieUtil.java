package edu.hcmute.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

public class CookieUtil {
    public static final String SESSION_COOKIE_NAME = "PICMA_SESSION";

    public static void setSessionCookie(HttpServletResponse response, String sessionId, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(SESSION_COOKIE_NAME, sessionId)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public static void clearSessionCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(SESSION_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}