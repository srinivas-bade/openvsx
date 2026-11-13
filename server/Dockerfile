# syntax=docker/dockerfile:1
FROM gradle:jdk25-corretto AS builder

# Copy sources
WORKDIR /home/gradle
COPY --chown=gradle:gradle gradlew *.gradle gradle.properties ./
COPY --chown=gradle:gradle gradle ./gradle/
COPY --chown=gradle:gradle src ./src/

ENV CI=true

# Build the server application
RUN ./gradlew --no-daemon assemble

FROM amazoncorretto:25

# Create user openvsx and set up home directory
# (shadow-utils provides groupadd/useradd, which the Amazon Linux base image does not ship)
RUN yum install -y shadow-utils \
    && yum clean all \
    && groupadd -r openvsx \
    && useradd --no-log-init -r -g openvsx openvsx \
    && mkdir -p /home/openvsx/server \
    && chown -R openvsx:openvsx /home/openvsx

USER openvsx
WORKDIR /home/openvsx/server

# Copy and unpack the server archive
COPY --chown=openvsx:openvsx --from=builder /home/gradle/build/libs/openvsx-server.jar /home/openvsx/
RUN jar -xf /home/openvsx/openvsx-server.jar && rm /home/openvsx/openvsx-server.jar

# Copy the start script and make it executable
COPY --chown=openvsx:openvsx scripts/run-server.sh ./
RUN chmod u+x run-server.sh

# Run the start script
ENTRYPOINT ["./run-server.sh"]
