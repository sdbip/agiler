const baseURL = 'http://localhost:8000'

export const fetchTasks = async () => {
  const response = await fetch(`${baseURL}/task`)
  return await response.json()
}

export const completeTask = async (id: string)  =>{
  console.log(`PATCH ${baseURL}/task/${id}/complete`)

  await fetch(`${baseURL}/task/${id}/complete`, { method: 'PATCH' })
  console.log('completeTask done')
}

export const addTask = async (title: string) => {
  console.log(`POST ${baseURL}/task  body: {"title":"${title}"}`)

  const response = await fetch(`${baseURL}/task`, {
    method: 'POST',
    body: JSON.stringify({ title }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
  })
  return await response.json()
}