package com.example.lifeflow.controller;

import com.example.lifeflow.entity.User;
import com.example.lifeflow.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasAuthority('COLLECTION')")
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}