const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dmc0prejr',
  api_key: '191597999397877',
  api_secret: '3oENQokNSdMK5VPZIGwIqb7QzvM'
});

module.exports = cloudinary;