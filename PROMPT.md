Start a new task.

You have access to a file called swagger.json in the root of the project.

Goal:
Implement ONLY authentication (login) and user profile using the real backend API defined in swagger.json.

Step 1: Analysis (VERY IMPORTANT)
- Read swagger.json carefully
- Identify the correct login endpoint
- Identify the request body structure (fields like username/email/password)
- Identify the response structure
- Extract the token field name (e.g. accessToken, token, etc.)
- Identify the endpoint to get the current logged-in user profile

Do NOT guess anything. Use only swagger.json.

Print a clear summary of:
- login endpoint
- request body
- response structure
- token field
- profile endpoint

Wait for confirmation before coding.

--------------------------------------------------

Step 2: Implementation (after confirmation)

Create the following:

1. services/auth.service.ts
- login function
- send request to real login endpoint
- handle errors
- store token securely (use Expo SecureStore or AsyncStorage)

2. services/user.service.ts
- get current user profile using token
- attach Authorization header properly

3. Update Login Screen
- connect form to login API
- show loading state
- show error message
- on success:
  - save token
  - navigate to profile screen

4. Update Profile Screen
- fetch user data from backend
- display user info (name, email, etc.)
- handle loading state

--------------------------------------------------

Rules:
- Use only swagger.json
- Do NOT create fake endpoints
- Keep API logic inside services/
- Use clean, modular code
- Work step by step
- Do not implement anything extra beyond login and profile