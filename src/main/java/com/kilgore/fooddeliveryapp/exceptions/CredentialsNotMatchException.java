package com.kilgore.fooddeliveryapp.exceptions;

public class CredentialsNotMatchException extends RuntimeException {
    public CredentialsNotMatchException(String message) {
        super(message);
    }
}
