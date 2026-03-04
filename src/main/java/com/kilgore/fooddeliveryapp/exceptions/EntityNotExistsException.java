package com.kilgore.fooddeliveryapp.exceptions;

public class EntityNotExistsException extends RuntimeException {
    public EntityNotExistsException(String message) {
        super(message);
    }
}
