package edu.hcmute.advice;

import edu.hcmute.dto.UserExceptionDto;
import edu.hcmute.exception.UserException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class UserExceptionController extends ResponseEntityExceptionHandler {
    @ExceptionHandler(UserException.class)
    public ResponseEntity<UserExceptionDto> handleBusinessException(UserException userException) {
        UserExceptionDto userExceptionDto = new UserExceptionDto(
                userException.getErrorMessage(),
                userException.getErrorCode()
        );
        return new ResponseEntity<>(userExceptionDto, HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request) {
        List<UserExceptionDto> validationErrors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String errorMessage = error.getDefaultMessage();
            int errorCode = 400;
            UserExceptionDto userExceptionDto = new UserExceptionDto(
                    errorMessage,
                    errorCode
            );
            validationErrors.add(userExceptionDto);
        });
        return new ResponseEntity<>(validationErrors, HttpStatus.BAD_REQUEST);
    }
}