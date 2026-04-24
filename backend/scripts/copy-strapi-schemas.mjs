import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const sourceRoot = path.join(root, 'src')
const distRoot = path.join(root, 'dist', 'src')

async function copyJsonFiles(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name)

      if (entry.isDirectory()) {
        await copyJsonFiles(sourcePath)
        return
      }

      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        return
      }

      const relativePath = path.relative(sourceRoot, sourcePath)
      const targetPath = path.join(distRoot, relativePath)

      await mkdir(path.dirname(targetPath), { recursive: true })
      await copyFile(sourcePath, targetPath)
    })
  )
}

await rm(distRoot, { recursive: true, force: true })
await copyJsonFiles(sourceRoot)
