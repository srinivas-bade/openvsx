# Oracle JDK to Amazon Corretto Migration - Licensing Report

## 1. Summary

| Item | Value |
|---|---|
| Project | openvsx (Eclipse Open VSX server, CLI, web UI) |
| Java version (unchanged) | 25 |
| Files scanned | All `.java`, Gradle, Dockerfile, docker-compose, shell, properties/YAML, CI workflow and devcontainer files (excluding `build/`, `.git/`, `node_modules/`) |
| Oracle internal API imports found | 0 needing replacement (`sun.*`, `com.oracle.*` none; 5 `com.sun.*` imports of supported, exported JDK modules - see Manual Review) |
| Vendor-specific issues found / fixed | 8 / 8 (2 container images, 1 builder image, 5 CI `setup-java` distribution fields) |
| Oracle JVM flags (`-XX:+UnlockCommercialFeatures`, `-XX:+FlightRecorder`) | None found |
| Oracle JDK path references | None found |
| devcontainer.json | Not present |
| Manual review items | 5 (informational, no change required) |
| Build on Amazon Corretto 25.0.5 | `./gradlew compileJava compileTestJava` - BUILD SUCCESSFUL |

## 2. Dependency Table

| File | Line | Oracle API | Replacement | Status |
|---|---|---|---|---|
| N/A | - | No Oracle internal API imports requiring replacement detected | - | Pass |
| server/src/test/java/org/eclipse/openvsx/security/TokenResponseClientsTest.java | 18 | `com.sun.net.httpserver.HttpServer` | None (supported `jdk.httpserver` module, included in Corretto) | Manual Review - no change |
| server/src/test/java/org/eclipse/openvsx/trustedpublishing/gitlab/GitLabTrustedPublishingProviderTest.java | 23 | `com.sun.net.httpserver.HttpServer` | None (supported `jdk.httpserver` module) | Manual Review - no change |
| server/src/test/java/org/eclipse/openvsx/trustedpublishing/github/GitHubTrustedPublishingProviderTest.java | 23 | `com.sun.net.httpserver.HttpServer` | None (supported `jdk.httpserver` module) | Manual Review - no change |
| server/src/test/java/org/eclipse/openvsx/scanning/HttpClientExecutorTest.java | 18 | `com.sun.net.httpserver.HttpServer` | None (supported `jdk.httpserver` module) | Manual Review - no change |
| server/src/test/java/org/eclipse/openvsx/publish/ExtensionVersionIntegrityServiceTest.java | 22 | `com.sun.management.ThreadMXBean` | None (supported `jdk.management` module) | Manual Review - no change |

## 3. Licensing Cost Estimate

Oracle Java SE Universal Subscription (employee-based pricing):

| Employees | Rate | Monthly | Annual | 5-Year |
|---|---|---|---|---|
| 500 | $15.00/emp/mo | $7,500 | $90,000 | $450,000 |
| 1,000 | $12.00/emp/mo | $12,000 | $144,000 | $720,000 |
| 5,000 | $10.50/emp/mo | $52,500 | $630,000 | $3,150,000 |
| 10,000 | $10.50/emp/mo* | $105,000 | $1,260,000 | $6,300,000 |

*10,000-employee rate extrapolated from highest published tier (3,000-9,999). Actual enterprise pricing negotiated with Oracle.

Amazon Corretto cost: **$0** (no licensing fees).

## 4. Modified Files

| File | Change |
|---|---|
| `server/Dockerfile` | Builder stage `gradle:jdk-25-and-25` -> `gradle:jdk25-corretto`; runtime stage `eclipse-temurin:25-jdk` -> `amazoncorretto:25`; added `yum install -y shadow-utils && yum clean all` (Amazon Linux base lacks `groupadd`/`useradd`) |
| `docker-compose.yml` | `server` service image `eclipse-temurin:25-jdk` -> `amazoncorretto:25`; command installs `findutils` (provides `xargs`, required by `gradlew`); healthcheck comment updated to no longer reference eclipse-temurin |
| `.github/workflows/main.yml` | `distribution: 'temurin'` -> `'corretto'` (2 occurrences; `java-version: 25` unchanged) |
| `.github/workflows/release.yml` | `distribution: 'temurin'` -> `'corretto'` |
| `.github/workflows/sbom-gradle.yml` | `distribution: 'temurin'` -> `'corretto'` |
| `.github/workflows/gradle-dependency-graph.yml` | `distribution: 'temurin'` -> `'corretto'` |

## 5. Manual Review Items

The following `com.sun.*` imports are not in the Oracle-internal replacement table. They are **public, exported, supported JDK APIs** (not Oracle-proprietary internals) shipped in every OpenJDK build including Amazon Corretto. They were left unchanged; the affected tests were compiled and run on Corretto 25.0.5 (38 tests, 0 failures).

| Import | File:Line | Reason | Call-sites |
|---|---|---|---|
| `com.sun.net.httpserver.HttpServer` | `server/src/test/java/org/eclipse/openvsx/security/TokenResponseClientsTest.java:18` | `jdk.httpserver` module, exported and supported | Line 39: `HttpServer.create(...)` (embedded mock HTTP server) |
| `com.sun.net.httpserver.HttpServer` | `server/src/test/java/org/eclipse/openvsx/trustedpublishing/gitlab/GitLabTrustedPublishingProviderTest.java:23` | Same as above | Line 134: `HttpServer.create(...)` |
| `com.sun.net.httpserver.HttpServer` | `server/src/test/java/org/eclipse/openvsx/trustedpublishing/github/GitHubTrustedPublishingProviderTest.java:23` | Same as above | Line 84: `HttpServer.create(...)` |
| `com.sun.net.httpserver.HttpServer` | `server/src/test/java/org/eclipse/openvsx/scanning/HttpClientExecutorTest.java:18` | Same as above | Line 33: `HttpServer.create(...)` |
| `com.sun.management.ThreadMXBean` | `server/src/test/java/org/eclipse/openvsx/publish/ExtensionVersionIntegrityServiceTest.java:22` | `jdk.management` module, exported and supported | Lines 151, 264, 269: cast/`instanceof` of `ManagementFactory.getThreadMXBean()` for thread allocated-memory metrics |

Notes:
- `doc/development.md` still suggests installing Temurin for local development; documentation only, not changed.
- The runtime image keeps a full JDK (`amazoncorretto:25`) because the Dockerfile runs `jar -xf` to unpack the server archive. Switching to a headless/JRE variant would require unpacking in the builder stage instead.

## 6. Annotation-Processor Upgrades

Not applicable. Lombok is not used by the project; no annotation-processor changes were required.
