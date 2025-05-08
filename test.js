```js
app.get('/search', (req, res) => {
    const query = req.query.q;
    const safeQuery = encodeURIComponent(query);
    res.send(`
      <h1>Search Results for: ${safeQuery}</h1>
      <div id="results">...</div>
    `);
});
```