# edstem-mcp

MCP server for [Ed Discussion](https://edstem.org) — expose Ed's full API to Claude and other MCP clients.

## Local stdio setup

```bash
bun install
bun run build
```

Set your API token (get one at https://edstem.org/us/settings/api-tokens):

```bash
export ED_API_TOKEN=your_token
export ED_REGION=us  # optional: us (default), au, etc.
```

By default the server runs over stdio:

```bash
bun run start
```

## HTTP mode

The server can also run as a remote MCP server over Streamable HTTP.

```bash
MCP_TRANSPORT=http PORT=8080 bun run start
```

In HTTP mode, you can authenticate either by:

- sending `Authorization: Bearer <ED_API_TOKEN>` on each request
- or setting `ED_API_TOKEN` as a fallback environment variable

Set `ED_READ_ONLY=true` to disable all mutating tools like posting, editing, endorsing, locking, or uploading.

Health check:

```bash
curl http://localhost:8080/health
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The compose service exposes port `8080` internally to the compose network only.

Then connect another container or reverse proxy to:

```text
http://edstem-mcp:8080/mcp
```

Use your Ed API token as the bearer token for that MCP server.

## Claude Code

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "edstem": {
      "command": "node",
      "args": ["/path/to/edstem-mcp/dist/index.js"],
      "env": {
        "ED_API_TOKEN": "your_token"
      }
    }
  }
}
```

## Remote MCP example

Example request shape for an HTTP client:

```bash
curl \
  -H "Authorization: Bearer YOUR_ED_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"example","version":"1.0.0"}}}' \
  http://localhost:8080/mcp
```

## Tools (22)

| Tool | Description |
|------|-------------|
| `get_user` | Get authenticated user info and enrolled courses |
| `list_threads` | List threads in a course (sortable, paginated) |
| `get_thread` | Get thread by global ID with comments |
| `get_course_thread` | Get thread by course-local number (the # in the UI) |
| `search_threads` | Search threads by title, content, or category |
| `post_thread` | Create a new thread (supports markdown input) |
| `edit_thread` | Edit an existing thread |
| `lock_thread` | Lock a thread |
| `unlock_thread` | Unlock a thread |
| `pin_thread` | Pin a thread |
| `unpin_thread` | Unpin a thread |
| `endorse_thread` | Endorse a thread |
| `unendorse_thread` | Remove thread endorsement |
| `star_thread` | Star/bookmark a thread |
| `unstar_thread` | Remove star |
| `post_comment` | Post a comment or answer on a thread |
| `reply_to_comment` | Reply to an existing comment |
| `endorse_comment` | Endorse a comment |
| `unendorse_comment` | Remove comment endorsement |
| `accept_answer` | Accept a comment as the answer |
| `list_users` | List course roster (staff/admin) |
| `list_user_activity` | List a user's threads and comments |
| `upload_file_from_url` | Upload a file to Ed from a URL |
| `format_content` | Preview markdown to Ed XML conversion |

## Resources (2)

| Resource | URI | Description |
|----------|-----|-------------|
| User Info | `edstem://user` | Authenticated user details |
| Courses | `edstem://courses` | Enrolled courses list |

## Prompts (3)

| Prompt | Description |
|--------|-------------|
| `check_assignment` | Look up assignment details, requirements, and staff clarifications |
| `unanswered_questions` | List unresolved questions in a course |
| `my_activity` | Show your recent posts and comments in a course |

## Content Format

Thread and comment content uses Ed's XML document format. This server **auto-converts markdown to Ed XML**, so you can write content naturally:

```markdown
# Heading
**Bold** and *italic* text with `inline code`

- Bullet list
- Items

1. Numbered
2. List

> [!info] This becomes an Ed callout
```

Pass raw Ed XML (starting with `<document`) to bypass conversion.

## Testing

```bash
npm test
```

Uses Node's built-in test runner (`node:test`). Tests cover the markdown-to-XML content converter and API client (URL construction, headers, error handling).
