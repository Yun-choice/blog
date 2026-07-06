import { FilePath, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"

/**
 * Copies root-level static files (e.g. robots.txt) that must be served
 * from the site root but don't belong under quartz/static, which only
 * mirrors into /static.
 */
const ROOT_FILES = ["robots.txt"]

export const StaticRoot: QuartzEmitterPlugin = () => ({
  name: "StaticRoot",
  async *emit({ argv }) {
    for (const file of ROOT_FILES) {
      const src = joinSegments(process.cwd(), file) as FilePath
      if (!fs.existsSync(src)) continue
      const dest = joinSegments(argv.output, file) as FilePath
      await fs.promises.copyFile(src, dest)
      yield dest
    }
  },
  async *partialEmit() {},
})
