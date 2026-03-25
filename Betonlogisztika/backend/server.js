const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Szerver fut a ${PORT}-es porton`);
  console.log(`🔗 http://localhost:${PORT}`);
});