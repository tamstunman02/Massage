import fs from 'node:fs'

const path = 'src/App.vue'
let t = fs.readFileSync(path, 'utf8')
const before = t

t = t.replace(
  /<i\s+([^>]*?)class="fa-(?:solid|regular)\s+fa-([a-z0-9-]+)(?:\s+fa-fw)?"([^>]*)><\/i>/g,
  (_, pre, name, rest) => {
    const all = `${pre} ${rest}`
    const title = (all.match(/title="([^"]*)"/) || [])[1]
    return title ? `<AppIcon name="${name}" title="${title}" />` : `<AppIcon name="${name}" />`
  },
)

t = t.replace(
  /<i\s+v-if="([^"]+)"\s+class="fa-(?:solid|regular)\s+fa-([a-z0-9-]+)"([^>]*)><\/i>/g,
  (_, vif, name) => `<AppIcon v-if="${vif}" name="${name}" />`,
)

t = t.replace(
  /<i\s+:class="favorites\.includes\(([^)]+)\) \? 'fa-solid fa-heart' : 'fa-regular fa-heart'"([^>]*)><\/i>/g,
  '<AppIcon name="heart" />',
)

if (t === before) {
  console.log('No replacements made')
  process.exit(1)
}

fs.writeFileSync(path, t)
const left = (t.match(/fa-(solid|regular)/g) || []).length
console.log('Replaced FA tags. Remaining fa-solid/regular:', left)
