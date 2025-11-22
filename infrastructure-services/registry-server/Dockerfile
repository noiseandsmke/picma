FROM amazoncorretto:17-alpine

ARG WORK_DIR=/opt/registry-server
ARG ARTIFACT_NAME=registry-server.jar
ARG SERVICE_PORT=8761

ENV FINAL_ARTIFACT=${WORK_DIR}/${ARTIFACT_NAME}

RUN mkdir ${WORK_DIR}
WORKDIR ${WORK_DIR}
COPY target/${ARTIFACT_NAME} ${WORK_DIR}
EXPOSE ${SERVICE_PORT}

CMD ["sh", "-c", "java -jar ${FINAL_ARTIFACT}"]