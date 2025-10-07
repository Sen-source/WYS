package com.piamonte.backend.security;

import com.piamonte.biz.data.User;
import com.piamonte.biz.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private UserService userService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String jwt = parseJwt(request);
        System.out.println("JWT Filter - Processing request: " + request.getRequestURI());
        System.out.println("JWT Filter - Method: " + request.getMethod());
        System.out.println("JWT Filter - Token present: " + (jwt != null));
        System.out.println("JWT Filter - Authorization header: " + request.getHeader("Authorization"));
        
        // Skip JWT validation for public endpoints
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        if (isPublicEndpoint(requestURI, method)) {
            System.out.println("JWT Filter - Public endpoint, skipping JWT validation");
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            if (jwt != null && jwtUtils.validateToken(jwt)) {
                String email = jwtUtils.getEmailFromToken(jwt);
                System.out.println("JWT Filter - Valid token for email: " + email);
                
                User user = userService.findByEmail(email).orElse(null);
                if (user != null) {
                    System.out.println("JWT Filter - User found: " + user.getEmail() + " with role: " + user.getRole());
                    
                    // Create authorities based on user role
                    var authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                    );
                    
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(user, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("JWT Filter - Authentication set successfully");
                } else {
                    System.out.println("JWT Filter - User not found for email: " + email);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\":\"User not found\"}");
                    response.setContentType("application/json");
                    return;
                }
            } else {
                System.out.println("JWT Filter - No valid token found for protected endpoint");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Authentication required\"}");
                response.setContentType("application/json");
                return;
            }
        } catch (Exception e) {
            System.out.println("JWT Filter - Error: " + e.getMessage());
            logger.error("Cannot set user authentication: {}", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
            response.setContentType("application/json");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private boolean isPublicEndpoint(String requestURI, String method) {
        // Authentication endpoints
        if (requestURI.startsWith("/api/auth/login") ||
            requestURI.startsWith("/api/auth/register") ||
            requestURI.startsWith("/api/auth/test") ||
            requestURI.startsWith("/api/auth/test-db") ||
            requestURI.startsWith("/api/auth/users") ||
            requestURI.startsWith("/api/auth/create-admin") ||
            requestURI.startsWith("/api/auth/check-admin")) {
            return true;
        }
        
        // Static resources
        if (requestURI.startsWith("/uploads/")) {
            return true;
        }
        
        // Public product browsing endpoints (GET requests only)
        if ("GET".equals(method)) {
            if (requestURI.equals("/api/products") ||
                requestURI.startsWith("/api/products/available") ||
                requestURI.startsWith("/api/products/category/") ||
                requestURI.startsWith("/api/products/search") ||
                requestURI.startsWith("/api/products/categories") ||
                requestURI.matches("/api/products/\\d+")) { // /api/products/{id}
                return true;
            }
        }
        
        // Test endpoints (no authentication required)
        if (requestURI.startsWith("/api/admin/test")) {
            return true;
        }
        
        return false;
    }
    
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
}



