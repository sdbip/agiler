import { esbuildPlugin } from '@web/dev-server-esbuild'
import { dotReporter } from '@web/test-runner'

export default {
  files: [
    '**/*.test.ts',
    '!node_modules/',
  ],
  reporters: [ dotReporter() ],
  plugins: [ esbuildPlugin({ ts: true }) ],
}
