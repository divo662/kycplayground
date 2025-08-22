Verification System Overview (Lightweight, Production-lean)

Purpose
This document explains what the current verification flow does, how it is structured, how to integrate it, and how to test it. It is intentionally lightweight and designed to work without third‑party AI dependencies. Optional AI enrichment is supported and can be enabled via environment variables.

Key Outcomes
- Hosted verify page with three input modes: document upload, face photo, liveness video.
- Files are stored in Appwrite Storage and linked to a verification session.
- A processing endpoint enforces minimum requirements and produces verification results.
- Results include: counts, pixel‑based image quality flags, MRZ fields (when available), a basic liveness heuristic, simple country rules validation, and mock AI summaries. Optional Groq Vision image QA is supported but not required.

Core Files
- app/verify/[sessionId]/page.tsx: Hosted verification page (document/face/liveness). Mobile friendly. Camera permission on user action, front camera by default.
- app/api/verifications/create/route.ts: Creates a verification session and returns redirectUrl.
- app/api/verifications/[sessionId]/route.ts: Fetches a session.
- app/api/verifications/[sessionId]/update/route.ts: Updates a session and triggers webhook on completion.
- app/api/verifications/[sessionId]/process/route.ts: Main processing pipeline (see below).
- lib/file-upload-service.ts: Uploads files to Appwrite Storage and creates DB records. Session‑aware method: uploadFileForSession.
- components/ui/camera-capture.tsx: Camera capture for photo/video with liveness prompts.
- lib/image-quality.ts: Pixel‑based image quality analysis (blur/brightness/contrast/crop) using sharp.
- lib/video-liveness.ts: Basic liveness heuristic (size‑based) for short videos.
- lib/country-rules.ts: Country/document rules and validator (small seed set).
- lib/vision-groq.ts: Optional Groq Vision QA (JSON) if configured.

Environment Variables
Required (Appwrite and app base):
- NEXT_PUBLIC_APP_URL: Your app base URL (e.g., http://localhost:3000)
- Appwrite variables as already used in the project (endpoint, project id, database, collections, bucket)

Optional (AI enrichment):
- GROQ_API_KEY: If set, and GROQ_VISION_MODEL is vision‑capable, the system calls Groq Vision to get blur/glare/crop JSON. If unset, pixel QA still runs.
- GROQ_VISION_MODEL: e.g., llama-4-vision. If you use a text‑only model, the image call is skipped automatically.
- GROQ_API_BASE: Defaults to https://api.groq.com/openai/v1

Frontend Flow (app/verify/[sessionId]/page.tsx)
1) User lands on /verify/{sessionId}. Page fetches session.
2) User picks input method: Document, Face Photo, or Face Video.
3) For document: drag and drop or browse files (JPG/PNG/PDF). Inline validation for size/type/duplicate.
4) For face photo/video: camera permission requested on button tap; front camera by default. Video shows timed prompts (look straight / turn left / turn right / blink / smile).
5) On Start, files are uploaded via uploadFileForSession (documentType set to id_document, face_photo, face_video). The page calls the process endpoint.
6) On success, a redirecting modal shows and the user is sent to returnUrl.

Processing Pipeline (app/api/verifications/[sessionId]/process/route.ts)
Inputs: sessionId. Looks up all files linked to the session.
Steps:
- Requirement check: at least one id_document AND at least one face (face_photo or face_video).
- Mock AI summaries: runs the mock processor to fill OCR/document/face/liveness placeholders.
- MRZ parsing: attempts to parse TD3 (passport) and TD1 (ID) MRZ fields from OCR text when available.
- Pixel QA: sharp‑based blur (Laplacian variance), brightness, contrast, and border/crop heuristic.
- Optional Groq Vision: if GROQ_API_KEY is set and the model is vision‑capable, merges JSON flags (blurLikely, glareLikely, cropLikely).
- Video liveness heuristic: checks HEAD content-length for the liveness video. If larger than a small threshold, marks motionLikely true (placeholder until ffmpeg frame‑diff is added).
- Country rules: validates required fields for selected countries (seeded with USA/CAN for passport/driver license). Uses MRZ nationality when available.
- Completion: if requirements and basic QA thresholds are satisfied, sets status=completed; otherwise status=failed. Calls the update endpoint to persist and trigger webhook.
Outputs: JSON with status, counts, quality, mrz, liveness, countryValidation, and AI summaries.

API Endpoints
POST /api/verifications/create
- Body: { webhookUrl, returnUrl, options }
- Response: { success, sessionId, verificationId, redirectUrl }

GET /api/verifications/{sessionId}
- Fetches a session.

PUT /api/verifications/{sessionId}/update
- Body: { status, results, webhookUrl? }
- Persists updates; triggers webhook if status is completed and webhookUrl present.

POST /api/verifications/{sessionId}/process
- Runs full processing pipeline described above and updates the session.

Webhook Behavior
- On completion, the update endpoint sends a POST to your webhookUrl with: { sessionId, status, results, completedAt, verificationId }.
- Add your own signature verification if needed (next section outlines suggested hardening).

File Model Notes
- Files are saved to Appwrite Storage. Database records include metadata with: sessionId and documentType (id_document | face_photo | face_video).
- The process endpoint finds session files by searching metadata for sessionId.

How To Test End‑to‑End
1) Ensure env is set (NEXT_PUBLIC_APP_URL, Appwrite). Leave GROQ_API_KEY empty for pixel QA only.
2) npm i sharp
3) npm run dev
4) Create session via POST /api/verifications/create and open redirectUrl.
5) Test cases:
   - Fail case: upload only a document → Start → should fail with requirements message.
   - Pass case: document + face photo → Start → should complete and redirect.
   - Pass case: document + liveness video → Start → should complete and redirect.
6) Check DB and webhook logs for status/results.

Recent Fixes Applied
- Fixed camera permissions policy violation by updating security headers middleware
- Fixed missing "type" attribute error in document creation by adding required field
- Fixed database query issue by changing from metadata search to sessionId field search
- Added retry button and proper error handling for failed verifications
- Enhanced mobile responsiveness and camera permission handling

Recommended Hardening (lightweight next steps)
- Webhook signing + idempotency: HMAC header, replay guard on your server.
- Frame‑diff liveness (ffmpeg): replace HEAD size heuristic with motion scoring; fallback to current heuristic if ffmpeg missing.
- MRZ and PDF extraction: add a robust MRZ library and convert first PDF page to image before OCR/QA.
- Face match (vendor or self‑hosted): compare selfie to ID face crop.
- Doc‑type classification: simple heuristic plus optional model/text classification.
- Scoring rubric: single verificationScore and reasons[] for integrators; thresholds configurable via env.

Operational Notes
- If GROQ vision is not configured, the flow still works with pixel QA only.
- Camera capture is permission‑gated and mobile‑friendly (front camera by default).
- The system stores minimal PII in on‑screen UI; only operational metadata is displayed.

Ownership and Extensibility
- All logic is local to the repo and Appwrite. External AI is optional.
- Each piece (MRZ, QA, liveness, rules) can be independently improved without breaking the flow.


