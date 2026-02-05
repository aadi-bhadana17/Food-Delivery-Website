package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.AuthResponse;
import com.kilgore.fooddeliveryapp.dto.LoginRequestDto;
import com.kilgore.fooddeliveryapp.dto.SignupRequestDto;
import com.kilgore.fooddeliveryapp.model.User;
import com.kilgore.fooddeliveryapp.service.JwtService;
import com.kilgore.fooddeliveryapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signupUser(@Valid @RequestBody SignupRequestDto request) {
        User user = userService.registerUser(request);

        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole(), jwtService.getExpiresAt(token)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequestDto request) {
        AuthResponse authResponse = userService.login(request);
        return ResponseEntity.ok(authResponse);
    }
}
