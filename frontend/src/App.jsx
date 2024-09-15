import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import './index.css';
import './App.css'
import axios from 'axios'

function App() {
  const [todo, setTodo] = useState('')
  const [submittedTodos, setSubmittedTodos] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isEditting, setIsEditting] = useState(false)
  const [isEditted, setIsEditted] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false) 
  const [suggestedTask, setSuggestedTask] = useState('')
  const handleChange = (e) => {
    setTodo(e.target.value)
  }
  useEffect(() => {
    let savedTodo = localStorage.getItem('todo')
    console.log(savedTodo)
    if(savedTodo) {
      setTodo(JSON.parse(savedTodo))
    }
    let savedSubmittedTodos = localStorage.getItem('submittedTodos')
    if (savedSubmittedTodos) {
      setSubmittedTodos(JSON.parse(savedSubmittedTodos))
      console.log(submittedTodos)
    }
  }, [])
  useEffect(() => {
    if(submittedTodos.length > 0)
    localStorage.setItem('submittedTodos', JSON.stringify(submittedTodos))
  }, [submittedTodos])
  useEffect(() => {
    if (todo) {
      localStorage.setItem('todo', JSON.stringify(todo)); // Save to local storage only when there's a value
    }
  }, [todo])
  const handleSubmit = (e) => {
    e.preventDefault()
    if(todo.trim() === '') return
    setIsSubmitted(true)
    if(isEditting) {
      const updatedTodos = submittedTodos.map((t, i) => editIndex === i ? {...t, text: todo} : t)
      setSubmittedTodos(updatedTodos)
      setEditIndex(null)
      setIsEditting(false)
    }
    else {
      setSubmittedTodos([...submittedTodos, {text: todo, completed: false}])
    }
    console.log(submittedTodos)
    setTodo('')
    localStorage.removeItem('todo')
  }
  useEffect(() => {
    console.log('Updated submittedTodos:', submittedTodos)
  }, [submittedTodos])
  const handleDelete = (indexToBeDeleted) => {
    const updatedTodos = submittedTodos.filter((t, i) => i !== indexToBeDeleted)
    setSubmittedTodos(updatedTodos)
  }
  const handleEdit = (indexToBeEdited) => {
    setIsEditting(true)
    setTodo(submittedTodos[indexToBeEdited].text)
    setEditIndex(indexToBeEdited)
  }
  
  const handleCheckboxChange = (index) => {
    const updatedTodos = submittedTodos.map((todo, i) => {
      if(i === index) {
        return {...todo, completed: !todo.completed}
      }
      return todo
    })
    setSubmittedTodos(updatedTodos)
  }
  const handleShowCompleted = () => {
    setShowCompleted(true)
  }
  const handleShowAllTasks = () => {
    setShowCompleted(false)
  }
  const tasksToDisplay = showCompleted ? 
    submittedTodos.filter((t, i) => t.completed) : submittedTodos

  const getSuggestedTask = async () => {
    try {
      const response = await fetch('http://localhost:3000/suggest-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskHistory: submittedTodos.map(t => t.text).join(','),
        })
      })
      console.log(response.data)
      const data = await response.json()
      setSuggestedTask(data.suggestion)
    } catch (error) {
      console.error('Error fetching suggestion: ', error)
    }
  }
  return (
    <div className='flex gap-40 min-h-screen shiny-background'> 
      
    <div className=''>
      <div className='border-2'>
      <h1 className='text-6xl w-full p-8 text-white font-extrabold tracking-wide'>AI Todo App</h1>
      <div className=' flex flex-col'>
        <h1 style={{ marginLeft: '20px' }} className='text-2xl  text-white p-2 font-medium'>{isEditting? "Update Todo" : "Add a Todo"}</h1>
        <form action="" onSubmit={handleSubmit}>
        <input style={{height: '15vh', width: '50vw', marginLeft: '20px' }} className='bg-zinc-200 border outline-none border-zinc-300 p-2 m-3 border-2 rounded-md text-xl' 
        type="text"
        name='name'
        value={todo} 
        onChange={handleChange}/>
        <br/>
        <button style={{ marginLeft: '20px' }} className='m-3 bg-black text-white p-2 rounded-md font-medium  w-32 h-10 '>{isEditting ? "Update Task": "Add Task"}</button>
        </form>
        </div>
      </div>
      <div style={{ marginLeft: '10px' }} className=' mt-5 p-2 flex text-2xl text-white font-semibold '>
        {!isEditting? 
         (tasksToDisplay.length === 0  && tasksToDisplay.length === submittedTodos.length? "No Tasks Added Yet" :
        showCompleted ? <a className='cursor-pointer' onClick={handleShowAllTasks} >Show All Task</a> : 
        <a className='cursor-pointer' onClick={handleShowCompleted} > Show Completed Task</a>)
         : <></>
      }
      </div>
      {!isEditting ?
      <div style={{ marginLeft: '10px' }} className='mb-10 w-full border-2'>
      {tasksToDisplay.length > 0 ? 
       
        tasksToDisplay.map((t, i) => {
          return <div key={i} className='mt-2 flex flex-col p-2'>
            <div style={{width: '40vw'}} className='card  flex border-2 border-zinc-300 rounded-md mt-2 p-3 justify-between' >
            
            <h1 className='text-xl text-white font-semibold'> <input className='w-4 h-4 mr-2 accent-black' type="checkbox" checked={t.completed}
            onChange={() => handleCheckboxChange(i)} /> {t.text}</h1>
            <div className='links'>
              <a onClick={() => handleEdit(i)} className='mr-2 text-zinc-300 font-semibold' href='#'>Edit</a>
              <a onClick={() => handleDelete(i)} className='text-zinc-300 font-semibold' href='#'>Delete</a>
            </div>
        </div>
      </div>
        }) : ""
      }
      </div> : "" }
    </div>
    <div className='border-2 h-[50vh]'>
        <h1 style={{padding: '8', paddingLeft: '0'}} className='text-3xl my-10 w-full text-white font-extrabold tracking-wide'>AI Task Suggesstions</h1>
        {/* <div style={{width: '30vw'}} className='card  flex flex-col border-2 border-zinc-300 rounded-md mt-2 p-3 justify-between' >
        <h1 className='text-xl text-white font-semibold'> First AI suggesstion</h1>
        </div> */}
        {suggestedTask && 
          <div>
            <p>{suggestedTask}</p>
          </div>
        }
        <button onClick={getSuggestedTask} style={{ marginLeft: '2px' }} className='m-3 bg-black text-white p-2 rounded-md font-medium  w-32 h-10 '>Suggest Task</button>
      </div>
    </div>
  )
}

export default App
