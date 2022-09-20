import { assert, expect } from 'chai'
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
      const newTask = new Task('Make PGTaskRepository work')
      await repo.add(newTask)
      const completedTask = new Task('Completed Task')
      completedTask.complete()
      await repo.add(completedTask)

      assert.ok(await repo.get(newTask.id))
      assert.ok(await repo.get(completedTask.id))
      const newTasks = await repo.getNew()

      assert.ok(newTasks)
      expect(newTasks.map(t => t.id)).contain(newTask.id)
      expect(newTasks.map(t => t.id)).not.contain(completedTask.id)
    } finally {
      await repo.close()
    }
  })
})
