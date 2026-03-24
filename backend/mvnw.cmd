@REM Maven Wrapper for Windows
@REM Download Maven if not present and run it

@echo off
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6
set MAVEN_ZIP=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin.zip
set MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Downloading Maven 3.9.6...
    mkdir "%MAVEN_HOME%" 2>nul
    mkdir "%USERPROFILE%\.m2\wrapper\dists" 2>nul
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%MAVEN_ZIP%'"
    powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force"
    del "%MAVEN_ZIP%" 2>nul
    
    REM The extracted folder has the maven inside it
    if exist "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6\bin\mvn.cmd" (
        echo Maven downloaded successfully.
    ) else (
        echo Maven extraction may have created a nested folder. Checking...
        REM List what was extracted
        dir "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6"
    )
)

set PATH=%MAVEN_HOME%\bin;%PATH%
mvn.cmd %*
