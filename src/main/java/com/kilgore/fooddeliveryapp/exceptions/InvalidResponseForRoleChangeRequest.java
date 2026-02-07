package com.kilgore.fooddeliveryapp.exceptions;

public class InvalidResponseForRoleChangeRequest extends RuntimeException{
    public InvalidResponseForRoleChangeRequest(String message) {
        super(message);
    }
}
