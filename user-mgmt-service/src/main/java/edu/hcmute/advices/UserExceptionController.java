package edu.hcmute.advices;

import edu.hcmute.beans.UserExceptionBean;
import edu.hcmute.exceptions.UserException;
import edu.hcmute.exceptions.UserRestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RestControllerAdvice
public class UserExceptionController extends ResponseEntityExceptionHandler {


    @ExceptionHandler(UserException.class)
    public ResponseEntity<UserExceptionBean> handleBusinessException(UserException userException) {
        log.info("Business Exception :: {}", userException.toString());
        log.info("Get class = {}", userException.getClass());
        for (StackTraceElement ste : userException.fillInStackTrace().getStackTrace()) {
            log.info("Method name = {}", ste.getMethodName());
            log.info("Class name = {}", ste.getClassName());
            log.info("Line number = {}", ste.getLineNumber());
        }
        userException.printStackTrace();
        UserExceptionBean userExceptionBean = UserExceptionBean.builder()
                .message(userException.getErrorMessage())
                .code(userException.getErrorCode())
                .build();
        return ResponseEntity.ok(userExceptionBean);
    }

    @ExceptionHandler(UserRestException.class)
    public ResponseEntity<UserRestException> handleControllerException(UserRestException userException) {
        log.info("Controller Exception {}", userException);
        return ResponseEntity.ok(userException);
    }

//    @Nullable
//    private Method getMappedMethod(Class<? extends Throwable> exceptionType) {
//        List<Class<? extends Throwable>> matches = new ArrayList<>();
//        for (Class<? extends Throwable> mappedException : this.mappedMethods.keySet()) {
//            if (mappedException.isAssignableFrom(exceptionType)) {
//                matches.add(mappedException);
//            }
//        }
//        if (!matches.isEmpty()) {
//            matches.sort(new ExceptionDepthComparator(exceptionType));
//            return this.mappedMethods.get(matches.get(0));
//        } else return null;
//    }
}