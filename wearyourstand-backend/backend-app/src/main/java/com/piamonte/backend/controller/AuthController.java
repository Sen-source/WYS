package com.piamonte.backend.controller;

import com.piamonte.backend.security.JwtUtils;
import com.piamonte.biz.*;
import com.piamonte.biz.data.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is working!");
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof User) {
                    User user = (User) principal;
                    return ResponseEntity.ok("Authenticated as: " + user.getEmail() + " with role: " + user.getRole());
                }
            }
            return ResponseEntity.status(401).body("Not authenticated");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            System.out.println("Testing database connection...");
            List<User> users = userService.getAllUsers();
            System.out.println("Database test successful. Found " + users.size() + " users.");
            return ResponseEntity.ok("Database connection successful. Found " + users.size() + " users.");
        } catch (Exception e) {
            System.out.println("Database test failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Database test failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching users: " + e.getMessage());
        }
    }
    
    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdmin() {
        try {
            Optional<User> adminUser = userService.findByEmail("admin@wearyourstand.com");
            if (adminUser.isPresent()) {
                User user = adminUser.get();
                return ResponseEntity.ok("Admin user exists: " + user.getEmail() + " with role: " + user.getRole());
            } else {
                return ResponseEntity.ok("Admin user does not exist");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error checking admin: " + e.getMessage());
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("=== REGISTRATION START ===");
            System.out.println("Registration attempt for email: " + request.getEmail());
            System.out.println("First name: " + request.getFirstName());
            System.out.println("Last name: " + request.getLastName());
            System.out.println("Phone: " + request.getPhone());
            
            // Validate request data
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("ERROR: Email is null or empty");
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                System.out.println("ERROR: First name is null or empty");
                return ResponseEntity.badRequest().body("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
                System.out.println("ERROR: Last name is null or empty");
                return ResponseEntity.badRequest().body("Last name is required");
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                System.out.println("ERROR: Password is null or too short");
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }
            
            // Check if this is trying to register as admin
            if ("admin@wearyourstand.com".equals(request.getEmail())) {
                System.out.println("ERROR: Cannot register as admin email");
                return ResponseEntity.badRequest().body("Cannot register with admin email");
            }
            
            System.out.println("Request validation passed, calling userService.registerUser()");
            User user = userService.registerUser(request);
            System.out.println("User registered successfully: " + user.getEmail());
            System.out.println("User ID: " + user.getId());
            System.out.println("User role: " + user.getRole());
            
            String token = jwtUtils.generateToken(user.getEmail());
            System.out.println("Token generated for registration: " + token.substring(0, 20) + "...");
            
            AuthResponse response = new AuthResponse(token, user.getId(), user.getEmail(), 
                user.getFirstName(), user.getLastName(), user.getRole().name());
            
            System.out.println("AuthResponse created: " + response.getEmail() + ", Role: " + response.getRole());
            System.out.println("=== REGISTRATION SUCCESS ===");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("=== REGISTRATION ERROR ===");
            System.out.println("Registration error: " + e.getMessage());
            System.out.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("=== LOGIN START ===");
            System.out.println("Login attempt for email: " + request.getEmail());
            System.out.println("Request body: " + request.toString());
            
            // Validate request
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("ERROR: Email is null or empty");
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                System.out.println("ERROR: Password is null or empty");
                return ResponseEntity.badRequest().body("Password is required");
            }
            
            Optional<User> userOpt = userService.authenticateUser(request.getEmail(), request.getPassword());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("User found: " + user.getEmail());
                System.out.println("User ID: " + user.getId());
                System.out.println("User role: " + user.getRole());
                
                String token = jwtUtils.generateToken(user.getEmail());
                System.out.println("Token generated successfully: " + token.substring(0, 20) + "...");
                
                AuthResponse response = new AuthResponse(token, user.getId(), user.getEmail(), 
                    user.getFirstName(), user.getLastName(), user.getRole().name());
                
                System.out.println("AuthResponse created: " + response.getEmail() + ", Role: " + response.getRole());
                System.out.println("=== LOGIN SUCCESS ===");
                
                return ResponseEntity.ok(response);
            } else {
                System.out.println("=== LOGIN FAILED ===");
                System.out.println("User not found or invalid password for: " + request.getEmail());
                return ResponseEntity.badRequest().body("Invalid credentials");
            }
        } catch (Exception e) {
            System.out.println("=== LOGIN ERROR ===");
            System.out.println("Login error: " + e.getMessage());
            System.out.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("=== ADMIN CREATION START ===");
            System.out.println("Admin creation attempt for email: " + request.getEmail());
            
            // Validate request data
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("ERROR: Email is null or empty");
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                System.out.println("ERROR: First name is null or empty");
                return ResponseEntity.badRequest().body("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
                System.out.println("ERROR: Last name is null or empty");
                return ResponseEntity.badRequest().body("Last name is required");
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                System.out.println("ERROR: Password is null or too short");
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }
            
            // Check if user already exists
            if (userService.findByEmail(request.getEmail()).isPresent()) {
                System.out.println("ERROR: User already exists with email: " + request.getEmail());
                return ResponseEntity.badRequest().body("User already exists with this email");
            }
            
            // Create admin user
            User adminUser = new User();
            adminUser.setEmail(request.getEmail());
            adminUser.setPassword(passwordEncoder.encode(request.getPassword()));
            adminUser.setFirstName(request.getFirstName());
            adminUser.setLastName(request.getLastName());
            adminUser.setPhone(request.getPhone());
            adminUser.setRole(User.Role.ADMIN);
            
            User savedAdmin = userService.saveUser(adminUser);
            System.out.println("Admin user created successfully: " + savedAdmin.getEmail());
            System.out.println("Admin role: " + savedAdmin.getRole());
            System.out.println("=== ADMIN CREATION SUCCESS ===");
            
            return ResponseEntity.ok("Admin user created successfully: " + savedAdmin.getEmail());
            
        } catch (Exception e) {
            System.out.println("=== ADMIN CREATION ERROR ===");
            System.out.println("Admin creation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Admin creation failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            System.out.println("=== PASSWORD CHANGE REQUEST START ===");
            System.out.println("Password change request received");
            
            // Get the authenticated user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("ERROR: No authenticated user found");
                return ResponseEntity.status(401).body("Authentication required");
            }
            
            // Get user details from authentication
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                System.out.println("ERROR: Invalid user principal in authentication");
                return ResponseEntity.status(401).body("Invalid authentication");
            }
            
            User authenticatedUser = (User) principal;
            String userEmail = authenticatedUser.getEmail();
            System.out.println("Authenticated user: " + userEmail + " with role: " + authenticatedUser.getRole());
            
            // Validate request
            if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
                System.out.println("ERROR: Current password is required");
                return ResponseEntity.badRequest().body("Current password is required");
            }
            
            if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
                System.out.println("ERROR: New password must be at least 6 characters");
                return ResponseEntity.badRequest().body("New password must be at least 6 characters");
            }
            
            // Change password
            boolean success = userService.changePassword(userEmail, request.getCurrentPassword(), request.getNewPassword());
            
            if (success) {
                System.out.println("Password changed successfully for user: " + userEmail);
                System.out.println("=== PASSWORD CHANGE REQUEST SUCCESS ===");
                return ResponseEntity.ok("Password changed successfully");
            } else {
                System.out.println("Password change failed for user: " + userEmail);
                System.out.println("=== PASSWORD CHANGE REQUEST FAILED ===");
                return ResponseEntity.badRequest().body("Password change failed. Please check your current password.");
            }
            
        } catch (Exception e) {
            System.out.println("=== PASSWORD CHANGE REQUEST ERROR ===");
            System.out.println("Password change error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Password change failed: " + e.getMessage());
        }
    }
}

