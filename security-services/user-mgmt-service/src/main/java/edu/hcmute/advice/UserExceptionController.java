package edu.hcmute.advice;

import edu.hcmute.dto.UserExceptionDto;
import edu.hcmute.exception.UserException;
import edu.hcmute.exception.UserRestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class UserExceptionController extends ResponseEntityExceptionHandler {

    @ExceptionHandler(UserException.class)
    public ResponseEntity<UserExceptionDto> handleBusinessException(UserException userException) {
        log.info("Business Exception :: {}", userException.toString());
        log.info("Get class = {}", userException.getClass());
        log.error("Exception details:", userException);
        UserExceptionDto userExceptionDto = new UserExceptionDto(
                userException.getErrorMessage(),
                userException.getErrorCode()
        );
        return ResponseEntity.ok(userExceptionDto);
    }

    @ExceptionHandler(UserRestException.class)
    public ResponseEntity<UserRestException> handleControllerException(UserRestException userException) {
        log.info("Controller Exception {}", userException.toString());
        return ResponseEntity.ok(userException);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(@NonNull MethodArgumentNotValidException ex, @NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {
        log.info("Handle method argument not valid");
        List<UserExceptionDto> validationErrors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            UserExceptionDto userExceptionDto = new UserExceptionDto(
                    error.getDefaultMessage(),
                    HttpStatus.BAD_REQUEST.value()
            );
            validationErrors.add(userExceptionDto);
        });
        log.info("Validation errors size :: {}", validationErrors.size());
        return ResponseEntity.badRequest().body(validationErrors);
    }
}