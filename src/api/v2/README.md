# v2 API Overview
The v2 API introduces several new features and enhancements over v1 to improve performance, scalability and security.

## improvements over v1
- **Separate Endpoints**: In v1 all API requests were handled by a single endpoint where as in v2 each request has its own endpoint which makes maintenance easier.
- **Enhanced Security**: v2 builds upon the session ID security implemented in v1 by adding further checks and validations to ensure access control.
- **Server Sent Events (SSE)**: v2 introduces support for Server Sent Events, to replace the page polling which was used in v1. This helps to reduce performance overhead and latency while also providing real-time updates to the users interface allowing for the website to handle more users than it could with v1.
- **Improved Error Handling**: v2 provided more detailed error responses to help with debugging so issues can be resolved faster than in v1 which didn't provide much information on errors.
- **Separated Functions**: More of the reused code throughout the API has been made into separate functions to help improve maintenance and to also allow for more of the codebase to be updated at once if a issue arises.
- **Layout**: The layout of the API has also been improved to make it easier to navigate and find specific endpoints or functions.

## API Documentation
- [House Party - User API Documentation](user/README.md)
- [House Party - User SSE API Documentation](user/sse/README.md)
---
- [House Party - Spotify API Documentation](spotify/README.md)