package com.airbnb.airbn_clone_back.user.application;

public class UserException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public UserException(String message) {
        super(message);
    }
}