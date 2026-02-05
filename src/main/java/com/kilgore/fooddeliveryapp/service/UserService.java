package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.dto.AuthResponse;
import com.kilgore.fooddeliveryapp.dto.LoginRequestDto;
import com.kilgore.fooddeliveryapp.dto.SignupRequestDto;
import com.kilgore.fooddeliveryapp.exceptions.InvalidCredentialsException;
import com.kilgore.fooddeliveryapp.exceptions.UserAlreadyExistsException;
import com.kilgore.fooddeliveryapp.model.USER_ROLE;
import com.kilgore.fooddeliveryapp.model.User;
import com.kilgore.fooddeliveryapp.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;


    public User registerUser(SignupRequestDto request) {
        if(userRepository.findByEmail(request.getEmail()) != null) {
            throw new UserAlreadyExistsException();
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(USER_ROLE.CUSTOMER);

        userRepository.save(user);
        return user;
    }

    public AuthResponse login(@Valid LoginRequestDto request) {
        Authentication authentication;
        try {
            authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    ));
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail());


        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole(),
                jwtService.getExpiresAt(token)
        );
    }
}
