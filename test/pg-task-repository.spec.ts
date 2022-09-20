import { assert } from 'chai'
import { Task } from '../src/domain/task'
import { connect } from '../src/pg-task-repository'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const database = process.env['TEST_DATABASE_NAME']!

describe('PGTaskRepository', () => {
  it('has environment', () => {
    assert.ok(database, 'The environment variable TEST_DATABASE_NAME must be set')
  })

  it('works', async () => {
    const repo = await connect(database)

    try {
      const task = new Task('Make PGTaskRepository work')

      await repo.add(task)
      assert.ok(await repo.get(task.id))
      assert.ok(await repo.getAll())
    } finally {
      await repo.close()
    }
  })
})
