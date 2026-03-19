# Email Trigger (Inbound Webhook)

MVP: trigger a workflow by sending a POST request with email-like payload. Supports direct JSON (for curl/Postman) and **Postmark** inbound webhook.

---

## 1. Direct endpoint (testing with curl / Postman)

Use this when testing manually; body is our internal format.

### Endpoint

```
POST /api/triggers/email/:workflowId
Content-Type: application/json
```

### Request body (all fields optional)

| Field    | Type   | Description        |
|----------|--------|--------------------|
| `from`   | string | Sender email       |
| `to`     | string | Recipient          |
| `subject`| string | Subject line       |
| `text`   | string | Plain text body    |
| `html`   | string | HTML body          |

### Example: curl

Replace `WORKFLOW_ID` with a real workflow UUID that has an **email** trigger node.

```bash
curl -X POST "http://localhost:3001/api/triggers/email/WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{"from":"alice@example.com","to":"inbox@you.com","subject":"Order #123","text":"Plain body","html":"<p>HTML body</p>"}'
```

### Postman

1. Method: **POST**.
2. URL: `http://localhost:3001/api/triggers/email/<workflow-id>`.
3. Headers: `Content-Type: application/json`.
4. Body (raw JSON):
   ```json
   {
     "from": "alice@example.com",
     "to": "inbox@you.com",
     "subject": "Test",
     "text": "Hello",
     "html": "<p>Hello</p>"
   }
   ```

---

## 2. Postmark inbound webhook (real provider)

Use this when Postmark sends inbound email to your app. The server maps Postmark JSON to the same internal format and runs the same trigger logic.

### Endpoint

```
POST /api/triggers/email/postmark/:workflowId
Content-Type: application/json
```

- **workflowId** — UUID of the workflow that has an email trigger. One Postmark Inbound Stream = one webhook URL, so use one workflow per stream (or put workflowId in the URL when configuring Postmark).

### How to connect Postmark

1. **Account and server**  
   Sign up at [postmarkapp.com](https://postmarkapp.com), create a Server, and set up an **Inbound** message stream.

2. **Inbound address**  
   In the Inbound stream settings you get an address like `yourhash@inbound.postmarkapp.com` (or use [Inbound Domain Forwarding](https://postmarkapp.com/developer/user-guide/inbound/inbound-domain-forwarding) for your own domain).

3. **Webhook URL**  
   Set the inbound webhook URL to your API:

   ```
   https://your-api.example.com/api/triggers/email/postmark/<WORKFLOW_ID>
   ```

   If you use the optional secret (see below), append it:

   ```
   https://your-api.example.com/api/triggers/email/postmark/<WORKFLOW_ID>?secret=YOUR_SECRET
   ```

4. **Optional: webhook secret**  
   Postmark does **not** sign inbound webhooks. To protect the endpoint you can:
   - Set env **`POSTMARK_INBOUND_SECRET`** to a random string.
   - Then either pass it in the URL: `?secret=YOUR_SECRET`, or send header **`X-Postmark-Inbound-Secret: YOUR_SECRET`**.  
   If the env is set and the request does not match → **403** "Invalid or missing webhook secret".

### Mapping (adapter)

Postmark sends a different JSON shape. We map it to our internal format:

| Postmark field | Internal field |
|----------------|----------------|
| `From` (or `FromFull.Email`) | `from` |
| `To` or first `ToFull[].Email` | `to` |
| `Subject` | `subject` |
| `TextBody` | `text` |
| `HtmlBody` | `html` |

After mapping, the same filters (from, subject) and queue logic apply as for the direct endpoint.

### Example: real Postmark inbound payload

This is the kind of JSON Postmark POSTs to your webhook (relevant fields):

```json
{
  "FromName": "Postmarkapp Support",
  "From": "support@postmarkapp.com",
  "FromFull": {
    "Email": "support@postmarkapp.com",
    "Name": "Postmarkapp Support",
    "MailboxHash": ""
  },
  "To": "\"Firstname Lastname\" <yourhash+SampleHash@inbound.postmarkapp.com>",
  "ToFull": [
    {
      "Email": "yourhash+SampleHash@inbound.postmarkapp.com",
      "Name": "Firstname Lastname",
      "MailboxHash": "SampleHash"
    }
  ],
  "Subject": "Test subject",
  "MessageID": "73e6d360-66eb-11e1-8e72-a8904824019b",
  "ReplyTo": "replyto@postmarkapp.com",
  "MailboxHash": "SampleHash",
  "Date": "Fri, 1 Aug 2014 16:45:32 -04:00",
  "TextBody": "This is a test text body.",
  "HtmlBody": "<html><body><p>This is a test html body.</p></body></html>",
  "StrippedTextReply": "This is the reply text",
  "Tag": "TestTag",
  "Headers": [
    { "Name": "X-Spam-Status", "Value": "No" },
    { "Name": "X-Spam-Score", "Value": "-0.1" }
  ],
  "Attachments": []
}
```

### Testing Postmark with curl

Simulate Postmark’s request (replace `WORKFLOW_ID` and optionally `?secret=...`):

```bash
curl -X POST "http://localhost:3001/api/triggers/email/postmark/WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "From": "support@postmarkapp.com",
    "To": "you@inbound.postmarkapp.com",
    "ToFull": [{"Email": "you@inbound.postmarkapp.com","Name": "You","MailboxHash": ""}],
    "Subject": "Test subject",
    "TextBody": "This is a test text body.",
    "HtmlBody": "<html><body><p>Test html.</p></body></html>"
  }'
```

---

## Behaviour (both endpoints)

1. Load the workflow and find the trigger node with `type === 'email'`.
2. If the workflow has no email trigger → **400** "Workflow does not have an email trigger".
3. If workflow is paused → **423** "Workflow is paused".
4. Apply filters from the email trigger config:
   - **From filter** (`config.from`): if set, request `from` must match (case-insensitive). Otherwise → **200** `{ "skipped": true, "reason": "from_filter" }`.
   - **Subject contains** (`config.subjectFilter`): if set, request `subject` must contain this string (case-insensitive). Otherwise → **200** `{ "skipped": true, "reason": "subject_filter" }`.
5. If filters pass → create execution with `triggerType: 'email'`, enqueue job, return **202** `{ "executionId": "...", "status": "queued" }`.

### Response summary

- **202** + `{"executionId":"...","status":"queued"}` — execution was queued.
- **200** + `{"skipped":true,"reason":"from_filter"}` or `"subject_filter"` — filters did not match; no execution.
- **400** — invalid workflow id, invalid body, or workflow has no email trigger.
- **403** — (Postmark endpoint only) invalid or missing webhook secret when `POSTMARK_INBOUND_SECRET` is set.
- **404** — workflow not found.
- **423** — workflow is paused.
- **503** — queue unavailable.
