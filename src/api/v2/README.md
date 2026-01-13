# House Party API v2

Return to the main [README](../../README.md)


## Overview

The v2 API introduces significant improvements over v1, focusing on performance, scalability, maintainability, and security. This version restructures endpoints, enhances real-time capabilities, and provides better error handling and code organization.


## Key Improvements Over v1

| Feature                    | v1                                    | v2 (Current)                                                                 |
|----------------------------|----------------------------------------|-------------------------------------------------------------------------------|
| **Endpoint Structure**     | Single endpoint for all requests       | Dedicated endpoint for each request, improving clarity and maintainability     |
| **Security**               | Session ID-based security              | Additional access control checks and validations                              |
| **Real-Time Updates**      | Page polling                           | Server-Sent Events (SSE) for efficient, real-time client updates              |
| **Error Handling**         | Minimal error information              | Detailed error responses for easier debugging                                 |
| **Code Organization**      | Reused code scattered                  | Common logic refactored into shared functions for easier maintenance          |
| **Project Layout**         | Less structured                        | Improved directory and file structure for easier navigation                   |



## API Reference

- [User API Documentation](user/README.md)
- [Spotify API Documentation](spotify/README.md)

---

For additional details, see the main [House Party README](../../README.md).