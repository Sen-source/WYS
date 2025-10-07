package com.piamonte.backend.config;

import com.piamonte.biz.data.User;
import com.piamonte.biz.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// This class runs when the app starts up to create default data
// Basically like a setup script but in Java
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserService userService; // Need this to save users to database
    
    @Autowired
    private PasswordEncoder passwordEncoder; // For hashing passwords (security stuff)
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== DATA INITIALIZATION START ===");
        
        // First check if we already have an admin user
        // Don't want to create duplicates lol
        if (userService.findByEmail("admin@wearyourstand.com").isEmpty()) {
            System.out.println("Creating default admin user...");
            
            // Create a new admin user object
            User adminUser = new User();
            adminUser.setEmail("admin@wearyourstand.com"); // Admin email
            adminUser.setPassword(passwordEncoder.encode("admin123")); // Hash the password
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setPhone("123-456-7890"); // Fake phone number
            adminUser.setRole(User.Role.ADMIN); // Set as admin role
            
            // Save it to the database
            User savedAdmin = userService.saveUser(adminUser);
            System.out.println("Default admin user created successfully!");
            System.out.println("Admin Email: admin@wearyourstand.com");
            System.out.println("Admin Password: admin123");
            System.out.println("Admin Role: " + savedAdmin.getRole());
        } else {
            System.out.println("Admin user already exists, skipping creation.");
        }
        
        System.out.println("=== DATA INITIALIZATION COMPLETE ===");
    }
}