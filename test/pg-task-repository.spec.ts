import { assert, expect } from 'chai'
import { Task } from '../src/domain/task'
import { connect } from '../src/pg-task-repository'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const database = process.env['TEST_DATABASE_NAME']!

describe('PGTaskRepository', () => {
  it('has environment', () => {
    assert.ok(database, 'The environment variable TEST_DATABASE_NAME must be set')
  })

  it('can add tasks and find them again', async () => {
    const repo = await connect(database)

    try {
      const task = new Task('Make PGTaskRepository work')
      task.complete()
      await repo.add(task)

      const taskInRepository = await repo.get(task.id)
      expect(taskInRepository).instanceOf(Task)
      expect(taskInRepository?.id).to.equal(task.id)
      expect(taskInRepository?.isCompleted).to.equal(task.isCompleted)
      expect(taskInRepository?.title).to.equal(task.title)
    } finally {
      await repo.close()
    }
  })

  it('finds stored tasks', async () => {
    const repo = await connect(database)

    try {
      const task = new Task('Make PGTaskRepository work')
      await repo.add(task)

      const storedTasks = await repo.getNew()
      assert.ok(storedTasks)
      expect(storedTasks.map(t => t.id)).contain(task.id)
    } finally {
      await repo.close()
    }
  })

  it('ignores completed tasks', async () => {
    const repo = await connect(database)

    try {
      const task = new Task('Completed Task')
      task.complete()
      await repo.add(task)

      const storedTasks = await repo.getNew()
      assert.ok(storedTasks)
      expect(storedTasks.map(t => t.id)).not.contain(task.id)
    } finally {
      await repo.close()
    }
  })
})
