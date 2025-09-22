/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://saku-store.vercel.app',
  generateRobotsTxt: true,
  exclude: [
    '/admin/*',
    '/auth/*',
    '/api/*',
    '/checkout/failure',
    '/checkout/pending',
    '/checkout/success'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/auth/', '/api/']
      }
    ]
  }
}