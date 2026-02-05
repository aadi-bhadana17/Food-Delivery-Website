package com.kilgore.fooddeliveryapp.exceptions;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException() {
        super("User with this email already exists, Please try again with another email, or try login");
    }
}
