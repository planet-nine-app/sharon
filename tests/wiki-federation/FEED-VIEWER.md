# Federated Wiki Feed Viewer

A simple web-based tool to test and visualize all four Cani* feeds across your federated wiki network.

## Quick Start

1. **Start your federation:**
   ```bash
   ./start-federation.sh
   ```

2. **Open the feed viewer:**
   ```bash
   open feed-viewer.html
   # Or just double-click feed-viewer.html in Finder
   ```

3. **Test your feeds:**
   - Select a wiki (Alice, Bob, or Carol)
   - Click individual feed buttons or "Fetch All Feeds"
   - See the results displayed in real-time

## Features

### 🌐 Multi-Wiki Support
- Switch between Alice's wiki (3001), Bob's wiki (3002), and Carol's wiki (3003)
- Test the same feeds across different nodes
- Compare feed content between wikis

### 🔄 All Four Cani* Feeds
- **🎵 Canimus** - Music feed from Mutopia plugin (RSS/XML)
- **📚 Canipub** - Books feed from Books plugin (JSON)
- **📝 Caniblog** - Blog posts feed from Blogs plugin (JSON)
- **🍳 Canicook** - Recipes feed from Recipes plugin (JSON)

### 📊 Feed Statistics
For each feed, you'll see:
- ✅ Success/Error status
- 📦 Number of items in feed
- ⏱️ Load time (milliseconds)
- 🔗 Content type (JSON/XML/RSS)
- 📍 Endpoint URL

### 🎨 Visual Interface
- Clean, modern design with color-coded status indicators
- Syntax-highlighted JSON/XML output
- Scrollable content areas
- Responsive grid layout

## How It Works

The feed viewer makes HTTP requests to each wiki's plugin endpoints:

**Canimus (Music):**
- Primary: `/plugin/mutopia/feed`
- Fallback: `/plugin/mutopia/library`

**Canipub (Books):**
- Primary: `/plugin/books/feed`
- Fallback: `/plugin/books/library`

**Caniblog (Blogs):**
- Primary: `/plugin/blogs/feed`
- Fallback: `/plugin/blogs/posts`

**Canicook (Recipes):**
- Primary: `/plugin/recipes/feed`
- Fallback: `/plugin/recipes/recipes`

## Testing Scenarios

### 1. Verify All Plugins Loaded
```
Select: Alice's Wiki
Click: "Fetch All Feeds"
Expected: All 4 feeds return data (or empty arrays if no content)
```

### 2. Test Federation Across Nodes
```
Select: Alice's Wiki → Fetch All Feeds
Select: Bob's Wiki → Fetch All Feeds
Select: Carol's Wiki → Fetch All Feeds
Expected: All wikis have all plugins available
```

### 3. Test Individual Feed Formats
```
Click: "Fetch Canimus"
Check: Should return RSS/XML format
Expected: <rss> or <feed> tags visible

Click: "Fetch Canipub"
Check: Should return JSON format
Expected: {"books": [...]} structure
```

### 4. Verify Feed Content
```
After uploading content to a wiki:
Click: Relevant feed button
Expected: See your uploaded content in the feed
```

## Expected Results

### Fresh Wiki (No Content)
When wikis are freshly started with no uploaded content:

**Canimus:**
```xml
<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Music Feed</title>
    <item/>
  </channel>
</rss>
```

**Canipub:**
```json
{
  "books": []
}
```

**Caniblog:**
```json
{
  "posts": []
}
```

**Canicook:**
```json
{
  "recipes": []
}
```

### With Content
After uploading music/books/blogs/recipes, you should see:
- Non-empty arrays
- Full metadata for each item
- Proper feed format (RSS for music, JSON for others)

## Troubleshooting

### Feed Returns 401 Unauthorized
This is expected! Most feeds are protected and require authentication. The viewer shows you:
- ✅ Plugin is loaded and responding
- ⚠️ Authentication is required to access content
- 📍 Endpoint URL is correct

### Feed Returns 404 Not Found
Possible causes:
- Plugin not installed correctly
- Endpoint path incorrect
- Service not started yet

**Fix:**
```bash
./stop-federation.sh --clean
./start-federation.sh --setup --build
```

### Feed Returns 503 Service Unavailable
The plugin is loaded but the backend service might not be running.

**Check:**
- Sanora service status
- Plugin initialization logs
- Docker container health

### CORS Errors in Console
If you see CORS errors, the wikis need CORS headers configured. For testing, you can:
1. Use a CORS-disabled browser
2. Add CORS middleware to wiki plugins
3. Use the browser's dev tools to inspect raw responses

## Example Output

**Successful Canipub Fetch:**
```
Status: ✅ Success
Items: 3
Load Time: 145ms
Type: application/json

{
  "books": [
    {
      "title": "Example Book",
      "author": "Alice Smith",
      "isbn": "978-1234567890",
      "format": "epub"
    }
  ]
}
```

## Advanced Usage

### Browser Console
Open browser dev tools (F12) to see:
- Network requests to wiki endpoints
- Response headers
- Detailed error messages
- Request/response timing

### Custom Wiki URLs
Edit the HTML file to test against different wiki deployments:
```javascript
// In feed-viewer.html, modify:
<button class="wiki-btn" data-url="http://your-wiki-url:port">
```

### Automated Testing
Use the viewer as a visual complement to automated tests:
```bash
# Terminal 1: Run tests
npm run test:federation

# Terminal 2: Visual verification
open feed-viewer.html
```

## Integration with Federation Tests

The feed viewer tests the same endpoints as the automated test suite:
- **Automated:** `federation-tests.test.js` verifies endpoints respond
- **Visual:** `feed-viewer.html` shows you what data they return

Use both together for complete testing:
1. Run automated tests to verify setup
2. Use feed viewer to inspect actual feed content
3. Verify feeds work across all wiki nodes

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires JavaScript enabled (uses Fetch API).

## Future Enhancements

Potential additions:
- [ ] Save favorite wiki configurations
- [ ] Export feed data to JSON/CSV
- [ ] Feed diff viewer (compare across wikis)
- [ ] Real-time feed updates
- [ ] Authentication support
- [ ] Feed validation
- [ ] Performance benchmarking

---

**Part of The Advancement** - Testing tools for federated wiki 💚

**Quick Test:** `./start-federation.sh && open feed-viewer.html`
