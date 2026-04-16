# Fixing Package Declaration Mismatch

The error you are seeing:
`The declared package "com.insightx.gateway.config" does not match the expected package "main.java.com.insightx.gateway.config"`

## The Problem
Your IDE (VS Code or IntelliJ) has incorrectly identified `src` as the **Source Root** folder.
In a standard Maven project, the source root is `src/main/java`.

Because the IDE thinks the root is `src`, it expects the package path to start from there: `main.java.com...`.
However, your code declares `package com.insightx.gateway.config;`, which is correct for Maven.

## Verification
We ran `mvn clean compile` and it **PASSED**. This confirms that your code and project structure are correct. The issue is only with how the IDE is viewing the project.

## How to Fix (VS Code)

1.  **Clean Java Server Workspace**:
    *   Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac).
    *   Type `Java: Clean Java Language Server Workspace`.
    *   Select it and confirm.
    *   Reload the window when asked.

2.  **Check Source Paths**:
    *   If the error persists, ensure that `src/main/java` is added as a source folder and `src` is NOT.
    *   You can do this by right-clicking `src/main/java` in the file explorer and looking for "Add to Source Path".

3.  **Update Maven Configuration**:
    *   Right-click `pom.xml` -> "Update Project" or "Reload Project".

## How to Fix (IntelliJ IDEA)

1.  Right-click on `src` directory -> Mark Directory as -> **Unmark as Sources Root**.
2.  Right-click on `src/main/java` directory -> Mark Directory as -> **Sources Root**.
3.  Right-click `pom.xml` -> Maven -> **Reload Project**.
