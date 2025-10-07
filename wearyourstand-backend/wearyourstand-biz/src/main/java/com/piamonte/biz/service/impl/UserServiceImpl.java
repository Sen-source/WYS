package com.piamonte.biz.service.impl;

import com.piamonte.biz.UserService;
import com.piamonte.biz.data.User;
import com.piamonte.biz.data.UserRepository;
import com.piamonte.biz.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public User registerUser(RegisterRequest request) {
        System.out.println("=== USER SERVICE REGISTRATION START ===");
        System.out.println("Registering user with email: " + request.getEmail());
        System.out.println("First name: " + request.getFirstName());
        System.out.println("Last name: " + request.getLastName());
        System.out.println("Phone: " + request.getPhone());
        
        try {
            // Check if email already exists
            System.out.println("Checking if email exists...");
            boolean emailExists = userRepository.existsByEmail(request.getEmail());
            System.out.println("Email exists check result: " + emailExists);
            
            if (emailExists) {
                System.out.println("ERROR: Email already exists: " + request.getEmail());
                throw new RuntimeException("Email already exists");
            }
            
            // Create new user
            System.out.println("Creating new user object...");
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhone(request.getPhone());
            user.setRole(User.Role.CUSTOMER);
            
            System.out.println("User object created with role: " + user.getRole());
            System.out.println("User email: " + user.getEmail());
            System.out.println("User first name: " + user.getFirstName());
            System.out.println("User last name: " + user.getLastName());
            
            // Save to database
            System.out.println("Saving user to database...");
            User savedUser = userRepository.save(user);
            System.out.println("User saved successfully!");
            System.out.println("Saved user ID: " + savedUser.getId());
            System.out.println("Saved user email: " + savedUser.getEmail());
            System.out.println("Saved user role: " + savedUser.getRole());
            System.out.println("=== USER SERVICE REGISTRATION SUCCESS ===");
            
            return savedUser;
        } catch (Exception e) {
            System.out.println("=== USER SERVICE REGISTRATION ERROR ===");
            System.out.println("Error in registerUser: " + e.getMessage());
            System.out.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            throw e; // Re-throw to be caught by controller
        }
    }
    
    @Override
    public User saveUser(User user) {
        System.out.println("Saving user directly: " + user.getEmail() + " with role: " + user.getRole());
        return userRepository.save(user);
    }
    
    @Override
    public Optional<User> authenticateUser(String email, String password) {
        System.out.println("Authenticating user: " + email);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("User found in database: " + user.getEmail());
            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
            System.out.println("Password matches: " + passwordMatches);
            if (passwordMatches) {
                return Optional.of(user);
            }
        } else {
            System.out.println("No user found with email: " + email);
        }
        return Optional.empty();
    }
    
    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Override
    public boolean changePassword(String email, String currentPassword, String newPassword) {
        System.out.println("=== PASSWORD CHANGE START ===");
        System.out.println("Changing password for email: " + email);
        
        try {
            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                System.out.println("ERROR: User not found with email: " + email);
                return false;
            }
            
            User user = userOpt.get();
            System.out.println("User found: " + user.getEmail() + " with role: " + user.getRole());
            
            // Verify current password
            boolean currentPasswordMatches = passwordEncoder.matches(currentPassword, user.getPassword());
            System.out.println("Current password verification: " + currentPasswordMatches);
            
            if (!currentPasswordMatches) {
                System.out.println("ERROR: Current password is incorrect");
                return false;
            }
            
            // Encode and set new password
            String encodedNewPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedNewPassword);
            
            // Save updated user
            userRepository.save(user);
            System.out.println("Password changed successfully for user: " + email);
            System.out.println("=== PASSWORD CHANGE SUCCESS ===");
            
            return true;
        } catch (Exception e) {
            System.out.println("=== PASSWORD CHANGE ERROR ===");
            System.out.println("Error changing password: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}



