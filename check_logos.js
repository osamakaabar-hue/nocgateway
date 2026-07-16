const https = require('https');
const urls = [
  "https://noc.ly/en/wp-content/themes/yootheme/cache/1f/nwd-1f4fbe7f.png",
  "https://noc.ly/en/wp-content/themes/yootheme/cache/13/download-138faaa5.webp",
  "https://noc.ly/en/wp-content/themes/yootheme/cache/d4/nwd-d46439a1.webp",
  "https://noc.ly/en/companies-subsidiaries/en/wp-content/themes/yootheme/cache/1a/logo-1ab49280.webp",
  "https://noc.ly/en/wp-content/uploads/2023/08/Mabruk-Oil-Operations.svg",
  "https://noc.ly/en/wp-content/uploads/2023/08/Arabian-Gulf-Oil-Company.svg",
  "https://noc.ly/en/wp-content/uploads/2023/11/nafusa-logo.svg",
  "https://noc.ly/en/wp-content/uploads/2023/11/murzuq-logo.svg"
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(url, res.statusCode, res.headers['content-type'], res.headers['content-length']);
  }).on('error', (e) => {
    console.error(e);
  });
});
