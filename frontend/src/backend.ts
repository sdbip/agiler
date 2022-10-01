const baseURL = 'http://localhost:8000'

export const fetchTasks = async () => {
  const response = await fetch(`${baseURL}/task`)
  return await response.json()
}

export const completeTask = (id: string)  =>{
  console.log(`PATCH ${baseURL}/task/${id}/complete`)
}

export const addTask = (title: string) => {
  console.log(`POST ${baseURL}/task  body: {"title":"${title}"}`)
}
