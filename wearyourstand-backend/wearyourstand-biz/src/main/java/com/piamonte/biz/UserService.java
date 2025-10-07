package com.piamonte.biz;

import com.piamonte.biz.data.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(RegisterRequest request);
    User saveUser(User user);
    Optional<User> authenticateUser(String email, String password);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    User updateUser(User user);
    void deleteUser(Long id);
    List<User> getAllUsers();
    boolean changePassword(String email, String currentPassword, String newPassword);
}











