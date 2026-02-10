package com.kilgore.fooddeliveryapp.controller;

import com.kilgore.fooddeliveryapp.dto.request.SignupRequest;
import com.kilgore.fooddeliveryapp.dto.request.LoginRequest;
import com.kilgore.fooddeliveryapp.dto.response.LoginAuthResponse;
import com.kilgore.fooddeliveryapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public LoginAuthResponse signupUser(@Valid @RequestBody SignupRequest request) {
        return authService.registerUser(request);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginAuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        LoginAuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(authResponse);
    }
}
