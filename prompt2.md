Start a new task.

You have access to swagger.json in the root of the project.

Goal:
Redesign and extend the mobile app so that after login it becomes a modern training app with a premium UI inspired by Viora.

Use swagger.json only to discover the real training-related endpoints and data structures.
Do not guess endpoints or field names.

Main requirements:

1. Authentication flow
- Keep the existing login flow working
- After successful login, navigate into the main app experience

2. Main app structure after login
Create a modern app structure with these main pages:

A. Home page
- This should be the main landing page after login
- If the trainee currently has an active/current training, show the current training first and prominently
- If there is no current training, show available trainings for the trainee
- If there are no trainee-specific trainings, show general/public courses
- The home page should feel modern, premium, and elegant

B. Completed Trainings page
- Show the trainings/courses the trainee has already completed
- Display them in a clean and modern way
- Include useful details such as training title, status, date, progress, certificate availability if available from the API

C. Profile page
- Create a dedicated profile page
- Use the real profile response structure already integrated
- Show full name, role, email, gender, birth date, governorate, avatar, and other available fields
- Keep it RTL-friendly and polished

3. Training data
Using swagger.json:
- identify endpoints related to:
  - current training
  - available trainings
  - general/public courses
  - completed trainings / training history
- analyze the real response structures
- implement the screens based on the real API
- if multiple endpoints are relevant, organize them properly in services

4. UI/UX direction
Design style:
- inspired by Viora
- modern, elegant, premium
- soft spacing
- refined typography
- beautiful cards
- clean RTL layout
- dark or luxury modern theme is acceptable if done tastefully
- professional mobile-first UX
- smooth hierarchy and clear navigation

5. App navigation
Create a clean post-login navigation structure, for example:
- Home
- Completed Trainings
- Profile

Use Expo Router properly with file-based routing.

6. Home page logic
The post-login home page should prioritize in this order:
- current active training if exists
- otherwise trainings available for the trainee
- otherwise general/public trainings

Make this logic explicit in code and UI.

7. Implementation requirements
- Use TypeScript
- Use reusable components
- Keep API logic in services/
- Keep code modular and clean
- Use swagger.json only for endpoint and schema discovery
- Do not invent API field names
- Handle null/empty states nicely
- Handle loading and error states professionally

8. Work process
Step 1:
- analyze swagger.json
- identify all relevant training endpoints
- summarize:
  - current training endpoint
  - available trainings endpoint
  - public/general trainings endpoint
  - completed trainings endpoint
  - key response fields for each

Step 2:
- propose the screen structure and navigation

Step 3:
- implement services and screens step by step

Important:
- Do not start coding before first presenting the endpoint analysis and proposed structure
- Do not guess anything not present in swagger.json
- Keep the design visually premium and close in spirit to Viora