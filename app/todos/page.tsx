"use client"

import type { Todo } from "@/database/schema"
import { useToken } from "@/hooks/auth-hooks"
import { neon } from "@neondatabase/serverless"
import { useEffect, useState } from "react"

const getDb = (token: string) =>
    neon(process.env.NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL!, {
        authToken: token
    })

export default function TodoList() {
    const { token } = useToken()
    const [todos, setTodos] = useState<Array<Todo>>()
    const [newTask, setNewTask] = useState("")

    useEffect(() => {
        async function loadTodos() {
            if (!token) return

            const sql = getDb(token)

            // WHERE filter is optional because of RLS.
            // But we send it anyway for performance reasons.
            const todosResponse = await sql`select * from todos where user_id = auth.user_id()`

            setTodos(todosResponse as Array<Todo>)
        }

        loadTodos()
    }, [token])

    async function createTodo(e: React.FormEvent) {
        e.preventDefault()
        if (!token || !newTask.trim()) return

        const sql = getDb(token)
        await sql`insert into todos (task) values (${newTask})`

        // Reload todos
        const todosResponse = await sql`select * from todos where user_id = auth.user_id()`
        setTodos(todosResponse as Array<Todo>)

        // Clear input
        setNewTask("")
    }

    return (
        <div className="mx-auto flex flex-col justify-center gap-4 p-4">
            <form onSubmit={createTodo}>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new todo"
                    className="mr-2 rounded border p-2"
                />
                <button
                    type="submit"
                    className="rounded bg-blue-500 p-2 text-white"
                    disabled={!token || !newTask.trim()}
                >
                    Add Todo
                </button>
            </form>

            <ul>
                {todos?.map((todo) => (
                    <li key={todo.id}>{todo.task}</li>
                ))}
            </ul>
        </div>
    )
}
