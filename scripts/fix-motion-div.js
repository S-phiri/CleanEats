const fs = require('fs')
const path = process.argv[2]
let c = fs.readFileSync(path, 'utf8')
if (!c.includes('framer-motion')) {
  c = c.replace(/<\/?motion\.motion.div/g, (t) => t.replace('motion.div', 'div'))
  c = c.replace(/<\/?motion\.div/g, (t) => t.replace('motion.div', 'motion.div'))
  c = c.replace(/motion\.div/g, 'div')
}
// Remove legacy meals block in PlanViewClient
if (path.includes('PlanViewClient')) {
  c = c.replace(/\s*\{false && tab === 'meals_legacy'[\s\S]*?\}\)\}\s*<\/div>\s*\)\}\s*\n/, '\n')
}
fs.writeFileSync(path, c)
console.log('fixed', path)
