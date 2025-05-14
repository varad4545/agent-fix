app.get('/search', (req, res) => {
    const query = req.query.q;
    res.send(`
      <h1>Search Results for: ${escape(query)}</h1>
      <div id="results">...</div>
    `);
  });

function escape(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}