package com.kilgore.fooddeliveryapp.exceptions;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid Credentials, either email or password is wrong");
    }
}
