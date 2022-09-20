import { assert } from 'chai'
import { Task } from '../src/domain/task'
import { connect } from '../src/pg-task-repository'

describe('PGTaskRepository', () => {
  it('works', async () => {
    const repo = await connect('es_test')
    const task = new Task('Make PGTaskRepository work')

    await repo.add(task)
    assert.ok(await repo.get(task.id))
    assert.ok(await repo.getAll())

      await repo.close()
  })
})
