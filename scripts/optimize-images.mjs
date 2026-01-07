import sharp from 'sharp'
import { readdir, stat, mkdir } from 'fs/promises'
import { join, parse } from 'path'

const INPUT_DIR = './public/images/hero'
const OUTPUT_DIR = './public/images/hero-optimized'

async function optimizeImages() {
  // 出力ディレクトリ作成
  await mkdir(OUTPUT_DIR, { recursive: true })

  const files = await readdir(INPUT_DIR)
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))

  console.log(`Found ${imageFiles.length} images to optimize\n`)

  for (const file of imageFiles) {
    const inputPath = join(INPUT_DIR, file)
    const { name } = parse(file)
    const outputPath = join(OUTPUT_DIR, `${name}.webp`)

    try {
      const inputStats = await stat(inputPath)
      const inputSize = inputStats.size

      await sharp(inputPath)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath)

      const outputStats = await stat(outputPath)
      const outputSize = outputStats.size
      const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1)

      console.log(`${file}`)
      console.log(`  ${(inputSize / 1024 / 1024).toFixed(2)}MB → ${(outputSize / 1024).toFixed(0)}KB (${reduction}% smaller)\n`)
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message)
    }
  }

  console.log('Done! Optimized images saved to:', OUTPUT_DIR)
}

optimizeImages()
