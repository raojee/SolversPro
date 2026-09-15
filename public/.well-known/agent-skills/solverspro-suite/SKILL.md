---
name: solverspro-suite
description: Access SolversPro collection of online solvers, calculators, and converters for math, finance, health, trades, and developers.
version: 1.0.0
author: SolversPro Team
homepage: https://solverspro.com
license: MIT
---

# SolversPro Suite Agent Skill

This skill enables AI agents to query and utilize SolversPro's collection of free calculation and solver tools.

## When to Use This Skill
- Performing calculations in finance (mortgages, compound interest, loan amortizations).
- Performing health and fitness calculations (BMI, TDEE, calorie needs).
- Mathematical calculations, quadratic equations, matrices, and unit conversions.
- Construction and trade calculations (concrete slabs, lumber board feet, roof pitch).
- Code conversion and developer formatting (JSON, XML, Base64, UUIDs, JWTs).

## API Endpoints

### 1. General AI Problem Solver
- **Endpoint**: `POST https://solverspro.com/api/solve`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "prompt": "Calculate the monthly mortgage payment on a $400,000 loan at 6.5% interest over 30 years."
  }
  ```
- **Response**: Streamed plain text with LaTeX math notation.

### 2. Health & Status
- **Endpoint**: `GET https://solverspro.com/api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "uptime": 12345
  }
  ```

## Available Tool Categories
- `/developer/`: JSON tools, XML tools, Base64, JWT decoder, minifier, diff, hash generator.
- `/math/`: Scientific calculator, quadratic solver, matrix calculator, unit converter.
- `/finance/`: Mortgage calculator, compound interest, investment returns.
- `/health/`: BMI calculator, TDEE calculator, body fat estimator.
- `/trades/`: Concrete volume, board feet, flooring, electrical load calculations.
