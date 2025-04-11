"use client"

import { Button } from "@/components/ui/button"
import type { Todo } from "@/database/schema"
import { todos as todosTable } from "@/database/schema"
import { useToken } from "@/hooks/auth-hooks"
import { useAuthenticate } from "@daveyplate/better-auth-ui"
import { neon } from "@neondatabase/serverless"
import { and, eq, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"
import { Check, Loader2, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const getDb = (token: string) => {
    const sqlClient = neon(process.env.NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL!, {
        authToken: token
    })

    // Create the Drizzle client with prepared statements
    return drizzle(sqlClient, { schema: { todos: todosTable } })
}

export default function TodoList() {
    useAuthenticate()
    const { token } = useToken()
    const [todos, setTodos] = useState<Array<Todo>>([])
    const [newTask, setNewTask] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [loadingTodoId, setLoadingTodoId] = useState<string | null>(null)

    const loadTodos = useCallback(async () => {
        if (!token) return
        setIsLoading(true)

        try {
            const db = getDb(token)
            const result = await db
                .select()
                .from(todosTable)
                .where(eq(todosTable.userId, sql`auth.user_id()`))

            setTodos(result)
        } catch (error) {
            console.error("Failed to load todos:", error)
            toast.error("Failed to load todos")
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => {
        loadTodos()
    }, [loadTodos])

    async function createTodo(e: React.FormEvent) {
        e.preventDefault()
        if (!token || !newTask.trim()) return

        setIsLoading(true)
        try {
            const db = getDb(token)
            await db.insert(todosTable).values({
                task: newTask.trim()
                // userId will be set by the DB default value using RLS
            })

            setNewTask("")
            await loadTodos()
            toast.success("Todo added")
        } catch (error) {
            console.error("Failed to create todo:", error)
            toast.error("Failed to create todo")
        } finally {
            setIsLoading(false)
        }
    }

    async function toggleComplete(todoId: bigint, isComplete: boolean) {
        if (!token) return
        setLoadingTodoId(todoId.toString())

        try {
            const db = getDb(token)
            await db
                .update(todosTable)
                .set({ isComplete: !isComplete })
                .where(and(eq(todosTable.id, todoId), eq(todosTable.userId, sql`auth.user_id()`)))

            await loadTodos()
            toast.success(isComplete ? "Todo marked as incomplete" : "Todo completed")
        } catch (error) {
            console.error("Failed to update todo:", error)
            toast.error("Failed to update todo")
        } finally {
            setLoadingTodoId(null)
        }
    }

    async function deleteTodo(todoId: bigint) {
        if (!token) return
        setLoadingTodoId(todoId.toString())

        try {
            const db = getDb(token)
            await db
                .delete(todosTable)
                .where(and(eq(todosTable.id, todoId), eq(todosTable.userId, sql`auth.user_id()`)))

            await loadTodos()
            toast.success("Todo deleted")
        } catch (error) {
            console.error("Failed to delete todo:", error)
            toast.error("Failed to delete todo")
        } finally {
            setLoadingTodoId(null)
        }
    }

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <div className="mb-8">
                <h1 className="mb-2 font-bold text-3xl">My Todos</h1>
                <p className="text-muted-foreground">Manage your tasks efficiently</p>
            </div>

            <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
                <form onSubmit={createTodo} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="What needs to be done?"
                        className="flex-grow rounded-md border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !newTask.trim()}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Add
                    </Button>
                </form>
            </div>

            {isLoading && todos.length === 0 ? (
                <div className="py-8 text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                    <p>Loading your todos...</p>
                </div>
            ) : todos.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                    <p>You don't have any todos yet. Add one to get started!</p>
                </div>
            ) : (
                <div className="divide-y rounded-lg border bg-card shadow-sm">
                    {todos.map((todo) => (
                        <div key={todo.id.toString()} className="group flex items-center gap-3 p-4">
                            <Button
                                size="icon"
                                variant={todo.isComplete ? "default" : "outline"}
                                className={`h-8 w-8 shrink-0 rounded-full ${todo.isComplete ? "bg-primary" : ""}`}
                                onClick={() => toggleComplete(todo.id, todo.isComplete)}
                                disabled={loadingTodoId === todo.id.toString()}
                            >
                                {loadingTodoId === todo.id.toString() ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check
                                        className={`h-4 w-4 ${todo.isComplete ? "text-primary-foreground" : ""}`}
                                    />
                                )}
                            </Button>

                            <span
                                className={`flex-grow ${todo.isComplete ? "text-muted-foreground line-through" : ""}`}
                            >
                                {todo.task}
                            </span>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => deleteTodo(todo.id)}
                                disabled={loadingTodoId === todo.id.toString()}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
