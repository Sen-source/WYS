package com.piamonte.backend.security;

import com.piamonte.backend.config.CorsConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private CorsConfig corsConfig;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - authentication and registration
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/test", "/api/auth/test-db", "/api/auth/users", "/api/auth/create-admin", "/api/auth/check-admin").permitAll()
                
                // Public endpoints - product browsing (for customers) - GET requests only
                .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/available").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/category/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/categories").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll()
                
                // Admin endpoints - product management (POST, PUT, DELETE on /api/products)
                .requestMatchers(HttpMethod.POST, "/api/products").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/products/multipart").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                
                // Public endpoints - static resources
                .requestMatchers("/uploads/**").permitAll()
                
                // Authenticated endpoints - user operations
                .requestMatchers("/api/auth/change-password").authenticated()
                .requestMatchers("/api/cart/**").authenticated()
                
                // Admin only endpoints - product management
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Admin only endpoints - order management (must come before general orders)
                .requestMatchers("/api/orders/admin").hasRole("ADMIN")
                .requestMatchers("/api/orders/*/status").hasRole("ADMIN")
                
                // Customer order operations (specific endpoints only)
                .requestMatchers("/api/orders/checkout").authenticated()
                .requestMatchers("/api/orders").authenticated()
                .requestMatchers("/api/orders/*").authenticated()
                .requestMatchers("/api/orders/number/*").authenticated()
                .requestMatchers("/api/orders/*/cancel").authenticated()
                
                // Admin only endpoints - audit logs
                .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                
                // All other requests need authentication
                .anyRequest().authenticated()
            );
        
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}



